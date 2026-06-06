import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const authResult = await payload.auth({ headers: request.headers })

  if (!authResult.user) {
    return errorResponse('Authentication required.', 401)
  }

  const body = (await request.json().catch(() => ({}))) as {
    imageAssetId?: number | string
  }
  const imageAssetId = String(body.imageAssetId || '').trim()

  if (!imageAssetId) {
    return errorResponse('Image Asset is missing.')
  }

  await payload.update({
    collection: 'image-assets',
    id: imageAssetId,
    overrideAccess: true,
    data: {
      uploadStatus: 'failed',
    },
  })

  return NextResponse.json({ ok: true })
}
