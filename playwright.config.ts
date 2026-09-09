import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/ui",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3025", trace: "retain-on-failure" },
  webServer: {
    command: "npm run start -- --port 3025",
    url: "http://127.0.0.1:3025/ro",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      VDB_FORCE_STATIC_FALLBACK: "1",
      VDB_CONTENT_MODE: "demo",
      PAYLOAD_SECRET: "browser-test-secret",
      RESEND_API_KEY: "",
      CONTACT_TO_EMAIL: "",
    },
  },
});
