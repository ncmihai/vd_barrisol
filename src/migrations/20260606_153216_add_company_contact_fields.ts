import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_service_cities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings_service_cities_locales" (
  	"city" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings" ALTER COLUMN "phone" SET DEFAULT '0793 124 425';
  ALTER TABLE "site_settings" ALTER COLUMN "email" SET DEFAULT 'vdbarrisol@gmail.com';
  ALTER TABLE "site_settings" ALTER COLUMN "whatsapp_number" SET DEFAULT '40793124425';
  ALTER TABLE "site_settings_locales" ALTER COLUMN "service_area" SET DEFAULT 'Mamaia-Sat, Valu lui Traian, Constanta, Mamaia, Cumpana, Navodari, Agigea, Lazu, Mangalia si Murfatlar';
  ALTER TABLE "site_settings" ADD COLUMN "facebook_url" varchar DEFAULT 'https://www.facebook.com/p/VD-Barrisol-61564327003788/';
  ALTER TABLE "site_settings" ADD COLUMN "instagram_url" varchar DEFAULT 'https://www.instagram.com/vd_barrisol/';
  ALTER TABLE "site_settings" ADD COLUMN "legal_name" varchar DEFAULT 'VD BARRISOL S.R.L.';
  ALTER TABLE "site_settings" ADD COLUMN "registration_number" varchar DEFAULT 'CUI 51496619';
  ALTER TABLE "site_settings_service_cities" ADD CONSTRAINT "site_settings_service_cities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_service_cities_locales" ADD CONSTRAINT "site_settings_service_cities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_service_cities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_service_cities_order_idx" ON "site_settings_service_cities" USING btree ("_order");
  CREATE INDEX "site_settings_service_cities_parent_id_idx" ON "site_settings_service_cities" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_service_cities_locales_locale_parent_id_unique" ON "site_settings_service_cities_locales" USING btree ("_locale","_parent_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_service_cities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_service_cities_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_service_cities" CASCADE;
  DROP TABLE "site_settings_service_cities_locales" CASCADE;
  ALTER TABLE "site_settings" ALTER COLUMN "phone" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "email" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "whatsapp_number" DROP DEFAULT;
  ALTER TABLE "site_settings_locales" ALTER COLUMN "service_area" SET DEFAULT 'Constanta si proiecte in mai multe orase din Romania';
  ALTER TABLE "site_settings" DROP COLUMN "facebook_url";
  ALTER TABLE "site_settings" DROP COLUMN "instagram_url";
  ALTER TABLE "site_settings" DROP COLUMN "legal_name";
  ALTER TABLE "site_settings" DROP COLUMN "registration_number";`);
}
