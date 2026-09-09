import config from "@payload-config";
import { NextResponse, type NextRequest } from "next/server";
import { getPayload } from "payload";

import { getStorageDownloadLink } from "@/lib/storage";
import { withDeadline } from "@/lib/timeouts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ImageVariantName = "original" | "2k" | "1080" | "thumbnail";

type StoredImageVariant = {
  digiStoragePath?: string | null;
  filesize?: number | null;
  height?: number | null;
  mimeType?: string | null;
  url?: string | null;
  width?: number | null;
};

type StoredImageAsset = {
  preferredVariant?: "auto" | ImageVariantName | null;
  storageProvider?: string | null;
  uploadStatus?: string | null;
  variants?: {
    hd1080?: StoredImageVariant | null;
    original?: StoredImageVariant | null;
    thumbnail?: StoredImageVariant | null;
    twoK?: StoredImageVariant | null;
  } | null;
};

const requestedVariants = new Set<ImageVariantName>([
  "original",
  "2k",
  "1080",
  "thumbnail",
]);

const variantKeyMap = {
  "1080": "hd1080",
  "2k": "twoK",
  original: "original",
  thumbnail: "thumbnail",
} as const satisfies Record<
  ImageVariantName,
  keyof NonNullable<StoredImageAsset["variants"]>
>;

const resolveVariant = (
  imageAsset: StoredImageAsset,
  requestedVariant: string | null,
): StoredImageVariant | null => {
  const preferredVariant =
    requestedVariant &&
    requestedVariants.has(requestedVariant as ImageVariantName)
      ? (requestedVariant as ImageVariantName)
      : imageAsset.preferredVariant && imageAsset.preferredVariant !== "auto"
        ? imageAsset.preferredVariant
        : "2k";
  const variants = imageAsset.variants || {};
  const candidates: Array<StoredImageVariant | null | undefined> = [
    variants[variantKeyMap[preferredVariant]],
    variants.twoK,
    variants.hd1080,
    variants.original,
    variants.thumbnail,
  ];

  return (
    candidates.find((variant) => Boolean(variant?.digiStoragePath)) || null
  );
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const payload = await withDeadline(getPayload({ config }));
    const item = (await payload.findByID({
      collection: "image-assets",
      id,
      overrideAccess: true,
    })) as StoredImageAsset;

    const variant = resolveVariant(
      item,
      request.nextUrl.searchParams.get("variant"),
    );

    if (item.uploadStatus !== "ready" || !variant?.digiStoragePath) {
      return NextResponse.json(
        { error: "Image asset is not available." },
        { status: 404 },
      );
    }

    const downloadLink = await withDeadline(
      getStorageDownloadLink({
        provider: item.storageProvider,
        storagePath: variant.digiStoragePath,
      }),
    );
    const downloadResponse = await fetch(downloadLink, {
      signal: AbortSignal.timeout(8000),
    });

    if (!downloadResponse.ok || !downloadResponse.body) {
      return NextResponse.json(
        { error: "Image asset could not be fetched." },
        { status: 502 },
      );
    }

    return new Response(downloadResponse.body, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
        "Content-Type":
          variant.mimeType ||
          downloadResponse.headers.get("content-type") ||
          "image/webp",
        "X-Content-Type-Options": "nosniff",
      },
      status: 200,
    });
  } catch (error) {
    const status =
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 404
        ? 404
        : 502;
    return NextResponse.json(
      { error: "Image asset is not available." },
      { status },
    );
  }
}
