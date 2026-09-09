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

export class PricingValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PricingValidationError'
  }
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

export const validateEstimateInput = (
  input: EstimateInput,
  settings: PricingSettings,
): EstimateInput => {
  const squareMeters = Number(input.squareMeters)
  const ceilingType = findOption(settings.ceilingTypes, input.ceilingType)
  const lighting = findOption(settings.lightingOptions, input.lighting)
  const complexity = findOption(settings.complexityOptions, input.complexity)

  if (!Number.isFinite(squareMeters) || squareMeters <= 0 || squareMeters > 10000) {
    throw new PricingValidationError('Square meters must be between 0 and 10000.')
  }

  if (!ceilingType?.value || ceilingType.value !== input.ceilingType) {
    throw new PricingValidationError('The selected ceiling finish is not available.')
  }

  if (!lighting?.value || lighting.value !== input.lighting) {
    throw new PricingValidationError('The selected lighting option is not available.')
  }

  if (!complexity?.value || complexity.value !== input.complexity) {
    throw new PricingValidationError('The selected room detail option is not available.')
  }

  return {
    ceilingType: input.ceilingType,
    city: typeof input.city === 'string' ? input.city.trim().slice(0, 120) : '',
    complexity: input.complexity,
    lighting: input.lighting,
    squareMeters: Math.round(squareMeters * 100) / 100,
  }
}

export const calculateSquareMetersFromDimensions = (lengthMeters: number, widthMeters: number) => {
  const length = asPositiveNumber(lengthMeters, 0)
  const width = asPositiveNumber(widthMeters, 0)

  return length > 0 && width > 0 ? Math.round(length * width * 100) / 100 : 0
}

export const calculateEstimate = (
  input: EstimateInput,
  settings: PricingSettings,
): EstimateResult => {
  const validatedInput = validateEstimateInput(input, settings)
  const squareMeters = validatedInput.squareMeters
  const basePriceRonPerSqm = asPositiveNumber(settings.basePriceRonPerSqm, 180)
  const minimumProjectRon = asNonNegativeNumber(settings.minimumProjectRon, 1500)
  const eurRate = asPositiveNumber(settings.eurRate, 5)
  const rangePercent = Math.min(60, asNonNegativeNumber(settings.rangePercent, 15)) / 100
  const ceilingType = findOption(settings.ceilingTypes, validatedInput.ceilingType)
  const lighting = findOption(settings.lightingOptions, validatedInput.lighting)
  const complexity = findOption(settings.complexityOptions, validatedInput.complexity)
  const cityFee = findCityFee(settings.cityFees, validatedInput.city)
  const travelFeeRon =
    cityFee?.fixedRon !== undefined && cityFee.fixedRon !== null
      ? asNonNegativeNumber(cityFee.fixedRon)
      : validatedInput.city?.trim()
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
