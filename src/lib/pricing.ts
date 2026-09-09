export type PricingOption = {
  fixedRon?: number | null;
  label?: string | null;
  multiplier?: number | null;
  perSqmRon?: number | null;
  value?: string | null;
};

export type CityFee = {
  city?: string | null;
  fixedRon?: number | null;
};

export type PricingSettings = {
  approved?: boolean | null;
  updatedAt?: string | null;
  basePriceRonPerSqm?: number | null;
  ceilingTypes?: PricingOption[] | null;
  cityFees?: CityFee[] | null;
  complexityOptions?: PricingOption[] | null;
  disclaimer?: string | null;
  eurRate?: number | null;
  fallbackTravelFeeRon?: number | null;
  lightingOptions?: PricingOption[] | null;
  minimumProjectRon?: number | null;
  rangePercent?: number | null;
  vatMode?: "included" | "excluded" | "not-specified" | null;
};

export type EstimateInput = {
  schemaVersion?: 1;
  areaMode?: "sqm" | "dimensions";
  dimensions?: { length: number; width: number } | null;
  ceilingType: string;
  city?: string;
  complexity: string;
  lighting: string;
  squareMeters: number;
};

export class PricingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingValidationError";
  }
}

export type EstimateResult = {
  baseRon: number;
  estimateEurMax: number;
  estimateEurMin: number;
  estimateRonMax: number;
  estimateRonMin: number;
  lineItems: Array<{
    label: string;
    valueRon: number;
  }>;
  subtotalRon: number;
};

const asPositiveNumber = (value: unknown, fallback: number) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : fallback;
};

const asNonNegativeNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue >= 0
    ? numberValue
    : fallback;
};

const findOption = (
  options: PricingOption[] | null | undefined,
  value: string,
) =>
  (options || []).find((option) => option.value === value) ||
  (options || [])[0];

const normalizeCity = (city?: string | null) =>
  city
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const findCityFee = (fees: CityFee[] | null | undefined, city?: string) => {
  const normalizedCity = normalizeCity(city);

  if (!normalizedCity) {
    return undefined;
  }

  return (fees || []).find((fee) => normalizeCity(fee.city) === normalizedCity);
};

const roundCurrency = (value: number) => Math.round(value);

export const parseDecimal = (value: string): number =>
  /^\d+(?:[.,]\d+)?$/.test(value.trim())
    ? Number(value.trim().replace(",", "."))
    : NaN;

export function validatePricingSettings(
  settings: PricingSettings,
): PricingSettings {
  const validNumber = (value: unknown, min: number, max = 10000000) =>
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max;
  for (const field of ["basePriceRonPerSqm", "eurRate"] as const) {
    if (!validNumber(settings[field], 0.01))
      throw new PricingValidationError(`Invalid pricing: ${field}`);
  }
  for (const field of [
    "minimumProjectRon",
    "fallbackTravelFeeRon",
    "rangePercent",
  ] as const) {
    if (
      !validNumber(settings[field], 0, field === "rangePercent" ? 60 : 10000000)
    )
      throw new PricingValidationError(`Invalid pricing: ${field}`);
  }
  for (const field of [
    "ceilingTypes",
    "lightingOptions",
    "complexityOptions",
  ] as const) {
    const options = settings[field];
    if (!options?.length)
      throw new PricingValidationError(`Missing pricing: ${field}`);
    const ids = new Set<string>();
    for (const option of options) {
      if (
        !option.label?.trim() ||
        !option.value?.trim() ||
        ids.has(option.value)
      )
        throw new PricingValidationError(
          "Pricing labels and IDs must be present; IDs must be unique.",
        );
      ids.add(option.value);
      const fields =
        field === "lightingOptions"
          ? (["fixedRon", "perSqmRon"] as const)
          : (["multiplier"] as const);
      for (const key of fields) {
        if (!validNumber(option[key], key === "multiplier" ? 0.01 : 0))
          throw new PricingValidationError(`Invalid option: ${key}`);
      }
    }
  }
  const cities = new Set<string>();
  for (const fee of settings.cityFees || []) {
    const city = normalizeCity(fee.city);
    if (!city || cities.has(city) || !validNumber(fee.fixedRon, 0))
      throw new PricingValidationError("Invalid or duplicate city fee.");
    cities.add(city);
  }
  return settings;
}

export const validateEstimateInput = (
  input: EstimateInput,
  settings: PricingSettings,
): EstimateInput => {
  if (input.schemaVersion !== undefined && input.schemaVersion !== 1)
    throw new PricingValidationError("Unsupported estimate version.");
  if (
    input.areaMode !== undefined &&
    !["sqm", "dimensions"].includes(input.areaMode)
  )
    throw new PricingValidationError("Invalid area mode.");
  if (
    input.areaMode === "dimensions" &&
    (typeof input.dimensions?.length !== "number" ||
      typeof input.dimensions?.width !== "number" ||
      !Number.isFinite(input.dimensions.length) ||
      !Number.isFinite(input.dimensions.width) ||
      input.dimensions.length <= 0 ||
      input.dimensions.width <= 0 ||
      input.dimensions.length > 1000 ||
      input.dimensions.width > 1000)
  )
    throw new PricingValidationError(
      "Dimensions must be positive numbers up to 1000 meters.",
    );
  const squareMeters =
    input.areaMode === "dimensions"
      ? calculateSquareMetersFromDimensions(
          input.dimensions?.length ?? 0,
          input.dimensions?.width ?? 0,
        )
      : input.squareMeters;
  const ceilingType = findOption(settings.ceilingTypes, input.ceilingType);
  const lighting = findOption(settings.lightingOptions, input.lighting);
  const complexity = findOption(settings.complexityOptions, input.complexity);

  if (
    !Number.isFinite(squareMeters) ||
    squareMeters < 0.01 ||
    squareMeters > 10000
  ) {
    throw new PricingValidationError(
      "Square meters must be between 0 and 10000.",
    );
  }

  if (!ceilingType?.value || ceilingType.value !== input.ceilingType) {
    throw new PricingValidationError(
      "The selected ceiling finish is not available.",
    );
  }

  if (!lighting?.value || lighting.value !== input.lighting) {
    throw new PricingValidationError(
      "The selected lighting option is not available.",
    );
  }

  if (!complexity?.value || complexity.value !== input.complexity) {
    throw new PricingValidationError(
      "The selected room detail option is not available.",
    );
  }

  return {
    schemaVersion: 1,
    areaMode: input.areaMode || "sqm",
    dimensions: input.areaMode === "dimensions" ? input.dimensions : null,
    ceilingType: input.ceilingType,
    city: typeof input.city === "string" ? input.city.trim().slice(0, 120) : "",
    complexity: input.complexity,
    lighting: input.lighting,
    squareMeters: Math.round(squareMeters * 100) / 100,
  };
};

export const calculateSquareMetersFromDimensions = (
  lengthMeters: number,
  widthMeters: number,
) => {
  const length = asPositiveNumber(lengthMeters, 0);
  const width = asPositiveNumber(widthMeters, 0);

  return length > 0 && width > 0 ? Math.round(length * width * 100) / 100 : 0;
};

export const calculateEstimate = (
  input: EstimateInput,
  settings: PricingSettings,
): EstimateResult => {
  validatePricingSettings(settings);
  const validatedInput = validateEstimateInput(input, settings);
  const squareMeters = validatedInput.squareMeters;
  const basePriceRonPerSqm = asPositiveNumber(settings.basePriceRonPerSqm, 180);
  const minimumProjectRon = asNonNegativeNumber(
    settings.minimumProjectRon,
    1500,
  );
  const eurRate = asPositiveNumber(settings.eurRate, 5);
  const rangePercent =
    Math.min(60, asNonNegativeNumber(settings.rangePercent, 15)) / 100;
  const ceilingType = findOption(
    settings.ceilingTypes,
    validatedInput.ceilingType,
  );
  const lighting = findOption(
    settings.lightingOptions,
    validatedInput.lighting,
  );
  const complexity = findOption(
    settings.complexityOptions,
    validatedInput.complexity,
  );
  const cityFee = findCityFee(settings.cityFees, validatedInput.city);
  const travelFeeRon =
    cityFee?.fixedRon !== undefined && cityFee.fixedRon !== null
      ? asNonNegativeNumber(cityFee.fixedRon)
      : validatedInput.city?.trim()
        ? asNonNegativeNumber(settings.fallbackTravelFeeRon, 0)
        : 0;
  const ceilingMultiplier = asPositiveNumber(ceilingType?.multiplier, 1);
  const complexityMultiplier = asPositiveNumber(complexity?.multiplier, 1);
  const lightingFixedRon = asNonNegativeNumber(lighting?.fixedRon);
  const lightingPerSqmRon = asNonNegativeNumber(lighting?.perSqmRon);
  const materialRon = squareMeters * basePriceRonPerSqm * ceilingMultiplier;
  const complexityRon = materialRon * (complexityMultiplier - 1);
  const lightingRon = lightingFixedRon + lightingPerSqmRon * squareMeters;
  const rawSubtotalRon =
    materialRon + complexityRon + lightingRon + travelFeeRon;
  const subtotalRon = Math.max(minimumProjectRon, rawSubtotalRon);
  const estimateRonMin = roundCurrency(subtotalRon * (1 - rangePercent));
  const estimateRonMax = roundCurrency(subtotalRon * (1 + rangePercent));

  return {
    baseRon: roundCurrency(materialRon),
    estimateEurMax: roundCurrency(estimateRonMax / eurRate),
    estimateEurMin: roundCurrency(estimateRonMin / eurRate),
    estimateRonMax,
    estimateRonMin,
    lineItems: [
      {
        label: "Material si montaj",
        valueRon: roundCurrency(materialRon),
      },
      {
        label: "Complexitate",
        valueRon: roundCurrency(complexityRon),
      },
      {
        label: "Iluminat",
        valueRon: roundCurrency(lightingRon),
      },
      {
        label: "Transport / deplasare",
        valueRon: roundCurrency(travelFeeRon),
      },
      {
        label: "Prag minim proiect",
        valueRon:
          subtotalRon === minimumProjectRon
            ? roundCurrency(minimumProjectRon - rawSubtotalRon)
            : 0,
      },
    ].filter((item) => item.valueRon > 0),
    subtotalRon: roundCurrency(subtotalRon),
  };
};
