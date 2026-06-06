export type PricingOption = {
  fixedRon?: number | null
  label?: string | null
  multiplier?: number | null
  perSqmRon?: number | null
  value?: string | null
}

export type CityFee = {
  city?: string | null
  fixedRon?: number | null
}

export type PricingSettings = {
  basePriceRonPerSqm?: number | null
  ceilingTypes?: PricingOption[] | null
  cityFees?: CityFee[] | null
  complexityOptions?: PricingOption[] | null
  disclaimer?: string | null
  eurRate?: number | null
  fallbackTravelFeeRon?: number | null
  lightingOptions?: PricingOption[] | null
  minimumProjectRon?: number | null
  rangePercent?: number | null
  vatMode?: 'included' | 'excluded' | 'not-specified' | null
}

export type EstimateInput = {
  ceilingType: string
  city?: string
  complexity: string
  lighting: string
  squareMeters: number
}

export type EstimateResult = {
  baseRon: number
  estimateEurMax: number
  estimateEurMin: number
  estimateRonMax: number
  estimateRonMin: number
  lineItems: Array<{
    label: string
    valueRon: number
  }>
  subtotalRon: number
}

const asPositiveNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback
}

const asNonNegativeNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : fallback
}

const findOption = (options: PricingOption[] | null | undefined, value: string) =>
  (options || []).find((option) => option.value === value) || (options || [])[0]

const findCityFee = (fees: CityFee[] | null | undefined, city?: string) => {
  const normalizedCity = city?.trim().toLowerCase()

  if (!normalizedCity) {
    return undefined
  }

  return (fees || []).find((fee) => fee.city?.trim().toLowerCase() === normalizedCity)
}

const roundCurrency = (value: number) => Math.round(value)

export const calculateEstimate = (
  input: EstimateInput,
  settings: PricingSettings,
): EstimateResult => {
  const squareMeters = asPositiveNumber(input.squareMeters, 1)
  const basePriceRonPerSqm = asPositiveNumber(settings.basePriceRonPerSqm, 180)
  const minimumProjectRon = asNonNegativeNumber(settings.minimumProjectRon, 1500)
  const eurRate = asPositiveNumber(settings.eurRate, 5)
  const rangePercent = Math.min(60, asNonNegativeNumber(settings.rangePercent, 15)) / 100
  const ceilingType = findOption(settings.ceilingTypes, input.ceilingType)
  const lighting = findOption(settings.lightingOptions, input.lighting)
  const complexity = findOption(settings.complexityOptions, input.complexity)
  const cityFee = findCityFee(settings.cityFees, input.city)
  const travelFeeRon =
    cityFee?.fixedRon !== undefined && cityFee.fixedRon !== null
      ? asNonNegativeNumber(cityFee.fixedRon)
      : input.city?.trim()
        ? asNonNegativeNumber(settings.fallbackTravelFeeRon, 0)
        : 0
  const ceilingMultiplier = asPositiveNumber(ceilingType?.multiplier, 1)
  const complexityMultiplier = asPositiveNumber(complexity?.multiplier, 1)
  const lightingFixedRon = asNonNegativeNumber(lighting?.fixedRon)
  const lightingPerSqmRon = asNonNegativeNumber(lighting?.perSqmRon)
  const materialRon = squareMeters * basePriceRonPerSqm * ceilingMultiplier
  const complexityRon = materialRon * (complexityMultiplier - 1)
  const lightingRon = lightingFixedRon + lightingPerSqmRon * squareMeters
  const rawSubtotalRon = materialRon + complexityRon + lightingRon + travelFeeRon
  const subtotalRon = Math.max(minimumProjectRon, rawSubtotalRon)
  const estimateRonMin = roundCurrency(subtotalRon * (1 - rangePercent))
  const estimateRonMax = roundCurrency(subtotalRon * (1 + rangePercent))

  return {
    baseRon: roundCurrency(materialRon),
    estimateEurMax: roundCurrency(estimateRonMax / eurRate),
    estimateEurMin: roundCurrency(estimateRonMin / eurRate),
    estimateRonMax,
    estimateRonMin,
    lineItems: [
      {
        label: 'Material si montaj',
        valueRon: roundCurrency(materialRon),
      },
      {
        label: 'Complexitate',
        valueRon: roundCurrency(complexityRon),
      },
      {
        label: 'Iluminat',
        valueRon: roundCurrency(lightingRon),
      },
      {
        label: 'Transport / deplasare',
        valueRon: roundCurrency(travelFeeRon),
      },
      {
        label: 'Prag minim proiect',
        valueRon: subtotalRon === minimumProjectRon ? roundCurrency(minimumProjectRon - rawSubtotalRon) : 0,
      },
    ].filter((item) => item.valueRon > 0),
    subtotalRon: roundCurrency(subtotalRon),
  }
}
