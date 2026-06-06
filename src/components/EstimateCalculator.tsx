'use client'

import { type FormEvent, useMemo, useState } from 'react'

import type { Locale } from '@/lib/i18n'
import {
  calculateEstimate,
  calculateSquareMetersFromDimensions,
  type EstimateInput,
  type PricingOption,
  type PricingSettings,
} from '@/lib/pricing'

const copy = {
  en: {
    area: 'Area',
    areaCopy: 'Start with the approximate ceiling surface. You can enter square meters directly or calculate them from room dimensions.',
    back: 'Back',
    ceilingType: 'Finish',
    city: 'City',
    complexity: 'Room details',
    customCity: 'Other city',
    details: 'Details',
    dimensions: 'Length x width',
    disclaimer: 'Approximate estimate',
    email: 'Email',
    factors: 'Included factors',
    lighting: 'Lighting',
    message: 'Message',
    name: 'Name',
    next: 'Next',
    phone: 'Phone',
    result: 'Estimated range',
    send: 'Send estimate',
    sent: 'Estimate sent.',
    showLeadForm: 'Send the estimate',
    squareMeters: 'Square meters',
    squareMeterUnit: 'sqm',
    submitError: 'Could not send the estimate. Try WhatsApp or phone.',
    surface: 'Surface',
    useDimensions: 'Use dimensions',
    useSquareMeters: 'Use square meters',
    whatsapp: 'WhatsApp',
    whatsappMessage: 'Hello, I made a VD BARRISOL estimate',
    width: 'Width',
    length: 'Length',
  },
  ro: {
    area: 'Suprafata',
    areaCopy: 'Incepe cu suprafata aproximativa a tavanului. Poti introduce direct metri patrati sau ii poti calcula din dimensiunile camerei.',
    back: 'Inapoi',
    ceilingType: 'Finisaj',
    city: 'Oras',
    complexity: 'Detalii camera',
    customCity: 'Alt oras',
    details: 'Detalii',
    dimensions: 'Lungime x latime',
    disclaimer: 'Estimare aproximativa',
    email: 'Email',
    factors: 'Factori inclusi',
    lighting: 'Iluminat',
    message: 'Mesaj',
    name: 'Nume',
    next: 'Continua',
    phone: 'Telefon',
    result: 'Interval estimativ',
    send: 'Trimite estimarea',
    sent: 'Estimarea a fost trimisa.',
    showLeadForm: 'Trimite estimarea',
    squareMeters: 'Metri patrati',
    squareMeterUnit: 'mp',
    submitError: 'Estimarea nu a putut fi trimisa. Incearca WhatsApp sau telefon.',
    surface: 'Suprafata',
    useDimensions: 'Foloseste dimensiuni',
    useSquareMeters: 'Foloseste metri patrati',
    whatsapp: 'WhatsApp',
    whatsappMessage: 'Buna, am facut o estimare VD BARRISOL',
    width: 'Latime',
    length: 'Lungime',
  },
} as const

type AreaMode = 'sqm' | 'dimensions'

const getOptionValue = (options: PricingSettings['ceilingTypes'], fallback: string) =>
  options?.[0]?.value || fallback

const findOption = (options: PricingOption[] | null | undefined, value: string) =>
  (options || []).find((option) => option.value === value) || (options || [])[0]

const optionKey = (option: PricingOption) => option.value || option.label || ''

const formatNumber = (value: number) =>
  value.toLocaleString('ro-RO', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })

const formatCurrencyRange = (min: number, max: number, currency: 'RON' | 'EUR') =>
  `${min.toLocaleString('ro-RO')} - ${max.toLocaleString('ro-RO')} ${currency}`

const buildWhatsAppHref = ({
  city,
  cityLabel,
  complexityFieldLabel,
  complexityLabel,
  estimateLabel,
  estimateEur,
  estimateRon,
  finishFieldLabel,
  lightingFieldLabel,
  lightingLabel,
  squareMeterUnit,
  squareMeters,
  surfaceFieldLabel,
  surfaceLabel,
  title,
  whatsappHref,
}: {
  city: string
  cityLabel: string
  complexityFieldLabel: string
  complexityLabel: string
  estimateLabel: string
  estimateEur: string
  estimateRon: string
  finishFieldLabel: string
  lightingFieldLabel: string
  lightingLabel: string
  squareMeterUnit: string
  squareMeters: number
  surfaceFieldLabel: string
  surfaceLabel: string
  title: string
  whatsappHref: string
}) => {
  if (whatsappHref === '#contact') {
    return whatsappHref
  }

  const message = [
    title,
    `${estimateLabel}: ${estimateRon} (${estimateEur})`,
    `${surfaceFieldLabel}: ${formatNumber(squareMeters)} ${squareMeterUnit}`,
    `${finishFieldLabel}: ${surfaceLabel}`,
    `${lightingFieldLabel}: ${lightingLabel}`,
    `${complexityFieldLabel}: ${complexityLabel}`,
    `${cityLabel}: ${city}`,
  ].join('\n')
  const separator = whatsappHref.includes('?') ? '&' : '?'

  return `${whatsappHref}${separator}text=${encodeURIComponent(message)}`
}

export function EstimateCalculator({
  locale,
  pricing,
  serviceCities,
  whatsappHref,
}: {
  locale: Locale
  pricing: PricingSettings
  serviceCities: string[]
  whatsappHref: string
}) {
  const labels = copy[locale]
  const cities = serviceCities.length > 0 ? serviceCities : ['Constanta']
  const defaultCity = cities.includes('Constanta') ? 'Constanta' : cities[0]
  const steps = [
    { key: 'area', label: labels.area },
    { key: 'finish', label: labels.ceilingType },
    { key: 'lighting', label: labels.lighting },
    { key: 'details', label: labels.details },
  ]
  const [activeStep, setActiveStep] = useState(0)
  const [areaMode, setAreaMode] = useState<AreaMode>('sqm')
  const [dimensions, setDimensions] = useState({
    length: 5,
    width: 4,
  })
  const [input, setInput] = useState<EstimateInput>({
    ceilingType: getOptionValue(pricing.ceilingTypes, 'mat-standard'),
    city: defaultCity,
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
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const estimate = useMemo(() => calculateEstimate(input, pricing), [input, pricing])
  const ceilingType = findOption(pricing.ceilingTypes, input.ceilingType)
  const lighting = findOption(pricing.lightingOptions, input.lighting)
  const complexity = findOption(pricing.complexityOptions, input.complexity)
  const estimateRon = formatCurrencyRange(estimate.estimateRonMin, estimate.estimateRonMax, 'RON')
  const estimateEur = formatCurrencyRange(estimate.estimateEurMin, estimate.estimateEurMax, 'EUR')
  const factorChips = [
    `${labels.surface}: ${formatNumber(input.squareMeters)} ${labels.squareMeterUnit}`,
    ceilingType?.label || labels.ceilingType,
    lighting?.label || labels.lighting,
    complexity?.label || labels.complexity,
    input.city || labels.city,
  ]
  const richerCalculatorInput = {
    ...input,
    areaMode,
    dimensions: areaMode === 'dimensions' ? dimensions : null,
    selectedLabels: {
      ceilingType: ceilingType?.label || '',
      complexity: complexity?.label || '',
      lighting: lighting?.label || '',
    },
  }
  const prefilledWhatsappHref = buildWhatsAppHref({
    city: input.city || defaultCity,
    cityLabel: labels.city,
    complexityFieldLabel: labels.complexity,
    complexityLabel: complexity?.label || labels.complexity,
    estimateLabel: labels.result,
    estimateEur,
    estimateRon,
    finishFieldLabel: labels.ceilingType,
    lightingFieldLabel: labels.lighting,
    lightingLabel: lighting?.label || labels.lighting,
    squareMeterUnit: labels.squareMeterUnit,
    squareMeters: input.squareMeters,
    surfaceFieldLabel: labels.surface,
    surfaceLabel: ceilingType?.label || labels.ceilingType,
    title: labels.whatsappMessage,
    whatsappHref,
  })

  const updateInput = (nextInput: Partial<EstimateInput>) => {
    setInput((current) => ({
      ...current,
      ...nextInput,
    }))
  }

  const updateDimensions = (nextDimensions: Partial<typeof dimensions>) => {
    const updated = {
      ...dimensions,
      ...nextDimensions,
    }
    const squareMeters = calculateSquareMetersFromDimensions(updated.length, updated.width)

    setDimensions(updated)
    setInput((currentInput) => ({
      ...currentInput,
      squareMeters: squareMeters || currentInput.squareMeters,
    }))
  }

  const handleAreaMode = (nextMode: AreaMode) => {
    setAreaMode(nextMode)

    if (nextMode === 'dimensions') {
      updateInput({
        squareMeters: calculateSquareMetersFromDimensions(dimensions.length, dimensions.width),
      })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/leads', {
        body: JSON.stringify({
          calculatorInput: richerCalculatorInput,
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
      <div className="estimate-guided">
        <div className="estimate-steps" aria-label={locale === 'ro' ? 'Pasi calculator' : 'Calculator steps'}>
          {steps.map((step, index) => (
            <button
              aria-current={index === activeStep ? 'step' : undefined}
              className={index === activeStep ? 'is-active' : ''}
              key={step.key}
              onClick={() => setActiveStep(index)}
              type="button"
            >
              <span>{index + 1}</span>
              {step.label}
            </button>
          ))}
        </div>

        <div className="estimate-step-panel">
          {activeStep === 0 && (
            <div className="estimate-step-content">
              <div className="estimate-step-intro">
                <h3>{labels.area}</h3>
                <p>{labels.areaCopy}</p>
              </div>
              <div className="segmented-control">
                <button
                  className={areaMode === 'sqm' ? 'is-active' : ''}
                  onClick={() => handleAreaMode('sqm')}
                  type="button"
                >
                  {labels.useSquareMeters}
                </button>
                <button
                  className={areaMode === 'dimensions' ? 'is-active' : ''}
                  onClick={() => handleAreaMode('dimensions')}
                  type="button"
                >
                  {labels.useDimensions}
                </button>
              </div>
              {areaMode === 'sqm' ? (
                <label className="estimate-field estimate-field--large">
                  <span>{labels.squareMeters}</span>
                  <input
                    min="1"
                    onChange={(event) => updateInput({ squareMeters: Number(event.target.value) })}
                    type="number"
                    value={input.squareMeters}
                  />
                </label>
              ) : (
                <div className="dimension-grid">
                  <label className="estimate-field">
                    <span>{labels.length}</span>
                    <input
                      min="0.1"
                      onChange={(event) => updateDimensions({ length: Number(event.target.value) })}
                      step="0.1"
                      type="number"
                      value={dimensions.length}
                    />
                  </label>
                  <label className="estimate-field">
                    <span>{labels.width}</span>
                    <input
                      min="0.1"
                      onChange={(event) => updateDimensions({ width: Number(event.target.value) })}
                      step="0.1"
                      type="number"
                      value={dimensions.width}
                    />
                  </label>
                  <div className="dimension-result">
                    <span>{labels.squareMeters}</span>
                    <strong>
                      {formatNumber(input.squareMeters)} {labels.squareMeterUnit}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 1 && (
            <div className="option-grid">
              {(pricing.ceilingTypes || []).map((option) => (
                <button
                  className={option.value === input.ceilingType ? 'option-card is-selected' : 'option-card'}
                  key={optionKey(option)}
                  onClick={() => updateInput({ ceilingType: option.value || '' })}
                  type="button"
                >
                  <span>{labels.ceilingType}</span>
                  <strong>{option.label}</strong>
                </button>
              ))}
            </div>
          )}

          {activeStep === 2 && (
            <div className="option-grid">
              {(pricing.lightingOptions || []).map((option) => (
                <button
                  className={option.value === input.lighting ? 'option-card is-selected' : 'option-card'}
                  key={optionKey(option)}
                  onClick={() => updateInput({ lighting: option.value || '' })}
                  type="button"
                >
                  <span>{labels.lighting}</span>
                  <strong>{option.label}</strong>
                </button>
              ))}
            </div>
          )}

          {activeStep === 3 && (
            <div className="estimate-step-content">
              <div className="option-grid">
                {(pricing.complexityOptions || []).map((option) => (
                  <button
                    className={option.value === input.complexity ? 'option-card is-selected' : 'option-card'}
                    key={optionKey(option)}
                    onClick={() => updateInput({ complexity: option.value || '' })}
                    type="button"
                  >
                    <span>{labels.complexity}</span>
                    <strong>{option.label}</strong>
                  </button>
                ))}
              </div>
              <div className="city-picker">
                <span>{labels.city}</span>
                <div className="city-picker__options">
                  {cities.map((city) => (
                    <button
                      className={city === input.city ? 'is-selected' : ''}
                      key={city}
                      onClick={() => updateInput({ city })}
                      type="button"
                    >
                      {city}
                    </button>
                  ))}
                </div>
                <label className="estimate-field">
                  <span>{labels.customCity}</span>
                  <input
                    onChange={(event) => updateInput({ city: event.target.value })}
                    type="text"
                    value={cities.includes(input.city || '') ? '' : input.city}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="estimate-navigation">
            <button
              className="button button--ghost-light"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
              type="button"
            >
              {labels.back}
            </button>
            <button
              className="button button--primary"
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep((current) => Math.min(steps.length - 1, current + 1))}
              type="button"
            >
              {labels.next}
            </button>
          </div>
        </div>
      </div>

      <aside className="estimate-result">
        <span>{labels.result}</span>
        <strong>{estimateRon}</strong>
        <em>{estimateEur}</em>
        <div className="estimate-factors" aria-label={labels.factors}>
          {factorChips.map((factor) => (
            <small key={factor}>{factor}</small>
          ))}
        </div>
        <p>{pricing.disclaimer || labels.disclaimer}</p>
        <div className="estimate-actions">
          <a className="button button--dark" href={prefilledWhatsappHref}>
            {labels.whatsapp}
          </a>
          <button className="button button--primary" onClick={() => setShowLeadForm(true)} type="button">
            {labels.showLeadForm}
          </button>
        </div>
      </aside>

      {showLeadForm && (
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
      )}
    </div>
  )
}
