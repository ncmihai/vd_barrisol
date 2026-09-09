import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { ImageAssets } from "@/collections/ImageAssets";
import { Leads } from "@/collections/Leads";
import { Projects } from "@/collections/Projects";
import { Testimonials } from "@/collections/Testimonials";
import { Users } from "@/collections/Users";
import { AboutPage } from "@/globals/AboutPage";
import { GalleryPage } from "@/globals/GalleryPage";
import { HomePage } from "@/globals/HomePage";
import { NavigationFooter } from "@/globals/NavigationFooter";
import { PricingSettings } from "@/globals/PricingSettings";
import { SiteSettings } from "@/globals/SiteSettings";
import { Services } from "@/globals/Services";
import { getDatabaseUrl, requireDatabaseUrl } from "@/lib/databaseUrl";
import { migrations } from "@/migrations";
import { timeoutSetting } from "@/lib/timeouts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const payloadSecret = process.env.PAYLOAD_SECRET;
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
const databaseUrl =
  process.env.NODE_ENV === "production" && !isProductionBuild
    ? requireDatabaseUrl()
    : getDatabaseUrl();

if (!payloadSecret && process.env.NODE_ENV === "production") {
  throw new Error("PAYLOAD_SECRET is required in production.");
}

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      graphics: {
        Icon: "@/components/admin/VDBAdminLogo#VDBAdminIcon",
        Logo: "@/components/admin/VDBAdminLogo#VDBAdminLogo",
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, ImageAssets, Projects, Testimonials, Leads],
  db: postgresAdapter({
    prodMigrations:
      process.env.PAYLOAD_RUN_MIGRATIONS === "1" ? migrations : undefined,
    push: false,
    pool: {
      connectionString: databaseUrl,
      connectionTimeoutMillis: timeoutSetting(
        process.env.POSTGRES_CONNECT_TIMEOUT_MS,
        5000,
      ),
      statement_timeout: 6000,
      query_timeout: 7000,
      idle_in_transaction_session_timeout: 8000,
      max: 5,
    },
  }),
  editor: lexicalEditor(),
  globals: [
    SiteSettings,
    NavigationFooter,
    HomePage,
    GalleryPage,
    AboutPage,
    PricingSettings,
    Services,
  ],
  graphQL: {
    disable: true,
  },
  localization: {
    defaultLocale: "ro",
    fallback: true,
    locales: [
      {
        code: "ro",
        label: "Romana",
      },
      {
        code: "en",
        label: "English",
      },
    ],
  },
  secret: payloadSecret || "development-only-payload-secret",
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
