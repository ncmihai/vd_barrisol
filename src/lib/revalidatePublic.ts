import { revalidatePath } from "next/cache";

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
