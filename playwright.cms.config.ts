import { defineConfig } from "@playwright/test";

const database = process.env.DATABASE_URL || "";
if (
  !/^postgres(?:ql)?:\/\/[^@]+@(localhost|127\.0\.0\.1):\d+\/[^?]*audit/.test(
    database,
  )
)
  throw new Error(
    "CMS browser tests require a disposable local audit database.",
  );
export default defineConfig({
  testDir: "./tests/cms",
  outputDir: "./test-results/cms",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3026",
    extraHTTPHeaders: { "x-forwarded-for": `local-audit-${Date.now()}` },
  },
  webServer: {
    command: "npm run start -- --port 3026",
    url: "http://127.0.0.1:3026/ro",
    reuseExistingServer: false,
    env: {
      DATABASE_URL: database,
      PAYLOAD_SECRET: "local-audit-secret",
      VDB_FORCE_STATIC_FALLBACK: "0",
      VDB_CONTENT_MODE: "live",
      RESEND_API_KEY: "",
      CONTACT_TO_EMAIL: "",
    },
  },
});
