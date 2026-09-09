import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE lead_rate_limits (key varchar PRIMARY KEY, hits integer NOT NULL, expires_at timestamptz NOT NULL);
   CREATE INDEX lead_rate_limits_expiry_idx ON lead_rate_limits(expires_at);
   CREATE TYPE "public"."enum_projects_publication" AS ENUM('draft', 'demo', 'published');
  CREATE TYPE "public"."enum_projects_audience" AS ENUM('residential', 'commercial');
  CREATE TYPE "public"."enum_leads_notification_status" AS ENUM('pending', 'sent', 'failed', 'skipped');
  CREATE TYPE "public"."enum_home_page_motion_preset" AS ENUM('off', 'stretch');
  CREATE TABLE "services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"custom_quote" boolean DEFAULT true
  );
  
  CREATE TABLE "services_items_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services_process_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false
  );
  
  CREATE TABLE "services_faq_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"architects_enabled" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "services_locales" (
  	"architects_title" varchar,
  	"architects_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP INDEX "projects_slug_idx";
  ALTER TABLE "projects" ADD COLUMN "publication" "enum_projects_publication" DEFAULT 'draft' NOT NULL;
  ALTER TABLE "projects" ADD COLUMN "audience" "enum_projects_audience";
  ALTER TABLE "projects" ADD COLUMN "finish_id" varchar;
  ALTER TABLE "projects" ADD COLUMN "lighting_id" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "details" varchar;
  ALTER TABLE "projects_locales" ADD COLUMN "technical_details" varchar;
  ALTER TABLE "testimonials" ADD COLUMN "approved" boolean DEFAULT false;
  ALTER TABLE "leads" ADD COLUMN "request_key" varchar;
  ALTER TABLE "leads" ADD COLUMN "notification_status" "enum_leads_notification_status" DEFAULT 'pending';
  ALTER TABLE "home_page" ADD COLUMN "motion_preset" "enum_home_page_motion_preset" DEFAULT 'off';
  ALTER TABLE "pricing_settings" ADD COLUMN "approved" boolean DEFAULT false;
  ALTER TABLE "services_items" ADD CONSTRAINT "services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_items_locales" ADD CONSTRAINT "services_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_process" ADD CONSTRAINT "services_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_process_locales" ADD CONSTRAINT "services_process_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq_locales" ADD CONSTRAINT "services_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_items_order_idx" ON "services_items" USING btree ("_order");
  CREATE INDEX "services_items_parent_id_idx" ON "services_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_items_locales_locale_parent_id_unique" ON "services_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_process_order_idx" ON "services_process" USING btree ("_order");
  CREATE INDEX "services_process_parent_id_idx" ON "services_process" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_process_locales_locale_parent_id_unique" ON "services_process_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_faq_locales_locale_parent_id_unique" ON "services_faq_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "leads_request_key_idx" ON "leads" USING btree ("request_key");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE lead_rate_limits;
   ALTER TABLE "services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_process_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_items" CASCADE;
  DROP TABLE "services_items_locales" CASCADE;
  DROP TABLE "services_process" CASCADE;
  DROP TABLE "services_process_locales" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services_faq_locales" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP INDEX "leads_request_key_idx";
  DROP INDEX "projects_slug_idx";
  CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  ALTER TABLE "projects" DROP COLUMN "publication";
  ALTER TABLE "projects" DROP COLUMN "audience";
  ALTER TABLE "projects" DROP COLUMN "finish_id";
  ALTER TABLE "projects" DROP COLUMN "lighting_id";
  ALTER TABLE "projects_locales" DROP COLUMN "details";
  ALTER TABLE "projects_locales" DROP COLUMN "technical_details";
  ALTER TABLE "testimonials" DROP COLUMN "approved";
  ALTER TABLE "leads" DROP COLUMN "request_key";
  ALTER TABLE "leads" DROP COLUMN "notification_status";
  ALTER TABLE "home_page" DROP COLUMN "motion_preset";
  ALTER TABLE "pricing_settings" DROP COLUMN "approved";
  DROP TYPE "public"."enum_projects_publication";
  DROP TYPE "public"."enum_projects_audience";
  DROP TYPE "public"."enum_leads_notification_status";
  DROP TYPE "public"."enum_home_page_motion_preset";`);
}
