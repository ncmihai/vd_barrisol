import type { CollectionAfterDeleteHook } from 'payload'

import { deleteStorageFile } from '@/lib/storage'

type ImageAssetWithVariants = {
  variants?: {
    hd1080?: { digiStoragePath?: string | null } | null
    original?: { digiStoragePath?: string | null } | null
    thumbnail?: { digiStoragePath?: string | null } | null
    twoK?: { digiStoragePath?: string | null } | null
  } | null
}

const collectImageAssetPaths = (doc: ImageAssetWithVariants) =>
  Array.from(
    new Set(
      [
        doc.variants?.original?.digiStoragePath,
        doc.variants?.twoK?.digiStoragePath,
        doc.variants?.hd1080?.digiStoragePath,
        doc.variants?.thumbnail?.digiStoragePath,
      ].filter((path): path is string => Boolean(path)),
    ),
  )

export const cleanupDeletedImageAssetFiles: CollectionAfterDeleteHook = async ({ doc, id, req }) => {
  const paths = collectImageAssetPaths(doc as ImageAssetWithVariants)

  if (paths.length > 0) {
    const results = await Promise.allSettled(paths.map((path) => deleteStorageFile(path)))

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        req.payload.logger.error({
          imageAssetId: id,
          message:
            result.reason instanceof Error ? result.reason.message : 'Unknown storage delete error',
          storagePath: paths[index],
        })
      }
    })
  }

  return doc
}
