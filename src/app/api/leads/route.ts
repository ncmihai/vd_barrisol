import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import { sendLeadNotification } from '@/lib/leadNotifications'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

export async function POST(request: NextRequest) {
  const payload = await getPayload({ config })
  const body = (await request.json().catch(() => ({}))) as {
    calculatorInput?: unknown
    city?: string
    email?: string
    estimateEurMax?: number
    estimateEurMin?: number
    estimateRonMax?: number
    estimateRonMin?: number
    locale?: 'ro' | 'en'
    message?: string
    name?: string
    phone?: string
    preferredContact?: 'whatsapp' | 'phone' | 'email'
    pricingSnapshot?: unknown
  }
  const name = String(body.name || '').trim()
  const phone = String(body.phone || '').trim()

  if (!name) {
    return errorResponse('Name is required.')
  }

  if (!phone) {
    return errorResponse('Phone is required.')
  }

  const lead = await payload.create({
    collection: 'leads',
    data: {
      calculatorInput: body.calculatorInput || null,
      city: String(body.city || '').trim(),
      email: String(body.email || '').trim(),
      estimateEurMax: Number(body.estimateEurMax) || 0,
      estimateEurMin: Number(body.estimateEurMin) || 0,
      estimateRonMax: Number(body.estimateRonMax) || 0,
      estimateRonMin: Number(body.estimateRonMin) || 0,
      locale: body.locale === 'en' ? 'en' : 'ro',
      message: String(body.message || '').trim(),
      name,
      phone,
      preferredContact: body.preferredContact || 'whatsapp',
      pricingSnapshot: body.pricingSnapshot || null,
      source: 'website-calculator',
    },
    overrideAccess: true,
  })

  try {
    await sendLeadNotification({
      city: String(body.city || '').trim(),
      email: String(body.email || '').trim(),
      estimateEurMax: Number(body.estimateEurMax) || 0,
      estimateEurMin: Number(body.estimateEurMin) || 0,
      estimateRonMax: Number(body.estimateRonMax) || 0,
      estimateRonMin: Number(body.estimateRonMin) || 0,
      message: String(body.message || '').trim(),
      name,
      phone,
    })
  } catch (error) {
    console.error('[lead-email] failed', error instanceof Error ? error.message : error)
  }

  return NextResponse.json({
    id: lead.id,
    ok: true,
  })
}
