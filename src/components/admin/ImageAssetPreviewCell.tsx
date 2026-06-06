import type { DefaultServerCellComponentProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

export function ImageAssetPreviewCell({
  cellData,
  collectionConfig,
  link,
  linkURL,
  payload,
  rowData,
}: DefaultServerCellComponentProps) {
  const thumbnailUrl = typeof cellData === 'string' ? cellData : ''
  const href =
    link && rowData?.id
      ? linkURL ||
        formatAdminURL({
          adminRoute: payload.config.routes.admin,
          path: `/collections/${collectionConfig.slug}/${encodeURIComponent(String(rowData.id))}`,
          serverURL: payload.config.serverURL,
        })
      : undefined

  const preview = (
    <span className="image-asset-preview-cell">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Payload list thumbnails use app-routed previews.
        <img alt="" loading="lazy" src={thumbnailUrl} />
      ) : (
        <span aria-label="No image uploaded" />
      )}
    </span>
  )

  return href ? <a href={href}>{preview}</a> : preview
}
