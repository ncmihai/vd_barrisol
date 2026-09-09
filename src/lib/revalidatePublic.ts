import { revalidatePath, revalidateTag } from "next/cache";

const publicPaths = [
  "/",
  "/ro",
  "/en",
  "/ro/galerie",
  "/en/gallery",
  "/ro/despre",
  "/en/about",
];

export const revalidatePublicSite = async () => {
  try {
    revalidateTag("public-site", { expire: 0 });
    revalidatePath("/[locale]", "layout");
    revalidatePath("/sitemap.xml");
  } catch {
    /* CLI migrations have no Next request context. */
  }
  for (const path of publicPaths) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.warn(
        "[revalidate] skipped public path",
        path,
        error instanceof Error ? error.message : error,
      );
    }
  }
};
