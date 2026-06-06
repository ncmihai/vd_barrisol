'use client'

import { useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import { type ChangeEvent, useState } from 'react'

type PublicImageVariantName = 'original' | '2k' | '1080' | 'thumbnail'

type DigiImageVariant = {
  digiStoragePath?: string
  filesize?: number
  height?: number
  mimeType?: string
  url?: string
  width?: number
}

type DigiImageUploadResponse = {
  adminThumbnailUrl?: string
  cleanupWarning?: string
  error?: string
  filesize?: number
  height?: number
  id?: number | string
  mimeType?: string
  originalFilename?: string
  storageProvider?: string
  uploadStatus?: string
  updatedAt?: string
  variants?: {
    hd1080?: DigiImageVariant
    original?: DigiImageVariant
    thumbnail?: DigiImageVariant
    twoK?: DigiImageVariant
  }
  width?: number
}

type ImageAssetCreateResponse = {
  doc?: {
    id?: number | string
  }
  error?: string
  id?: number | string
  message?: string
}

type BuiltImageVariant = {
  extension: string
  file: Blob
  filesize: number
  height: number
  label: string
  mimeType: string
  variant: PublicImageVariantName
  width: number
}

type PreparedImageVariant = BuiltImageVariant & {
  filename?: string
  storagePath?: string
  storageProvider?: string
  uploadUrl?: string
  url?: string
}

type PreparedImageUpload = {
  error?: string
  id?: string | number
  originalFilename?: string
  variants?: PreparedImageVariant[]
}

type VariantPreview = DigiImageVariant & {
  label: string
  publicVariant: PublicImageVariantName
}

const formatBytes = (bytes?: number) => {
  if (!bytes) {
    return ''
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const getExtension = (filename: string) => {
  const dotIndex = filename.toLowerCase().lastIndexOf('.')

  return dotIndex === -1 ? '' : filename.slice(dotIndex).toLowerCase()
}

const getImageMimeType = (file: File) => {
  if (file.type && file.type !== 'application/octet-stream') {
    return file.type
  }

  const extension = getExtension(file.name)

  if (extension === '.png') {
    return 'image/png'
  }

  if (extension === '.webp') {
    return 'image/webp'
  }

  return 'image/jpeg'
}

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not prepare this image variant.'))
          return
        }

        resolve(blob)
      },
      type,
      quality,
    )
  })

const createWebPVariant = async ({
  bitmap,
  label,
  size,
  variant,
}: {
  bitmap: ImageBitmap
  label: string
  size: number
  variant: PublicImageVariantName
}): Promise<BuiltImageVariant> => {
  const maxSide = Math.max(bitmap.width, bitmap.height)
  const scale = Math.min(1, size / maxSide)
  const canvas = document.createElement('canvas')

  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Could not prepare this image variant.')
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  const blob = await canvasToBlob(canvas, 'image/webp', size <= 480 ? 0.76 : size <= 1080 ? 0.84 : 0.88)

  return {
    extension: '.webp',
    file: blob,
    filesize: blob.size,
    height: canvas.height,
    label,
    mimeType: 'image/webp',
    variant,
    width: canvas.width,
  }
}

const buildImageVariants = async (file: File): Promise<BuiltImageVariant[]> => {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

  try {
    const originalMimeType = getImageMimeType(file)
    const originalExtension =
      getExtension(file.name) ||
      (originalMimeType === 'image/png' ? '.png' : originalMimeType === 'image/webp' ? '.webp' : '.jpg')
    const variants = await Promise.all([
      createWebPVariant({ bitmap, label: '2K WebP', size: 2048, variant: '2k' }),
      createWebPVariant({ bitmap, label: '1080 WebP', size: 1080, variant: '1080' }),
      createWebPVariant({ bitmap, label: 'Admin thumbnail', size: 480, variant: 'thumbnail' }),
    ])

    return [
      {
        extension: originalExtension,
        file,
        filesize: file.size,
        height: bitmap.height,
        label: 'Original',
        mimeType: originalMimeType,
        variant: 'original',
        width: bitmap.width,
      },
      ...variants,
    ]
  } finally {
    bitmap.close()
  }
}

const titleFromFilename = (filename: string) =>
  filename
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Image asset'

const getStableImageUrl = ({
  cacheBust,
  imageAssetId,
  variant,
}: {
  cacheBust?: string
  imageAssetId: string
  variant: PublicImageVariantName
}) => {
  const params = new URLSearchParams({ variant })

  if (cacheBust) {
    params.set('v', cacheBust)
  }

  return `/api/assets/images/${imageAssetId}?${params.toString()}`
}

const postJSON = async <T,>(url: string, data: unknown): Promise<T> => {
  const response = await fetch(url, {
    body: JSON.stringify(data),
    cache: 'no-store',
    credentials: 'same-origin',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    method: 'POST',
  })
  const text = await response.text()
  let body: { error?: string }

  try {
    body = text ? (JSON.parse(text) as { error?: string }) : {}
  } catch {
    throw new Error(`The server returned a non-JSON response (${response.status}).`)
  }

  if (!response.ok || body.error) {
    throw new Error(body.error || `Request failed with status ${response.status}.`)
  }

  return body as T
}

const uploadDirectlyToDigi = ({
  file,
  onProgress,
  preparedVariant,
}: {
  file: Blob
  onProgress: (loaded: number) => void
  preparedVariant: PreparedImageVariant
}) =>
  new Promise<void>((resolve, reject) => {
    if (!preparedVariant.uploadUrl || !preparedVariant.filename) {
      reject(new Error('Digi Storage did not return a usable image upload target.'))
      return
    }

    const formData = new FormData()
    const request = new XMLHttpRequest()

    formData.append('file', file, preparedVariant.filename)
    request.open('POST', preparedVariant.uploadUrl)

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded)
      }
    }

    request.onerror = () => {
      reject(new Error('Could not upload directly to Digi Storage.'))
    }

    request.onload = () => {
      if (request.status >= 400) {
        reject(
          new Error(
            `Digi Storage upload failed (${request.status})${
              request.responseText ? `: ${request.responseText.slice(0, 250)}` : ''
            }`,
          ),
        )
        return
      }

      resolve()
    }

    request.send(formData)
  })

const createImageAsset = async ({
  alt,
  file,
  intendedUsage,
  preferredVariant,
  title,
}: {
  alt?: string
  file: File
  intendedUsage?: unknown
  preferredVariant?: string
  title?: string
}) => {
  const fallbackTitle = titleFromFilename(file.name)
  const resolvedTitle = title?.trim() || fallbackTitle
  const resolvedAlt = alt?.trim() || resolvedTitle
  const response = await fetch('/api/image-assets?depth=0&locale=ro', {
    body: JSON.stringify({
      alt: resolvedAlt,
      intendedUsage:
        Array.isArray(intendedUsage) && intendedUsage.length > 0 ? intendedUsage : ['library'],
      preferredVariant: preferredVariant || 'auto',
      title: resolvedTitle,
    }),
    cache: 'no-store',
    credentials: 'same-origin',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    method: 'POST',
  })
  const body = (await response.json().catch(() => ({}))) as ImageAssetCreateResponse
  const id = body.doc?.id || body.id

  if (!response.ok || body.error || !id) {
    throw new Error(body.error || body.message || 'Could not create the Image Asset document.')
  }

  return String(id)
}

const navigateWithoutPayloadPrompt = (url: string) => {
  window.addEventListener(
    'beforeunload',
    (event) => {
      event.stopImmediatePropagation()
    },
    { capture: true },
  )
  window.location.replace(url)
}

const markImageUploadFailed = async (imageAssetId: string) => {
  await postJSON('/api/digi/images/fail', {
    imageAssetId,
  }).catch(() => undefined)
}

export function DigiImageUploader() {
  const { id } = useDocumentInfo()
  const { getData, setDisabled, setModified } = useForm()
  const imageAssetId = id ? String(id) : ''
  const [cacheBust, setCacheBust] = useState('')
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isReplacing, setIsReplacing] = useState(false)
  const [message, setMessage] = useState('')
  const [pickerKey, setPickerKey] = useState(0)
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedAsset, setUploadedAsset] = useState<DigiImageUploadResponse | null>(null)
  const { value: title } = useField<string>({ path: 'title' })
  const { value: alt } = useField<string>({ path: 'alt' })
  const { value: intendedUsage } = useField<unknown>({ path: 'intendedUsage' })
  const { value: preferredVariant } = useField<string>({ path: 'preferredVariant' })
  const { value: uploadStatus } = useField<string>({ path: 'uploadStatus' })
  const { value: originalFilename } = useField<string>({ path: 'originalFilename' })
  const { value: mimeType } = useField<string>({ path: 'mimeType' })
  const { value: filesize } = useField<number>({ path: 'filesize' })
  const { value: width } = useField<number>({ path: 'width' })
  const { value: height } = useField<number>({ path: 'height' })
  const { value: originalPath } = useField<string>({ path: 'variants.original.digiStoragePath' })
  const { value: originalWidth } = useField<number>({ path: 'variants.original.width' })
  const { value: originalHeight } = useField<number>({ path: 'variants.original.height' })
  const { value: originalMimeType } = useField<string>({ path: 'variants.original.mimeType' })
  const { value: originalFilesize } = useField<number>({ path: 'variants.original.filesize' })
  const { value: twoKPath } = useField<string>({ path: 'variants.twoK.digiStoragePath' })
  const { value: twoKWidth } = useField<number>({ path: 'variants.twoK.width' })
  const { value: twoKHeight } = useField<number>({ path: 'variants.twoK.height' })
  const { value: twoKMimeType } = useField<string>({ path: 'variants.twoK.mimeType' })
  const { value: twoKFilesize } = useField<number>({ path: 'variants.twoK.filesize' })
  const { value: hd1080Path } = useField<string>({ path: 'variants.hd1080.digiStoragePath' })
  const { value: hd1080Width } = useField<number>({ path: 'variants.hd1080.width' })
  const { value: hd1080Height } = useField<number>({ path: 'variants.hd1080.height' })
  const { value: hd1080MimeType } = useField<string>({ path: 'variants.hd1080.mimeType' })
  const { value: hd1080Filesize } = useField<number>({ path: 'variants.hd1080.filesize' })
  const { value: thumbnailPath } = useField<string>({ path: 'variants.thumbnail.digiStoragePath' })
  const { value: thumbnailWidth } = useField<number>({ path: 'variants.thumbnail.width' })
  const { value: thumbnailHeight } = useField<number>({ path: 'variants.thumbnail.height' })
  const { value: thumbnailMimeType } = useField<string>({ path: 'variants.thumbnail.mimeType' })
  const { value: thumbnailFilesize } = useField<number>({ path: 'variants.thumbnail.filesize' })

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null

    setError('')
    setMessage('')
    setProgress(0)
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    setError('')

    if (!selectedFile) {
      setError('Choose a JPG, PNG, or WebP image first.')
      return
    }

    setIsUploading(true)
    setDisabled(true)
    setProgress(0)
    setMessage(imageAssetId ? 'Preparing image variants...' : 'Creating asset...')

    let isNavigatingAway = false
    let targetImageAssetId = imageAssetId

    try {
      const formData = getData()
      targetImageAssetId =
        imageAssetId ||
        (await createImageAsset({
          alt: typeof formData.alt === 'string' ? formData.alt : alt,
          file: selectedFile,
          intendedUsage: formData.intendedUsage || intendedUsage,
          preferredVariant:
            typeof formData.preferredVariant === 'string'
              ? formData.preferredVariant
              : preferredVariant,
          title: typeof formData.title === 'string' ? formData.title : title,
        }))

      const builtVariants = await buildImageVariants(selectedFile)
      const preparedUpload = await postJSON<PreparedImageUpload>('/api/digi/images/prepare', {
        imageAssetId: targetImageAssetId,
        originalFilename: selectedFile.name,
        variants: builtVariants.map(({ extension, filesize, height, mimeType, variant, width }) => ({
          extension,
          filesize,
          height,
          mimeType,
          variant,
          width,
        })),
      })
      const preparedByName = new Map(
        (preparedUpload.variants || []).map((variant) => [variant.variant, variant]),
      )
      const totalBytes = builtVariants.reduce((total, variant) => total + variant.filesize, 0)
      const loadedByVariant = new Map<PublicImageVariantName, number>()

      for (const variant of builtVariants) {
        const preparedVariant = preparedByName.get(variant.variant)

        if (!preparedVariant) {
          throw new Error(`Storage did not prepare the ${variant.label} upload.`)
        }

        setMessage(`Uploading ${variant.label}...`)

        await uploadDirectlyToDigi({
          file: variant.file,
          preparedVariant,
          onProgress: (loaded) => {
            loadedByVariant.set(variant.variant, loaded)
            const loadedBytes = Array.from(loadedByVariant.values()).reduce(
              (total, current) => total + current,
              0,
            )

            setProgress(Math.min(99, Math.round((loadedBytes / totalBytes) * 100)))
          },
        })
        loadedByVariant.set(variant.variant, variant.filesize)
      }

      setProgress(100)
      setMessage('Saving image metadata...')

      const completedUpload = await postJSON<DigiImageUploadResponse>('/api/digi/images/complete', {
        imageAssetId: targetImageAssetId,
        originalFilename: selectedFile.name,
        variants: builtVariants.map((variant) => {
          const preparedVariant = preparedByName.get(variant.variant)

          return {
            digiStoragePath: preparedVariant?.storagePath,
            filesize: variant.filesize,
            height: variant.height,
            mimeType: variant.mimeType,
            url: preparedVariant?.url,
            variant: variant.variant,
            width: variant.width,
          }
        }),
      })

      setUploadedAsset(completedUpload)
      setCacheBust(completedUpload.updatedAt || String(Date.now()))
      setMessage('Uploaded. Opening saved image asset...')
      setModified(false)

      isNavigatingAway = true
      navigateWithoutPayloadPrompt(`/admin/collections/image-assets/${targetImageAssetId}`)
    } catch (uploadError) {
      if (targetImageAssetId) {
        void markImageUploadFailed(targetImageAssetId)
      }
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.')
    } finally {
      if (!isNavigatingAway) {
        setIsUploading(false)
        setDisabled(false)
      }
    }
  }

  const formAsset: DigiImageUploadResponse = {
    filesize,
    height,
    mimeType,
    originalFilename,
    uploadStatus,
    variants: {
      hd1080: {
        digiStoragePath: hd1080Path,
        filesize: hd1080Filesize,
        height: hd1080Height,
        mimeType: hd1080MimeType,
        width: hd1080Width,
      },
      original: {
        digiStoragePath: originalPath,
        filesize: originalFilesize,
        height: originalHeight,
        mimeType: originalMimeType,
        width: originalWidth,
      },
      thumbnail: {
        digiStoragePath: thumbnailPath,
        filesize: thumbnailFilesize,
        height: thumbnailHeight,
        mimeType: thumbnailMimeType,
        width: thumbnailWidth,
      },
      twoK: {
        digiStoragePath: twoKPath,
        filesize: twoKFilesize,
        height: twoKHeight,
        mimeType: twoKMimeType,
        width: twoKWidth,
      },
    },
    width,
  }
  const activeAsset = uploadedAsset || formAsset
  const activeStatus = uploadedAsset?.uploadStatus || uploadStatus || 'draft'
  const previewVariants: VariantPreview[] = [
    {
      label: 'Original',
      publicVariant: 'original',
      ...activeAsset.variants?.original,
    },
    {
      label: '2K WebP',
      publicVariant: '2k',
      ...activeAsset.variants?.twoK,
    },
    {
      label: '1080 WebP',
      publicVariant: '1080',
      ...activeAsset.variants?.hd1080,
    },
    {
      label: 'Admin thumbnail',
      publicVariant: 'thumbnail',
      ...activeAsset.variants?.thumbnail,
    },
  ]
  const hasPreview = Boolean(
    imageAssetId && previewVariants.some((variant) => variant.digiStoragePath),
  )
  const hasReadyImage = activeStatus === 'ready' && hasPreview
  const showUploadControls = !hasReadyImage || isReplacing

  return (
    <div className="digi-image-uploader" id="digi-uploader">
      <div className="digi-image-uploader__header">
        <div>
          <strong>Digi image uploader</strong>
          <p>
            Upload JPG, PNG, or WebP. The browser prepares web variants, then uploads directly to
            storage.
          </p>
        </div>
        {imageAssetId && (
          <span className={`digi-image-uploader__status digi-image-uploader__status--${activeStatus}`}>
            {activeStatus}
          </span>
        )}
      </div>
      {hasReadyImage && !isReplacing && (
        <button
          className="btn btn--style-primary digi-image-uploader__replace"
          disabled={isUploading}
          onClick={() => {
            setError('')
            setMessage('')
            setProgress(0)
            setSelectedFile(null)
            setPickerKey((current) => current + 1)
            setIsReplacing(true)
          }}
          type="button"
        >
          Replace image
        </button>
      )}
      {showUploadControls && (
        <div className="digi-image-uploader__upload">
          <label className="digi-image-uploader__picker">
            <span>Image file</span>
            <input
              key={pickerKey}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              disabled={isUploading}
              onChange={handleFileChange}
              type="file"
            />
          </label>
          {selectedFile && <p className="digi-image-uploader__file">{selectedFile.name}</p>}
          <div className="digi-image-uploader__actions">
            <button
              className="btn btn--style-primary"
              disabled={isUploading || !selectedFile}
              onClick={handleUpload}
              type="button"
            >
              {isUploading
                ? 'Uploading...'
                : imageAssetId
                  ? hasReadyImage
                    ? 'Replace image'
                    : 'Upload image'
                  : 'Create asset and upload'}
            </button>
            {hasReadyImage && (
              <button
                className="btn"
                disabled={isUploading}
                onClick={() => {
                  setError('')
                  setMessage('')
                  setProgress(0)
                  setSelectedFile(null)
                  setPickerKey((current) => current + 1)
                  setIsReplacing(false)
                }}
                type="button"
              >
                Cancel replace
              </button>
            )}
          </div>
          {isUploading && (
            <div aria-label={`Upload progress ${progress}%`} className="digi-image-uploader__progress">
              <span style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}
      {message && <p>{message}</p>}
      {error && <p className="digi-image-uploader__error">{error}</p>}
      {hasPreview && (
        <>
          <div className="digi-image-uploader__meta">
            <span>
              <strong>Source</strong>
              {activeAsset.originalFilename || 'Image asset'}
            </span>
            <span>
              <strong>Dimensions</strong>
              {activeAsset.width && activeAsset.height
                ? `${activeAsset.width} x ${activeAsset.height}`
                : 'Dimensions pending'}
            </span>
            <span>
              <strong>Size</strong>
              {formatBytes(activeAsset.filesize) || 'Size pending'}
            </span>
          </div>
          <div className="digi-image-uploader__preview-grid">
            {previewVariants.map((variant) => {
              const stableUrl = getStableImageUrl({
                cacheBust,
                imageAssetId,
                variant: variant.publicVariant,
              })

              if (!variant.digiStoragePath) {
                return (
                  <div
                    className="digi-image-uploader__preview digi-image-uploader__preview--empty"
                    key={variant.publicVariant}
                  >
                    <strong>{variant.label}</strong>
                    <span>Not generated yet</span>
                  </div>
                )
              }

              return (
                <figure className="digi-image-uploader__preview" key={variant.publicVariant}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- Storage previews bypass image optimization. */}
                  <img alt={`${variant.label} preview`} loading="lazy" src={stableUrl} />
                  <figcaption>
                    <strong>{variant.label}</strong>
                    <span>
                      {variant.width && variant.height
                        ? `${variant.width} x ${variant.height}`
                        : 'size pending'}
                      {variant.filesize ? ` · ${formatBytes(variant.filesize)}` : ''}
                    </span>
                    <code>{variant.digiStoragePath}</code>
                    <a href={stableUrl} rel="noreferrer" target="_blank">
                      Open variant
                    </a>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
