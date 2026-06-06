import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { deleteStorageFile, STORAGE_PROVIDER } from '@/lib/storage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type ImageVariantName = 'original' | '2k' | '1080' | 'thumbnail'

type CompletedImageVariant = {
  digiStoragePath?: string
  filesize?: number
  height?: number
  mimeType?: string
  url?: string
  variant?: ImageVariantName
  width?: number
}

const variantNames = new Set<ImageVariantName>(['original', '2k', '1080', 'thumbnail'])

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const normalizeStoragePath = (storagePath: string) =>
  storagePath.startsWith('/') ? storagePath : `/${storagePath.replace(/^\/+/, '')}`

const getVariantPayload = (variant: CompletedImageVariant) => ({
  digiStoragePath: normalizeStoragePath(String(variant.digiStoragePath || '').trim()),
  filesize: Number(variant.filesize),
  height: Number(variant.height),
  mimeType: String(variant.mimeType || '').trim().toLowerCase(),
  url: String(variant.url || '').trim(),
  width: Number(variant.width),
})

const collectImageAssetPaths = (doc: {
  variants?: {
    hd1080?: { digiStoragePath?: string | null }
    original?: { digiStoragePath?: string | null }
    thumbnail?: { digiStoragePath?: string | null }
    twoK?: { digiStoragePath?: string | null }
  } | null
}) =>
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

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const authResult = await payload.auth({ headers: request.headers })

  if (!authResult.user) {
    return errorResponse('Authentication required.', 401)
  }

  const body = (await request.json().catch(() => ({}))) as {
    imageAssetId?: number | string
    originalFilename?: string
    variants?: CompletedImageVariant[]
  }
  const imageAssetId = String(body.imageAssetId || '').trim()
  const originalFilename = String(body.originalFilename || '').trim()
  const completedVariants = Array.isArray(body.variants) ? body.variants : []
  const safeId = imageAssetId.replace(/[^a-z0-9_-]+/gi, '-')

  if (!imageAssetId) {
    return errorResponse('Image Asset is missing.')
  }

  if (!originalFilename) {
    return errorResponse('Original filename is missing.')
  }

  if (completedVariants.length !== 4) {
    return errorResponse('Image upload completion must include all four variants.')
  }

  const variantsByName = new Map<ImageVariantName, ReturnType<typeof getVariantPayload>>()

  for (const variant of completedVariants) {
    const variantName = variant.variant

    if (!variantName || !variantNames.has(variantName)) {
      return errorResponse('Image variant is invalid.')
    }

    const payloadVariant = getVariantPayload(variant)

    if (!payloadVariant.digiStoragePath.includes(`/images/${safeId}/`)) {
      return errorResponse(`${variantName} image path does not match this Image Asset.`)
    }

    if (
      !payloadVariant.url ||
      !Number.isFinite(payloadVariant.filesize) ||
      payloadVariant.filesize <= 0 ||
      !Number.isFinite(payloadVariant.width) ||
      payloadVariant.width <= 0 ||
      !Number.isFinite(payloadVariant.height) ||
      payloadVariant.height <= 0 ||
      !payloadVariant.mimeType
    ) {
      return errorResponse(`${variantName} image metadata is incomplete.`)
    }

    variantsByName.set(variantName, payloadVariant)
  }

  for (const variantName of variantNames) {
    if (!variantsByName.has(variantName)) {
      return errorResponse(`Missing ${variantName} image variant.`)
    }
  }

  try {
    const existingImageAsset = await payload.findByID({
      collection: 'image-assets',
      id: imageAssetId,
      overrideAccess: true,
    })
    const previousPaths = collectImageAssetPaths(existingImageAsset as Parameters<typeof collectImageAssetPaths>[0])
    const original = variantsByName.get('original')
    const twoK = variantsByName.get('2k')
    const hd1080 = variantsByName.get('1080')
    const thumbnail = variantsByName.get('thumbnail')

    if (!original || !twoK || !hd1080 || !thumbnail) {
      return errorResponse('Completed image variants are incomplete.')
    }

    const variants = {
      hd1080,
      original,
      thumbnail,
      twoK,
    }
    const updatedImageAsset = await payload.update({
      collection: 'image-assets',
      id: imageAssetId,
      overrideAccess: true,
      data: {
        adminThumbnailUrl: thumbnail.url,
        filesize: original.filesize,
        height: original.height,
        mimeType: original.mimeType,
        originalFilename,
        storageProvider: STORAGE_PROVIDER.digi,
        uploadStatus: 'ready',
        variants,
        width: original.width,
      },
    })
    const nextPaths = new Set(collectImageAssetPaths({ variants }))
    let cleanupWarning = ''

    const pathsToDelete = previousPaths.filter((path) => !nextPaths.has(path))

    if (pathsToDelete.length > 0) {
      const results = await Promise.allSettled(pathsToDelete.map((path) => deleteStorageFile(path)))
      const failed = results.filter((result) => result.status === 'rejected')

      if (failed.length > 0) {
        cleanupWarning = 'Some old image files could not be deleted automatically.'
      }
    }

    return NextResponse.json({
      ...(cleanupWarning ? { cleanupWarning } : {}),
      adminThumbnailUrl: thumbnail.url,
      filesize: original.filesize,
      height: original.height,
      id: updatedImageAsset.id,
      mimeType: original.mimeType,
      originalFilename,
      storageProvider: STORAGE_PROVIDER.digi,
      uploadStatus: 'ready',
      updatedAt: updatedImageAsset.updatedAt,
      variants,
      width: original.width,
    })
  } catch (error) {
    await payload
      .update({
        collection: 'image-assets',
        id: imageAssetId,
        overrideAccess: true,
        data: {
          uploadStatus: 'failed',
        },
      })
      .catch(() => undefined)

    const message = error instanceof Error ? error.message : 'Could not complete image upload.'

    console.error('[image-complete] failed', {
      imageAssetId,
      message,
      originalFilename,
    })

    return errorResponse(message, 500)
  }
}
