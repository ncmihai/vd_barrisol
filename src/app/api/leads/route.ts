import config from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'

import {
  calculateEstimate,
  type EstimateInput,
  type PricingSettings,
  PricingValidationError,
  validateEstimateInput,
} from '@/lib/pricing'
import { sendLeadNotification } from '@/lib/leadNotifications'
import type { Lead } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type LeadJsonValue = Exclude<Lead['calculatorInput'], undefined>

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status })

const toLeadJsonValue = (value: unknown): LeadJsonValue => {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return value as Record<string, unknown>
  return null
}

const asText = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

const asEstimateInput = (value: unknown, city: string): EstimateInput | null => {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>

  return {
    ceilingType: asText(record.ceilingType, 80),
    city,
    complexity: asText(record.complexity, 80),
    lighting: asText(record.lighting, 80),
    squareMeters: Number(record.squareMeters),
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  if (rawBody.length > 20000) return errorResponse('The enquiry is too large.')

  let body: {
    calculatorInput?: unknown
    city?: unknown
    email?: unknown
    locale?: unknown
    message?: unknown
    name?: unknown
    phone?: unknown
    preferredContact?: unknown
  }

  try {
    body = JSON.parse(rawBody) as typeof body
  } catch {
    return errorResponse('Invalid request body.')
  }

  const name = asText(body.name, 120)
  const phone = asText(body.phone, 60)
  const city = asText(body.city, 120)
  const email = asText(body.email, 160)
  const message = asText(body.message, 4000)
  const locale = body.locale === 'en' ? 'en' : 'ro'
  const preferredContact = ['whatsapp', 'phone', 'email'].includes(String(body.preferredContact))
    ? (body.preferredContact as 'whatsapp' | 'phone' | 'email')
    : 'whatsapp'

  if (!name) return errorResponse('Name is required.')
  if (!phone) return errorResponse('Phone is required.')

  const calculatorInput = asEstimateInput(body.calculatorInput, city)
  if (!calculatorInput) return errorResponse('A valid calculator configuration is required.')

  try {
    const payload = await getPayload({ config })
    const pricing = (await payload.findGlobal({
      depth: 0,
      locale,
      slug: 'pricing-settings',
    })) as unknown as PricingSettings
    const validatedInput = validateEstimateInput(calculatorInput, pricing)
    const estimate = calculateEstimate(validatedInput, pricing)
    const lead = await payload.create({
      collection: 'leads',
      data: {
        calculatorInput: toLeadJsonValue({ ...validatedInput, locale }),
        city: validatedInput.city || '',
        email,
        estimateEurMax: estimate.estimateEurMax,
        estimateEurMin: estimate.estimateEurMin,
        estimateRonMax: estimate.estimateRonMax,
        estimateRonMin: estimate.estimateRonMin,
        locale,
        message,
        name,
        phone,
        preferredContact,
        pricingSnapshot: toLeadJsonValue(pricing),
        source: 'website-calculator',
      },
      overrideAccess: true,
    })

    try {
      await sendLeadNotification({
        city: validatedInput.city,
        email,
        estimateEurMax: estimate.estimateEurMax,
        estimateEurMin: estimate.estimateEurMin,
        estimateRonMax: estimate.estimateRonMax,
        estimateRonMin: estimate.estimateRonMin,
        message,
        name,
        phone,
      })
    } catch (error) {
      console.error('[lead-email] failed', error instanceof Error ? error.message : error)
    }

    return NextResponse.json({ estimate, id: lead.id, ok: true })
  } catch (error) {
    if (error instanceof PricingValidationError) return errorResponse(error.message)

    console.error('[lead] failed', error instanceof Error ? error.message : error)
    return errorResponse('The enquiry could not be saved right now.', 503)
  }
}
