import { describe, expect, it } from 'vitest'

import {
  calculateEstimate,
  calculateSquareMetersFromDimensions,
  PricingValidationError,
  validateEstimateInput,
  type PricingSettings,
} from '@/lib/pricing'

const settings: PricingSettings = {
  basePriceRonPerSqm: 200,
  ceilingTypes: [
    { label: 'Mat', value: 'mat', multiplier: 1 },
    { label: 'Lucios', value: 'lucios', multiplier: 1.2 },
  ],
  cityFees: [{ city: 'Constanta', fixedRon: 0 }],
  complexityOptions: [
    { label: 'Simplu', value: 'simple', multiplier: 1 },
    { label: 'Complex', value: 'complex', multiplier: 1.25 },
  ],
  eurRate: 5,
  fallbackTravelFeeRon: 400,
  lightingOptions: [
    { label: 'Fara', value: 'none', fixedRon: 0, perSqmRon: 0 },
    { label: 'LED', value: 'led', fixedRon: 500, perSqmRon: 50 },
  ],
  minimumProjectRon: 1500,
  rangePercent: 10,
}

describe('calculateEstimate', () => {
  it('calculates a range with multipliers, lighting, and travel fees', () => {
    const estimate = calculateEstimate(
      {
        ceilingType: 'lucios',
        city: 'Bucuresti',
        complexity: 'complex',
        lighting: 'led',
        squareMeters: 20,
      },
      settings,
    )

    expect(estimate.subtotalRon).toBe(7900)
    expect(estimate.estimateRonMin).toBe(7110)
    expect(estimate.estimateRonMax).toBe(8690)
    expect(estimate.estimateEurMin).toBe(1422)
    expect(estimate.estimateEurMax).toBe(1738)
  })

  it('applies the minimum project price when the subtotal is too small', () => {
    const estimate = calculateEstimate(
      {
        ceilingType: 'mat',
        city: 'Constanta',
        complexity: 'simple',
        lighting: 'none',
        squareMeters: 2,
      },
      settings,
    )

    expect(estimate.subtotalRon).toBe(1500)
    expect(estimate.lineItems.some((item) => item.label === 'Prag minim proiect')).toBe(true)
  })

  it('calculates square meters from room dimensions', () => {
    expect(calculateSquareMetersFromDimensions(4.25, 3.4)).toBe(14.45)
    expect(calculateSquareMetersFromDimensions(0, 3.4)).toBe(0)
  })

  it('uses the fallback travel fee for custom cities', () => {
    const estimate = calculateEstimate(
      {
        ceilingType: 'mat',
        city: 'Mangalia',
        complexity: 'simple',
        lighting: 'none',
        squareMeters: 20,
      },
      settings,
    )

    expect(estimate.subtotalRon).toBe(4400)
    expect(estimate.lineItems.some((item) => item.label === 'Transport / deplasare')).toBe(true)
  })

  it('rejects invalid areas and unknown pricing options', () => {
    expect(() => calculateEstimate({ ceilingType: 'mat', city: 'Constanta', complexity: 'simple', lighting: 'none', squareMeters: 0 }, settings)).toThrow(PricingValidationError)
    expect(() => validateEstimateInput({ ceilingType: 'unknown', city: 'Constanta', complexity: 'simple', lighting: 'none', squareMeters: 20 }, settings)).toThrow(PricingValidationError)
  })
})
