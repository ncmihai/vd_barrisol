import {
  createDigiImageObjectPath,
  deleteDigiStorageFile,
  DIGI_STORAGE_PROVIDER,
  getDigiImageMaxBytes,
  getDigiStorageDownloadLink,
  prepareDigiStorageUpload,
} from '@/lib/digi-storage'

export const STORAGE_PROVIDER = {
  digi: DIGI_STORAGE_PROVIDER,
  hetzner: 'hetzner_storage',
} as const

export type StorageProvider = (typeof STORAGE_PROVIDER)[keyof typeof STORAGE_PROVIDER]

export const getImageMaxBytes = () => getDigiImageMaxBytes()

export const createImageObjectPath = createDigiImageObjectPath

export const prepareImageUpload = prepareDigiStorageUpload

export const getStorageDownloadLink = async ({
  provider,
  storagePath,
}: {
  provider?: string | null
  storagePath: string
}) => {
  if (!provider || provider === DIGI_STORAGE_PROVIDER) {
    return getDigiStorageDownloadLink(storagePath)
  }

  if (provider === STORAGE_PROVIDER.hetzner) {
    throw new Error('Hetzner storage is not configured yet.')
  }

  throw new Error(`Unsupported storage provider: ${provider}.`)
}

export const deleteStorageFile = async (storagePath: string, provider = DIGI_STORAGE_PROVIDER) => {
  if (provider === DIGI_STORAGE_PROVIDER) {
    return deleteDigiStorageFile(storagePath)
  }

  if (provider === STORAGE_PROVIDER.hetzner) {
    throw new Error('Hetzner storage is not configured yet.')
  }

  throw new Error(`Unsupported storage provider: ${provider}.`)
}
