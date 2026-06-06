import { revalidatePath } from 'next/cache'

const publicPaths = ['/', '/ro', '/en', '/ro/galerie', '/en/gallery', '/ro/despre', '/en/about']

export const revalidatePublicSite = async () => {
  for (const path of publicPaths) {
    revalidatePath(path)
  }
}
