export const DIGI_STORAGE_PROVIDER = "digi_storage" as const;

const defaultBaseUrl = "https://storage.rcs-rds.ro";
const defaultBasePath = "vd-barrisol/images";
const defaultImageMaxBytes = 25 * 1024 * 1024;

type DigiAuthState = {
  mountId: string;
  token: string;
};

type DigiConfig = {
  apiUrl: string;
  basePath: string;
  baseUrl: string;
  email: string;
  mountId?: string;
  password: string;
};

type DigiPreparedUploadInput = {
  objectPath: string;
};

type DigiUploadLinkResponse = {
  link?: string;
};

type DigiDownloadLinkResponse = {
  link?: string;
};

type DigiMountResponse = {
  id?: string | number;
  mount_id?: string | number;
};

type DigiMountsResponse =
  | DigiMountResponse[]
  | {
      mounts?: DigiMountResponse[];
    };

let cachedAuth: Promise<DigiAuthState> | undefined;

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, "");

const getRequiredEnv = (names: string[]) => {
  const value = names.map((name) => process.env[name]?.trim()).find(Boolean);

  if (!value) {
    throw new Error(
      `Missing Digi Storage env var. Set one of: ${names.join(", ")}.`,
    );
  }

  return value;
};

const getConfig = (): DigiConfig => {
  const baseUrl = (process.env.DIGI_STORAGE_BASE_URL || defaultBaseUrl).replace(
    /\/+$/g,
    "",
  );
  const apiUrl = (
    process.env.DIGI_STORAGE_API_URL || `${baseUrl}/api/v2.1`
  ).replace(/\/+$/g, "");
  const basePath =
    process.env.DIGI_STORAGE_BASE_PATH ||
    process.env.ASSET_FTP_BASE_PATH ||
    defaultBasePath;

  return {
    apiUrl,
    basePath: trimSlashes(basePath),
    baseUrl,
    email: getRequiredEnv([
      "DIGI_STORAGE_EMAIL",
      "DIGI_EMAIL",
      "ASSET_FTP_USERNAME",
    ]),
    mountId: process.env.DIGI_STORAGE_MOUNT_ID?.trim() || undefined,
    password: getRequiredEnv([
      "DIGI_STORAGE_PASSWORD",
      "DIGI_PASSWORD",
      "ASSET_FTP_PASSWORD",
    ]),
  };
};

export const getDigiImageMaxBytes = () => {
  const configured = Number(process.env.DIGI_IMAGE_MAX_BYTES);

  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultImageMaxBytes;
};

const digiFetch = async <T>(
  url: string,
  init: RequestInit = {},
  auth?: DigiAuthState,
): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(6000),
    headers: {
      accept: "application/json",
      ...(auth ? { authorization: `Token token="${auth.token}"` } : {}),
      ...(init.body && !(init.body instanceof FormData)
        ? { "content-type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Digi Storage request failed (${response.status})${text ? `: ${text.slice(0, 500)}` : ""}`,
    );
  }

  return (text.trim() ? JSON.parse(text) : {}) as T;
};

const authenticate = async (): Promise<DigiAuthState> => {
  const config = getConfig();
  const auth = await digiFetch<{ token?: string }>(`${config.baseUrl}/token`, {
    body: JSON.stringify({
      email: config.email,
      password: config.password,
    }),
    method: "POST",
  });

  if (!auth.token) {
    throw new Error("Digi Storage did not return an auth token.");
  }

  if (config.mountId) {
    return {
      mountId: config.mountId,
      token: auth.token,
    };
  }

  const mountsResponse = await digiFetch<DigiMountsResponse>(
    `${config.apiUrl}/mounts?type=device`,
    {},
    {
      mountId: "",
      token: auth.token,
    },
  );
  const mounts = Array.isArray(mountsResponse)
    ? mountsResponse
    : mountsResponse.mounts || [];
  const mountId = mounts[0]?.id ?? mounts[0]?.mount_id;

  if (!mountId) {
    throw new Error("Digi Storage did not return a mount ID.");
  }

  return {
    mountId: String(mountId),
    token: auth.token,
  };
};

const getAuth = () => {
  cachedAuth ||= authenticate();

  return cachedAuth;
};

const withAuthRetry = async <T>(
  operation: (auth: DigiAuthState) => Promise<T>,
) => {
  try {
    return await operation(await getAuth());
  } catch (error) {
    cachedAuth = undefined;

    if (error instanceof Error && /401|403|auth|token/i.test(error.message)) {
      return operation(await getAuth());
    }

    throw error;
  }
};

const infoExists = async (auth: DigiAuthState, path: string) => {
  const config = getConfig();
  const response = await fetch(
    `${config.apiUrl}/mounts/${encodeURIComponent(auth.mountId)}/files/info?path=${encodeURIComponent(path)}`,
    {
      signal: AbortSignal.timeout(6000),
      headers: {
        accept: "application/json",
        authorization: `Token token="${auth.token}"`,
      },
    },
  );

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    const details = await response.text().catch(() => "");

    throw new Error(
      `Digi Storage folder lookup failed (${response.status})${details ? `: ${details.slice(0, 500)}` : ""}`,
    );
  }

  return true;
};

const createFolder = async (
  auth: DigiAuthState,
  parentPath: string,
  name: string,
) => {
  const config = getConfig();
  const response = await fetch(
    `${config.apiUrl}/mounts/${encodeURIComponent(auth.mountId)}/files/folder?path=${encodeURIComponent(parentPath)}`,
    {
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({ name }),
      headers: {
        accept: "application/json",
        authorization: `Token token="${auth.token}"`,
        "content-type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok && response.status !== 409) {
    const details = await response.text().catch(() => "");

    throw new Error(
      `Digi Storage folder create failed (${response.status})${details ? `: ${details.slice(0, 500)}` : ""}`,
    );
  }
};

const ensureFolder = async (auth: DigiAuthState, folderPath: string) => {
  const parts = trimSlashes(folderPath).split("/").filter(Boolean);
  let currentPath = "";

  for (const part of parts) {
    const parentPath = currentPath ? `/${currentPath}` : "/";
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    const targetPath = `/${currentPath}`;

    if (!(await infoExists(auth, targetPath))) {
      await createFolder(auth, parentPath, part);
    }
  }
};

const getRemotePath = (objectPath: string) => {
  const config = getConfig();
  const combined = [config.basePath, trimSlashes(objectPath)]
    .filter(Boolean)
    .join("/");

  return `/${combined}`;
};

export const prepareDigiStorageUpload = async ({
  objectPath,
}: DigiPreparedUploadInput) =>
  withAuthRetry(async (auth) => {
    const config = getConfig();
    const remotePath = getRemotePath(objectPath);
    const folderPath =
      remotePath.slice(0, remotePath.lastIndexOf("/") + 1) || "/";
    const filename = remotePath.slice(remotePath.lastIndexOf("/") + 1);

    await ensureFolder(auth, folderPath);

    const uploadTarget = await digiFetch<DigiUploadLinkResponse>(
      `${config.apiUrl}/mounts/${encodeURIComponent(auth.mountId)}/files/upload?path=${encodeURIComponent(folderPath)}`,
      {},
      auth,
    );

    if (!uploadTarget.link) {
      throw new Error("Digi Storage did not return an upload URL.");
    }

    return {
      filename,
      storagePath: remotePath,
      storageProvider: DIGI_STORAGE_PROVIDER,
      uploadUrl: uploadTarget.link,
    };
  });

export const getDigiStorageDownloadLink = async (storagePath: string) =>
  withAuthRetry(async (auth) => {
    const config = getConfig();
    const normalizedPath = storagePath.startsWith("/")
      ? storagePath
      : `/${trimSlashes(storagePath)}`;
    const downloadTarget = await digiFetch<DigiDownloadLinkResponse>(
      `${config.apiUrl}/mounts/${encodeURIComponent(auth.mountId)}/files/download?path=${encodeURIComponent(normalizedPath)}`,
      {},
      auth,
    );

    if (!downloadTarget.link) {
      throw new Error("Digi Storage did not return a download URL.");
    }

    return downloadTarget.link;
  });

export const deleteDigiStorageFile = async (storagePath: string) =>
  withAuthRetry(async (auth) => {
    const config = getConfig();
    const normalizedPath = storagePath.startsWith("/")
      ? storagePath
      : `/${trimSlashes(storagePath)}`;
    const response = await fetch(
      `${config.apiUrl}/mounts/${encodeURIComponent(auth.mountId)}/files/remove?path=${encodeURIComponent(normalizedPath)}`,
      {
        signal: AbortSignal.timeout(6000),
        headers: {
          accept: "application/json",
          authorization: `Token token="${auth.token}"`,
        },
        method: "DELETE",
      },
    );

    if (response.status === 404) {
      return {
        deleted: false,
        storagePath: normalizedPath,
      };
    }

    if (!response.ok) {
      const details = await response.text().catch(() => "");

      throw new Error(
        `Digi Storage delete failed (${response.status})${details ? `: ${details.slice(0, 500)}` : ""}`,
      );
    }

    return {
      deleted: true,
      storagePath: normalizedPath,
    };
  });

export const createDigiImageObjectPath = ({
  extension,
  filename,
  imageAssetId,
  variant,
}: {
  extension: string;
  filename: string;
  imageAssetId: string;
  variant: "original" | "2k" | "1080" | "thumbnail";
}) => {
  const normalizedExtension = extension.startsWith(".")
    ? extension
    : `.${extension}`;
  const safeStem =
    filename
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";
  const safeId = imageAssetId.replace(/[^a-z0-9_-]+/gi, "-");

  return `images/${safeId}/${Date.now()}-${safeStem}-${variant}${normalizedExtension}`;
};
