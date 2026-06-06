'use client'

import { type FormEvent, useMemo, useState } from 'react'

import { calculateEstimate, type EstimateInput, type PricingSettings } from '@/lib/pricing'
import type { Locale } from '@/lib/i18n'

const copy = {
  en: {
    ceilingType: 'Ceiling type',
    city: 'City',
    complexity: 'Complexity',
    disclaimer: 'Approximate estimate',
    email: 'Email',
    lighting: 'Lighting',
    message: 'Message',
    name: 'Name',
    phone: 'Phone',
    result: 'Estimated range',
    send: 'Send estimate',
    sent: 'Estimate sent.',
    squareMeters: 'Square meters',
    submitError: 'Could not send the estimate. Try WhatsApp or phone.',
    fallbackContact: 'Contact details',
    whatsapp: 'WhatsApp',
  },
  ro: {
    ceilingType: 'Tip tavan',
    city: 'Oras',
    complexity: 'Complexitate',
    disclaimer: 'Estimare aproximativa',
    email: 'Email',
    lighting: 'Iluminat',
    message: 'Mesaj',
    name: 'Nume',
    phone: 'Telefon',
    result: 'Interval estimativ',
    send: 'Trimite estimarea',
    sent: 'Estimarea a fost trimisa.',
    squareMeters: 'Metri patrati',
    submitError: 'Estimarea nu a putut fi trimisa. Incearca WhatsApp sau telefon.',
    fallbackContact: 'Date de contact',
    whatsapp: 'WhatsApp',
  },
} as const

const getOptionValue = (options: PricingSettings['ceilingTypes'], fallback: string) =>
  options?.[0]?.value || fallback

export function EstimateCalculator({
  locale,
  pricing,
  whatsappHref,
}: {
  locale: Locale
  pricing: PricingSettings
  whatsappHref: string
}) {
  const labels = copy[locale]
  const [input, setInput] = useState<EstimateInput>({
    ceilingType: getOptionValue(pricing.ceilingTypes, 'mat-standard'),
    city: 'Constanta',
    complexity: getOptionValue(pricing.complexityOptions, 'simple'),
    lighting: getOptionValue(pricing.lightingOptions, 'none'),
    squareMeters: 20,
  })
  const [lead, setLead] = useState({
    email: '',
    message: '',
    name: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const estimate = useMemo(() => calculateEstimate(input, pricing), [input, pricing])

  const updateInput = (nextInput: Partial<EstimateInput>) => {
    setInput((current) => ({
      ...current,
      ...nextInput,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/leads', {
        body: JSON.stringify({
          calculatorInput: input,
          city: input.city,
          email: lead.email,
          estimateEurMax: estimate.estimateEurMax,
          estimateEurMin: estimate.estimateEurMin,
          estimateRonMax: estimate.estimateRonMax,
          estimateRonMin: estimate.estimateRonMin,
          locale,
          message: lead.message,
          name: lead.name,
          phone: lead.phone,
          preferredContact: 'whatsapp',
          pricingSnapshot: pricing,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Lead request failed.')
      }

      setStatus('sent')
    } catch {
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="estimate-tool">
      <div className="estimate-tool__controls">
        <label>
          <span>{labels.squareMeters}</span>
          <input
            min="1"
            onChange={(event) => updateInput({ squareMeters: Number(event.target.value) })}
            type="number"
            value={input.squareMeters}
          />
        </label>
        <label>
          <span>{labels.ceilingType}</span>
          <select
            onChange={(event) => updateInput({ ceilingType: event.target.value })}
            value={input.ceilingType}
          >
            {(pricing.ceilingTypes || []).map((option) => (
              <option key={option.value || option.label || ''} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.lighting}</span>
          <select
            onChange={(event) => updateInput({ lighting: event.target.value })}
            value={input.lighting}
          >
            {(pricing.lightingOptions || []).map((option) => (
              <option key={option.value || option.label || ''} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.complexity}</span>
          <select
            onChange={(event) => updateInput({ complexity: event.target.value })}
            value={input.complexity}
          >
            {(pricing.complexityOptions || []).map((option) => (
              <option key={option.value || option.label || ''} value={option.value || ''}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{labels.city}</span>
          <input
            onChange={(event) => updateInput({ city: event.target.value })}
            type="text"
            value={input.city}
          />
        </label>
      </div>

      <div className="estimate-result">
        <span>{labels.result}</span>
        <strong>
          {estimate.estimateRonMin.toLocaleString('ro-RO')} -{' '}
          {estimate.estimateRonMax.toLocaleString('ro-RO')} RON
        </strong>
        <em>
          {estimate.estimateEurMin.toLocaleString('ro-RO')} -{' '}
          {estimate.estimateEurMax.toLocaleString('ro-RO')} EUR
        </em>
        <p>{pricing.disclaimer || labels.disclaimer}</p>
        <a className="button button--dark" href={whatsappHref}>
          {whatsappHref === '#contact' ? labels.fallbackContact : labels.whatsapp}
        </a>
      </div>

      <form className="lead-form" onSubmit={handleSubmit}>
        <label>
          <span>{labels.name}</span>
          <input
            onChange={(event) => setLead((current) => ({ ...current, name: event.target.value }))}
            required
            type="text"
            value={lead.name}
          />
        </label>
        <label>
          <span>{labels.phone}</span>
          <input
            onChange={(event) => setLead((current) => ({ ...current, phone: event.target.value }))}
            required
            type="tel"
            value={lead.phone}
          />
        </label>
        <label>
          <span>{labels.email}</span>
          <input
            onChange={(event) => setLead((current) => ({ ...current, email: event.target.value }))}
            type="email"
            value={lead.email}
          />
        </label>
        <label className="lead-form__message">
          <span>{labels.message}</span>
          <textarea
            onChange={(event) => setLead((current) => ({ ...current, message: event.target.value }))}
            value={lead.message}
          />
        </label>
        <button className="button button--primary" disabled={isSubmitting} type="submit">
          {labels.send}
        </button>
        {status === 'sent' && <p className="form-status form-status--ok">{labels.sent}</p>}
        {status === 'error' && <p className="form-status form-status--error">{labels.submitError}</p>}
      </form>
    </div>
  )
}
