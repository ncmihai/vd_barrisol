import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { createImageObjectPath, getImageMaxBytes, prepareImageUpload } from '@/lib/storage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type ImageVariantName = 'original' | '2k' | '1080' | 'thumbnail'

type ImageVariantInput = {
  extension?: string
  filesize?: number
  height?: number
  mimeType?: string
  variant?: ImageVariantName
  width?: number
}

const acceptedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const acceptedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const variantNames = new Set<ImageVariantName>(['original', '2k', '1080', 'thumbnail'])

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const normalizeExtension = (extension = '') => {
  const normalized = extension.trim().toLowerCase()

  return normalized.startsWith('.') ? normalized : `.${normalized}`
}

const validateVariant = ({
  maxBytes,
  variant,
}: {
  maxBytes: number
  variant: ImageVariantInput
}) => {
  const variantName = variant.variant
  const extension = normalizeExtension(variant.extension)
  const filesize = Number(variant.filesize)
  const width = Number(variant.width)
  const height = Number(variant.height)
  const mimeType = String(variant.mimeType || '').trim().toLowerCase()

  if (!variantName || !variantNames.has(variantName)) {
    return 'Image variant is invalid.'
  }

  if (!acceptedExtensions.has(extension) || !acceptedMimeTypes.has(mimeType)) {
    return `Unsupported ${variantName} image type.`
  }

  if (!Number.isFinite(filesize) || filesize <= 0) {
    return `The ${variantName} image size could not be read.`
  }

  if (filesize > maxBytes) {
    return `The ${variantName} image is too large. Max size is ${Math.floor(maxBytes / 1024 / 1024)} MB.`
  }

  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    return `The ${variantName} image dimensions could not be read.`
  }

  return ''
}

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const authResult = await payload.auth({ headers: request.headers })

  if (!authResult.user) {
    return errorResponse('Authentication required.', 401)
  }

  const body = (await request.json().catch(() => ({}))) as {
    imageAssetId?: number | string
    originalFilename?: string
    variants?: ImageVariantInput[]
  }
  const imageAssetId = String(body.imageAssetId || '').trim()
  const originalFilename = String(body.originalFilename || '').trim()
  const variants = Array.isArray(body.variants) ? body.variants : []

  if (!imageAssetId) {
    return errorResponse('Save the Image Asset before uploading.')
  }

  if (!originalFilename) {
    return errorResponse('Choose an image file first.')
  }

  if (variants.length !== 4) {
    return errorResponse('Image upload must include original, 2K, 1080, and thumbnail variants.')
  }

  const maxBytes = getImageMaxBytes()
  const seenVariants = new Set<ImageVariantName>()

  for (const variant of variants) {
    const validationError = validateVariant({ maxBytes, variant })

    if (validationError) {
      return errorResponse(validationError)
    }

    seenVariants.add(variant.variant as ImageVariantName)
  }

  for (const variantName of variantNames) {
    if (!seenVariants.has(variantName)) {
      return errorResponse(`Missing ${variantName} image variant.`)
    }
  }

  try {
    await payload.findByID({
      collection: 'image-assets',
      id: imageAssetId,
      overrideAccess: true,
    })
  } catch {
    return errorResponse('Image Asset was not found.', 404)
  }

  await payload.update({
    collection: 'image-assets',
    id: imageAssetId,
    overrideAccess: true,
    data: {
      storageProvider: 'digi_storage',
      uploadStatus: 'uploading',
    },
  })

  try {
    const preparedVariants = await Promise.all(
      variants.map(async (variant) => {
        const variantName = variant.variant as ImageVariantName
        const extension = normalizeExtension(variant.extension)
        const objectPath = createImageObjectPath({
          extension,
          filename: originalFilename,
          imageAssetId,
          variant: variantName,
        })
        const preparedUpload = await prepareImageUpload({ objectPath })

        return {
          ...variant,
          ...preparedUpload,
          url: `/api/assets/images/${imageAssetId}?variant=${variantName}`,
          variant: variantName,
        }
      }),
    )

    return NextResponse.json({
      id: imageAssetId,
      originalFilename,
      variants: preparedVariants,
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

    const message = error instanceof Error ? error.message : 'Could not prepare image upload.'

    console.error('[image-prepare] failed', {
      imageAssetId,
      message,
      originalFilename,
    })

    return errorResponse(message, 500)
  }
}
