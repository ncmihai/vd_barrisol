import { MigrateUpArgs, MigrateDownArgs, sql } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "image_assets" ADD COLUMN "focal_x" numeric DEFAULT 50;
  ALTER TABLE "image_assets" ADD COLUMN "focal_y" numeric DEFAULT 50;`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "image_assets" DROP COLUMN "focal_x";
  ALTER TABLE "image_assets" DROP COLUMN "focal_y";`);
}
