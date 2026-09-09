import { createHmac } from "node:crypto";
import pg from "pg";
import { requireDatabaseUrl } from "@/lib/databaseUrl";

let pool: pg.Pool | undefined;
const getPool = () =>
  (pool ||= new pg.Pool({
    connectionString: requireDatabaseUrl(),
    max: 2,
    connectionTimeoutMillis: 4000,
    statement_timeout: 4000,
    query_timeout: 5000,
  }));

export const hashLeadKey = (value: string) => {
  if (!process.env.PAYLOAD_SECRET) throw new Error("Missing secret");
  return createHmac("sha256", process.env.PAYLOAD_SECRET)
    .update(value)
    .digest("hex");
};

// Atomic across Vercel instances. Only salted IP digests are stored; buckets expire after one hour.
export async function acceptLeadRequest(identity: string): Promise<boolean> {
  const db = getPool();
  await db.query("DELETE FROM lead_rate_limits WHERE expires_at < now()");
  const result = await db.query<{ hits: number }>(
    `
    INSERT INTO lead_rate_limits (key, hits, expires_at) VALUES ($1, 1, now() + interval '1 hour')
    ON CONFLICT (key) DO UPDATE SET hits = lead_rate_limits.hits + 1
    RETURNING hits`,
    [hashLeadKey(identity)],
  );
  return result.rows[0].hits <= 5;
}

export async function readLeadBody(
  request: Request,
): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > 20000)
    throw new Error("Body too large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let length = 0;
  const timer = setTimeout(() => {
    void reader.cancel();
  }, 5000);
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 20000) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Invalid body");
    return body as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}
