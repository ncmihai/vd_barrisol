import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_image_assets_intended_usage" AS ENUM('library', 'logo', 'hero', 'project', 'gallery', 'about', 'og');
  CREATE TYPE "public"."enum_image_assets_preferred_variant" AS ENUM('auto', 'original', '2k', '1080');
  CREATE TYPE "public"."enum_image_assets_upload_status" AS ENUM('draft', 'uploading', 'ready', 'failed');
  CREATE TYPE "public"."enum_image_assets_storage_provider" AS ENUM('digi_storage', 'hetzner_storage');
  CREATE TYPE "public"."enum_leads_preferred_contact" AS ENUM('whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_leads_locale" AS ENUM('ro', 'en');
  CREATE TYPE "public"."enum_pricing_settings_vat_mode" AS ENUM('not-specified', 'included', 'excluded');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "image_assets_intended_usage" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_image_assets_intended_usage",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "image_assets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"preferred_variant" "enum_image_assets_preferred_variant" DEFAULT 'auto' NOT NULL,
  	"upload_status" "enum_image_assets_upload_status" DEFAULT 'draft' NOT NULL,
  	"storage_provider" "enum_image_assets_storage_provider" DEFAULT 'digi_storage',
  	"admin_thumbnail_url" varchar,
  	"original_filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"variants_original_url" varchar,
  	"variants_original_digi_storage_path" varchar,
  	"variants_original_width" numeric,
  	"variants_original_height" numeric,
  	"variants_original_mime_type" varchar,
  	"variants_original_filesize" numeric,
  	"variants_two_k_url" varchar,
  	"variants_two_k_digi_storage_path" varchar,
  	"variants_two_k_width" numeric,
  	"variants_two_k_height" numeric,
  	"variants_two_k_mime_type" varchar,
  	"variants_two_k_filesize" numeric,
  	"variants_hd1080_url" varchar,
  	"variants_hd1080_digi_storage_path" varchar,
  	"variants_hd1080_width" numeric,
  	"variants_hd1080_height" numeric,
  	"variants_hd1080_mime_type" varchar,
  	"variants_hd1080_filesize" numeric,
  	"variants_thumbnail_url" varchar,
  	"variants_thumbnail_digi_storage_path" varchar,
  	"variants_thumbnail_width" numeric,
  	"variants_thumbnail_height" numeric,
  	"variants_thumbnail_mime_type" varchar,
  	"variants_thumbnail_filesize" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "image_assets_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"city" varchar DEFAULT 'Constanta',
  	"area_sqm" numeric,
  	"main_image_id" integer,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "projects_locales" (
  	"title" varchar NOT NULL,
  	"ceiling_type" varchar,
  	"summary" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"image_assets_id" integer
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"client_name" varchar NOT NULL,
  	"city" varchar,
  	"related_project_id" integer,
  	"image_id" integer,
  	"rating" numeric,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"headline" varchar,
  	"quote" varchar NOT NULL,
  	"story" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"city" varchar,
  	"message" varchar,
  	"preferred_contact" "enum_leads_preferred_contact" DEFAULT 'whatsapp' NOT NULL,
  	"locale" "enum_leads_locale" DEFAULT 'ro' NOT NULL,
  	"calculator_input" jsonb,
  	"pricing_snapshot" jsonb,
  	"estimate_ron_min" numeric,
  	"estimate_ron_max" numeric,
  	"estimate_eur_min" numeric,
  	"estimate_eur_max" numeric,
  	"source" varchar DEFAULT 'website-calculator',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"image_assets_id" integer,
  	"projects_id" integer,
  	"testimonials_id" integer,
  	"leads_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar DEFAULT 'VD BARRISOL' NOT NULL,
  	"domain" varchar DEFAULT 'vdbarrisol.ro' NOT NULL,
  	"logo_image_id" integer,
  	"phone" varchar,
  	"email" varchar,
  	"whatsapp_number" varchar,
  	"main_city" varchar DEFAULT 'Constanta',
  	"palette_warm_neutral" varchar DEFAULT '#E9E3DF' NOT NULL,
  	"palette_orange" varchar DEFAULT '#FF7A30' NOT NULL,
  	"palette_blue" varchar DEFAULT '#465C88' NOT NULL,
  	"palette_black" varchar DEFAULT '#000000' NOT NULL,
  	"seo_default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"service_area" varchar DEFAULT 'Constanta si proiecte in mai multe orase din Romania',
  	"seo_title" varchar NOT NULL,
  	"seo_description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_footer_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_header_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer_footer_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit_label" varchar DEFAULT 'made by NCM',
  	"credit_href" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_footer_locales" (
  	"footer_text" varchar DEFAULT 'Tavane extensibile premium pentru locuinte, spatii comerciale si proiecte cu iluminat integrat.',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_page_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "home_page_hero_slides_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_locales" (
  	"hero_eyebrow" varchar,
  	"hero_headline" varchar NOT NULL,
  	"hero_copy" varchar NOT NULL,
  	"calculator_headline" varchar NOT NULL,
  	"calculator_copy" varchar NOT NULL,
  	"contact_headline" varchar NOT NULL,
  	"contact_copy" varchar NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "gallery_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "gallery_page_locales" (
  	"headline" varchar NOT NULL,
  	"copy" varchar NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about_page_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "about_page_values_locales" (
  	"title" varchar NOT NULL,
  	"copy" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_locales" (
  	"headline" varchar NOT NULL,
  	"intro" varchar NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pricing_settings_ceiling_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"multiplier" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "pricing_settings_ceiling_types_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pricing_settings_lighting_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"fixed_ron" numeric DEFAULT 0 NOT NULL,
  	"per_sqm_ron" numeric DEFAULT 0 NOT NULL
  );
  
  CREATE TABLE "pricing_settings_lighting_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pricing_settings_complexity_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"multiplier" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "pricing_settings_complexity_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pricing_settings_city_fees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"city" varchar NOT NULL,
  	"fixed_ron" numeric DEFAULT 0 NOT NULL
  );
  
  CREATE TABLE "pricing_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"base_price_ron_per_sqm" numeric DEFAULT 180 NOT NULL,
  	"minimum_project_ron" numeric DEFAULT 1500 NOT NULL,
  	"eur_rate" numeric DEFAULT 5 NOT NULL,
  	"range_percent" numeric DEFAULT 15 NOT NULL,
  	"vat_mode" "enum_pricing_settings_vat_mode" DEFAULT 'not-specified' NOT NULL,
  	"fallback_travel_fee_ron" numeric DEFAULT 350 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pricing_settings_locales" (
  	"disclaimer" varchar DEFAULT 'Estimarea este aproximativa. Pretul final poate varia dupa masuratori, material, iluminat, acces si detaliile reale ale montajului.',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "image_assets_intended_usage" ADD CONSTRAINT "image_assets_intended_usage_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."image_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "image_assets_locales" ADD CONSTRAINT "image_assets_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."image_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_main_image_id_image_assets_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."image_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_image_assets_fk" FOREIGN KEY ("image_assets_id") REFERENCES "public"."image_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_image_id_image_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_image_assets_fk" FOREIGN KEY ("image_assets_id") REFERENCES "public"."image_assets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_image_id_image_assets_id_fk" FOREIGN KEY ("logo_image_id") REFERENCES "public"."image_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_seo_default_og_image_id_image_assets_id_fk" FOREIGN KEY ("seo_default_og_image_id") REFERENCES "public"."image_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_header_links" ADD CONSTRAINT "navigation_footer_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_header_links_locales" ADD CONSTRAINT "navigation_footer_header_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_header_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_footer_links" ADD CONSTRAINT "navigation_footer_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_footer_links_locales" ADD CONSTRAINT "navigation_footer_footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_footer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_locales" ADD CONSTRAINT "navigation_footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_image_id_image_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides_locales" ADD CONSTRAINT "home_page_hero_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_locales" ADD CONSTRAINT "home_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gallery_page_locales" ADD CONSTRAINT "gallery_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gallery_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_values" ADD CONSTRAINT "about_page_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_values_locales" ADD CONSTRAINT "about_page_values_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page_values"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_image_id_image_assets_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."image_assets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_page_locales" ADD CONSTRAINT "about_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_settings_ceiling_types" ADD CONSTRAINT "pricing_settings_ceiling_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_settings_ceiling_types_locales" ADD CONSTRAINT "pricing_settings_ceiling_types_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_settings_ceiling_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_settings_lighting_options" ADD CONSTRAINT "pricing_settings_lighting_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_settings_lighting_options_locales" ADD CONSTRAINT "pricing_settings_lighting_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_settings_lighting_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_settings_complexity_options" ADD CONSTRAINT "pricing_settings_complexity_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_settings_complexity_options_locales" ADD CONSTRAINT "pricing_settings_complexity_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_settings_complexity_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_settings_city_fees" ADD CONSTRAINT "pricing_settings_city_fees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_settings_locales" ADD CONSTRAINT "pricing_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "image_assets_intended_usage_order_idx" ON "image_assets_intended_usage" USING btree ("order");
  CREATE INDEX "image_assets_intended_usage_parent_idx" ON "image_assets_intended_usage" USING btree ("parent_id");
  CREATE INDEX "image_assets_upload_status_idx" ON "image_assets" USING btree ("upload_status");
  CREATE INDEX "image_assets_updated_at_idx" ON "image_assets" USING btree ("updated_at");
  CREATE INDEX "image_assets_created_at_idx" ON "image_assets" USING btree ("created_at");
  CREATE UNIQUE INDEX "image_assets_locales_locale_parent_id_unique" ON "image_assets_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_main_image_idx" ON "projects" USING btree ("main_image_id");
  CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_image_assets_id_idx" ON "projects_rels" USING btree ("image_assets_id");
  CREATE INDEX "testimonials_related_project_idx" ON "testimonials" USING btree ("related_project_id");
  CREATE INDEX "testimonials_image_idx" ON "testimonials" USING btree ("image_id");
  CREATE INDEX "testimonials_featured_idx" ON "testimonials" USING btree ("featured");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_image_assets_id_idx" ON "payload_locked_documents_rels" USING btree ("image_assets_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_image_idx" ON "site_settings" USING btree ("logo_image_id");
  CREATE INDEX "site_settings_seo_seo_default_og_image_idx" ON "site_settings" USING btree ("seo_default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_header_links_order_idx" ON "navigation_footer_header_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_header_links_parent_id_idx" ON "navigation_footer_header_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_header_links_locales_locale_parent_id_uniq" ON "navigation_footer_header_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_footer_links_order_idx" ON "navigation_footer_footer_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_footer_links_parent_id_idx" ON "navigation_footer_footer_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_footer_links_locales_locale_parent_id_uniq" ON "navigation_footer_footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_locales_locale_parent_id_unique" ON "navigation_footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_hero_slides_order_idx" ON "home_page_hero_slides" USING btree ("_order");
  CREATE INDEX "home_page_hero_slides_parent_id_idx" ON "home_page_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_slides_image_idx" ON "home_page_hero_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "home_page_hero_slides_locales_locale_parent_id_unique" ON "home_page_hero_slides_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "home_page_locales_locale_parent_id_unique" ON "home_page_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "gallery_page_locales_locale_parent_id_unique" ON "gallery_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_values_order_idx" ON "about_page_values" USING btree ("_order");
  CREATE INDEX "about_page_values_parent_id_idx" ON "about_page_values" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "about_page_values_locales_locale_parent_id_unique" ON "about_page_values_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_page_image_idx" ON "about_page" USING btree ("image_id");
  CREATE UNIQUE INDEX "about_page_locales_locale_parent_id_unique" ON "about_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_settings_ceiling_types_order_idx" ON "pricing_settings_ceiling_types" USING btree ("_order");
  CREATE INDEX "pricing_settings_ceiling_types_parent_id_idx" ON "pricing_settings_ceiling_types" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pricing_settings_ceiling_types_locales_locale_parent_id_uniq" ON "pricing_settings_ceiling_types_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_settings_lighting_options_order_idx" ON "pricing_settings_lighting_options" USING btree ("_order");
  CREATE INDEX "pricing_settings_lighting_options_parent_id_idx" ON "pricing_settings_lighting_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pricing_settings_lighting_options_locales_locale_parent_id_u" ON "pricing_settings_lighting_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_settings_complexity_options_order_idx" ON "pricing_settings_complexity_options" USING btree ("_order");
  CREATE INDEX "pricing_settings_complexity_options_parent_id_idx" ON "pricing_settings_complexity_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pricing_settings_complexity_options_locales_locale_parent_id" ON "pricing_settings_complexity_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_settings_city_fees_order_idx" ON "pricing_settings_city_fees" USING btree ("_order");
  CREATE INDEX "pricing_settings_city_fees_parent_id_idx" ON "pricing_settings_city_fees" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pricing_settings_locales_locale_parent_id_unique" ON "pricing_settings_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "image_assets_intended_usage" CASCADE;
  DROP TABLE "image_assets" CASCADE;
  DROP TABLE "image_assets_locales" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "navigation_footer_header_links" CASCADE;
  DROP TABLE "navigation_footer_header_links_locales" CASCADE;
  DROP TABLE "navigation_footer_footer_links" CASCADE;
  DROP TABLE "navigation_footer_footer_links_locales" CASCADE;
  DROP TABLE "navigation_footer" CASCADE;
  DROP TABLE "navigation_footer_locales" CASCADE;
  DROP TABLE "home_page_hero_slides" CASCADE;
  DROP TABLE "home_page_hero_slides_locales" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_locales" CASCADE;
  DROP TABLE "gallery_page" CASCADE;
  DROP TABLE "gallery_page_locales" CASCADE;
  DROP TABLE "about_page_values" CASCADE;
  DROP TABLE "about_page_values_locales" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "about_page_locales" CASCADE;
  DROP TABLE "pricing_settings_ceiling_types" CASCADE;
  DROP TABLE "pricing_settings_ceiling_types_locales" CASCADE;
  DROP TABLE "pricing_settings_lighting_options" CASCADE;
  DROP TABLE "pricing_settings_lighting_options_locales" CASCADE;
  DROP TABLE "pricing_settings_complexity_options" CASCADE;
  DROP TABLE "pricing_settings_complexity_options_locales" CASCADE;
  DROP TABLE "pricing_settings_city_fees" CASCADE;
  DROP TABLE "pricing_settings" CASCADE;
  DROP TABLE "pricing_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_image_assets_intended_usage";
  DROP TYPE "public"."enum_image_assets_preferred_variant";
  DROP TYPE "public"."enum_image_assets_upload_status";
  DROP TYPE "public"."enum_image_assets_storage_provider";
  DROP TYPE "public"."enum_leads_preferred_contact";
  DROP TYPE "public"."enum_leads_locale";
  DROP TYPE "public"."enum_pricing_settings_vat_mode";`)
}
