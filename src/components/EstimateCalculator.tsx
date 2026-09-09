"use client";

import { type FormEvent, useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import {
  calculateEstimate,
  calculateSquareMetersFromDimensions,
  parseDecimal,
  type EstimateInput,
  type PricingOption,
  type PricingSettings,
} from "@/lib/pricing";

const copy = {
  en: {
    area: "Area",
    areaCopy:
      "Start with the approximate ceiling surface. You can enter square meters directly or calculate them from room dimensions.",
    back: "Back",
    ceilingType: "Finish",
    city: "City",
    complexity: "Room details",
    customCity: "Other city",
    details: "Details",
    dimensions: "Length x width",
    disclaimer: "Approximate estimate",
    invalidEstimate: "Complete the required fields to see an estimate.",
    email: "Email",
    factors: "Included factors",
    lighting: "Lighting",
    message: "Message",
    name: "Name",
    next: "Next",
    phone: "Phone",
    result: "Estimated range",
    send: "Send estimate",
    sent: "Estimate sent.",
    showLeadForm: "Send the estimate",
    squareMeters: "Square meters",
    squareMeterUnit: "sqm",
    submitError: "Could not send the estimate. Try WhatsApp or phone.",
    surface: "Surface",
    useDimensions: "Use dimensions",
    useSquareMeters: "Use square meters",
    whatsapp: "WhatsApp",
    whatsappMessage: "Hello, I made a VD BARRISOL estimate",
    width: "Width",
    length: "Length",
  },
  ro: {
    area: "Suprafata",
    areaCopy:
      "Incepe cu suprafata aproximativa a tavanului. Poti introduce direct metri patrati sau ii poti calcula din dimensiunile camerei.",
    back: "Inapoi",
    ceilingType: "Finisaj",
    city: "Oras",
    complexity: "Detalii camera",
    customCity: "Alt oras",
    details: "Detalii",
    dimensions: "Lungime x latime",
    disclaimer: "Estimare aproximativa",
    invalidEstimate:
      "Completeaza campurile obligatorii pentru a vedea estimarea.",
    email: "Email",
    factors: "Factori inclusi",
    lighting: "Iluminat",
    message: "Mesaj",
    name: "Nume",
    next: "Continua",
    phone: "Telefon",
    result: "Interval estimativ",
    send: "Trimite estimarea",
    sent: "Estimarea a fost trimisa.",
    showLeadForm: "Trimite estimarea",
    squareMeters: "Metri patrati",
    squareMeterUnit: "mp",
    submitError:
      "Estimarea nu a putut fi trimisa. Incearca WhatsApp sau telefon.",
    surface: "Suprafata",
    useDimensions: "Foloseste dimensiuni",
    useSquareMeters: "Foloseste metri patrati",
    whatsapp: "WhatsApp",
    whatsappMessage: "Buna, am facut o estimare VD BARRISOL",
    width: "Latime",
    length: "Lungime",
  },
} as const;

type AreaMode = "sqm" | "dimensions";

const getOptionValue = (
  options: PricingSettings["ceilingTypes"],
  fallback: string,
) => options?.[0]?.value || fallback;

const findOption = (
  options: PricingOption[] | null | undefined,
  value: string,
) =>
  (options || []).find((option) => option.value === value) ||
  (options || [])[0];

const optionKey = (option: PricingOption) => option.value || option.label || "";
const radioTabIndex = (
  options: PricingOption[] | null | undefined,
  option: PricingOption,
  selected: string,
) =>
  option.value === selected ||
  (!options?.some((item) => item.value === selected) && options?.[0] === option)
    ? 0
    : -1;

const moveRadioFocus = (event: React.KeyboardEvent<HTMLButtonElement>) => {
  if (
    ![
      "ArrowRight",
      "ArrowDown",
      "ArrowLeft",
      "ArrowUp",
      "Home",
      "End",
    ].includes(event.key)
  )
    return;
  event.preventDefault();
  const buttons = Array.from(
    event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
      '[role="radio"]',
    ),
  );
  const current = buttons.indexOf(event.currentTarget);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? buttons.length - 1
        : (current +
            (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) +
            buttons.length) %
          buttons.length;
  buttons[next]?.focus();
  buttons[next]?.click();
};

const formatNumber = (value: number, locale: Locale = "ro") =>
  value.toLocaleString(locale === "ro" ? "ro-RO" : "en-GB", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

const formatCurrencyRange = (
  min: number,
  max: number,
  currency: "RON" | "EUR",
  locale: Locale,
) => `${formatNumber(min, locale)} - ${formatNumber(max, locale)} ${currency}`;

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
  city: string;
  cityLabel: string;
  complexityFieldLabel: string;
  complexityLabel: string;
  estimateLabel: string;
  estimateEur: string;
  estimateRon: string;
  finishFieldLabel: string;
  lightingFieldLabel: string;
  lightingLabel: string;
  squareMeterUnit: string;
  squareMeters: number;
  surfaceFieldLabel: string;
  surfaceLabel: string;
  title: string;
  whatsappHref: string;
}) => {
  if (whatsappHref === "#contact") {
    return whatsappHref;
  }

  const message = [
    title,
    `${estimateLabel}: ${estimateRon} (${estimateEur})`,
    `${surfaceFieldLabel}: ${formatNumber(squareMeters, squareMeterUnit === "sqm" ? "en" : "ro")} ${squareMeterUnit}`,
    `${finishFieldLabel}: ${surfaceLabel}`,
    `${lightingFieldLabel}: ${lightingLabel}`,
    `${complexityFieldLabel}: ${complexityLabel}`,
    `${cityLabel}: ${city}`,
  ].join("\n");
  const separator = whatsappHref.includes("?") ? "&" : "?";

  return `${whatsappHref}${separator}text=${encodeURIComponent(message)}`;
};

export function EstimateCalculator({
  locale,
  pricing: initialPricing,
  serviceCities,
  whatsappHref,
  pricingAvailable = true,
}: {
  locale: Locale;
  pricing: PricingSettings;
  serviceCities: string[];
  whatsappHref: string;
  pricingAvailable?: boolean;
}) {
  const [pricing, setCurrentPricing] = useState(initialPricing);
  const labels = copy[locale];
  const cities = serviceCities.length > 0 ? serviceCities : ["Constanta"];
  const defaultCity = cities.includes("Constanta") ? "Constanta" : cities[0];
  const steps = [
    { key: "area", label: labels.area },
    { key: "finish", label: labels.ceilingType },
    { key: "lighting", label: labels.lighting },
    { key: "details", label: labels.details },
  ];
  const [activeStep, setActiveStep] = useState(0);
  const [areaMode, setAreaMode] = useState<AreaMode>("sqm");
  const [dimensions, setDimensions] = useState({
    length: "5",
    width: "4",
  });
  const [rawArea, setRawArea] = useState("20");
  const [restored, setRestored] = useState(false);
  const submissionKey = useRef("");
  const sending = useRef(false);
  const [input, setInput] = useState<EstimateInput>({
    ceilingType: getOptionValue(pricing.ceilingTypes, "mat-standard"),
    city: defaultCity,
    complexity: getOptionValue(pricing.complexityOptions, "simple"),
    lighting: getOptionValue(pricing.lightingOptions, "none"),
    squareMeters: 20,
  });
  const [lead, setLead] = useState({
    email: "",
    message: "",
    name: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error" | "review">(
    "idle",
  );
  useEffect(() => {
    // Session state is read after hydration so the server and initial client markup agree.
    restoreSession();
    function restoreSession() {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("vd-estimate-v1") || "null",
        );
        if (
          saved?.version === 1 &&
          typeof saved.rawArea === "string" &&
          saved.rawArea.length <= 30 &&
          typeof saved.dimensions?.length === "string" &&
          typeof saved.dimensions?.width === "string" &&
          saved.input &&
          typeof saved.input.city === "string" &&
          saved.input.city.length <= 120 &&
          typeof saved.input.ceilingType === "string" &&
          typeof saved.input.lighting === "string" &&
          typeof saved.input.complexity === "string" &&
          ["sqm", "dimensions"].includes(saved.areaMode)
        ) {
          setInput({
            ...saved.input,
            squareMeters:
              saved.areaMode === "dimensions"
                ? calculateSquareMetersFromDimensions(
                    parseDecimal(saved.dimensions.length),
                    parseDecimal(saved.dimensions.width),
                  )
                : parseDecimal(saved.rawArea),
          });
          setRawArea(saved.rawArea);
          setDimensions(saved.dimensions);
          setAreaMode(saved.areaMode);
          setActiveStep(
            Math.max(0, Math.min(3, Number(saved.activeStep) || 0)),
          );
        }
      } catch {
        /* Storage is optional; do not persist contact fields. */
      }
      setRestored(true);
    }
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(
        "vd-estimate-v1",
        JSON.stringify({
          version: 1,
          input,
          rawArea,
          dimensions,
          areaMode,
          activeStep,
        }),
      );
    } catch {
      /* Private browsing may deny storage. */
    }
  }, [restored, input, rawArea, dimensions, areaMode, activeStep]);
  const estimate = useMemo(() => {
    if (!pricingAvailable) return null;
    try {
      return calculateEstimate(input, pricing);
    } catch {
      return null;
    }
  }, [input, pricing, pricingAvailable]);
  const hasValidEstimate = Boolean(estimate);
  const ceilingType = findOption(pricing.ceilingTypes, input.ceilingType);
  const lighting = findOption(pricing.lightingOptions, input.lighting);
  const complexity = findOption(pricing.complexityOptions, input.complexity);
  const estimateRon = estimate
    ? formatCurrencyRange(
        estimate.estimateRonMin,
        estimate.estimateRonMax,
        "RON",
        locale,
      )
    : labels.invalidEstimate;
  const estimateEur = estimate
    ? formatCurrencyRange(
        estimate.estimateEurMin,
        estimate.estimateEurMax,
        "EUR",
        locale,
      )
    : "";
  const factorChips = [
    `${labels.surface}: ${Number.isFinite(input.squareMeters) ? `${formatNumber(input.squareMeters, locale)} ${labels.squareMeterUnit}` : "—"}`,
    ceilingType?.label || labels.ceilingType,
    lighting?.label || labels.lighting,
    complexity?.label || labels.complexity,
    input.city || labels.city,
  ];
  const richerCalculatorInput = {
    ...input,
    schemaVersion: 1,
    areaMode,
    dimensions:
      areaMode === "dimensions"
        ? {
            length: parseDecimal(dimensions.length),
            width: parseDecimal(dimensions.width),
          }
        : null,
    selectedLabels: {
      ceilingType: ceilingType?.label || "",
      complexity: complexity?.label || "",
      lighting: lighting?.label || "",
    },
  };
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
    title: `${labels.whatsappMessage}. ${pricing.disclaimer || labels.disclaimer}`,
    whatsappHref,
  });

  const updateInput = (nextInput: Partial<EstimateInput>) => {
    setInput((current) => ({
      ...current,
      ...nextInput,
    }));
  };

  const updateDimensions = (nextDimensions: Partial<typeof dimensions>) => {
    const updated = {
      ...dimensions,
      ...nextDimensions,
    };
    const squareMeters = calculateSquareMetersFromDimensions(
      parseDecimal(updated.length),
      parseDecimal(updated.width),
    );

    setDimensions(updated);
    setInput((currentInput) => ({
      ...currentInput,
      squareMeters,
    }));
  };

  const handleAreaMode = (nextMode: AreaMode) => {
    setAreaMode(nextMode);

    if (nextMode === "dimensions") {
      updateInput({
        squareMeters: calculateSquareMetersFromDimensions(
          parseDecimal(dimensions.length),
          parseDecimal(dimensions.width),
        ),
      });
    } else {
      updateInput({ squareMeters: parseDecimal(rawArea) });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!estimate || sending.current || status === "sent") return;
    sending.current = true;
    submissionKey.current ||= crypto.randomUUID();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/leads", {
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
          preferredContact: "whatsapp",
          pricingVersion: pricing.updatedAt,
        }),
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": submissionKey.current,
        },
        method: "POST",
      });

      if (response.status === 409) {
        const result = await response.json();
        if (result.code === "PRICING_CHANGED") {
          setCurrentPricing(result.pricing);
          setStatus("review");
          return;
        }
      }
      if (!response.ok) {
        throw new Error("Lead request failed.");
      }

      setStatus("sent");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
      sending.current = false;
    }
  };

  return (
    <div className="estimate-tool">
      {!pricingAvailable && (
        <p className="lead-form__message" role="status">
          {locale === "ro"
            ? "Estimarea numerica nu este disponibila momentan. Discuta proiectul cu noi pe WhatsApp."
            : "A numeric estimate is currently unavailable. Discuss your project with us on WhatsApp."}
        </p>
      )}
      <div className="estimate-guided">
        <div
          className="estimate-steps"
          aria-label={locale === "ro" ? "Pasi calculator" : "Calculator steps"}
        >
          {steps.map((step, index) => (
            <button
              aria-current={index === activeStep ? "step" : undefined}
              className={index === activeStep ? "is-active" : ""}
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
                  className={areaMode === "sqm" ? "is-active" : ""}
                  onClick={() => handleAreaMode("sqm")}
                  type="button"
                >
                  {labels.useSquareMeters}
                </button>
                <button
                  className={areaMode === "dimensions" ? "is-active" : ""}
                  onClick={() => handleAreaMode("dimensions")}
                  type="button"
                >
                  {labels.useDimensions}
                </button>
              </div>
              {areaMode === "sqm" ? (
                <label className="estimate-field estimate-field--large">
                  <span>{labels.squareMeters}</span>
                  <input
                    inputMode="decimal"
                    aria-invalid={!hasValidEstimate && pricingAvailable}
                    onChange={(event) => {
                      setRawArea(event.target.value);
                      updateInput({
                        squareMeters: parseDecimal(event.target.value),
                      });
                    }}
                    type="text"
                    value={rawArea}
                  />
                </label>
              ) : (
                <div className="dimension-grid">
                  <label className="estimate-field">
                    <span>{labels.length}</span>
                    <input
                      inputMode="decimal"
                      onChange={(event) =>
                        updateDimensions({ length: event.target.value })
                      }
                      type="text"
                      value={dimensions.length}
                    />
                  </label>
                  <label className="estimate-field">
                    <span>{labels.width}</span>
                    <input
                      inputMode="decimal"
                      onChange={(event) =>
                        updateDimensions({ width: event.target.value })
                      }
                      type="text"
                      value={dimensions.width}
                    />
                  </label>
                  <div className="dimension-result">
                    <span>{labels.squareMeters}</span>
                    <strong>
                      {formatNumber(input.squareMeters, locale)}{" "}
                      {labels.squareMeterUnit}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeStep === 1 && (
            <div
              aria-label={labels.ceilingType}
              className="option-grid"
              role="radiogroup"
            >
              {(pricing.ceilingTypes || []).map((option) => (
                <button
                  className={
                    option.value === input.ceilingType
                      ? "option-card is-selected"
                      : "option-card"
                  }
                  role="radio"
                  aria-checked={option.value === input.ceilingType}
                  tabIndex={radioTabIndex(
                    pricing.ceilingTypes,
                    option,
                    input.ceilingType,
                  )}
                  onKeyDown={moveRadioFocus}
                  key={optionKey(option)}
                  onClick={() =>
                    updateInput({ ceilingType: option.value || "" })
                  }
                  type="button"
                >
                  <span>{labels.ceilingType}</span>
                  <strong>{option.label}</strong>
                </button>
              ))}
            </div>
          )}

          {activeStep === 2 && (
            <div
              aria-label={labels.lighting}
              className="option-grid"
              role="radiogroup"
            >
              {(pricing.lightingOptions || []).map((option) => (
                <button
                  className={
                    option.value === input.lighting
                      ? "option-card is-selected"
                      : "option-card"
                  }
                  role="radio"
                  aria-checked={option.value === input.lighting}
                  tabIndex={radioTabIndex(
                    pricing.lightingOptions,
                    option,
                    input.lighting,
                  )}
                  onKeyDown={moveRadioFocus}
                  key={optionKey(option)}
                  onClick={() => updateInput({ lighting: option.value || "" })}
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
              <div
                aria-label={labels.complexity}
                className="option-grid"
                role="radiogroup"
              >
                {(pricing.complexityOptions || []).map((option) => (
                  <button
                    className={
                      option.value === input.complexity
                        ? "option-card is-selected"
                        : "option-card"
                    }
                    role="radio"
                    aria-checked={option.value === input.complexity}
                    tabIndex={radioTabIndex(
                      pricing.complexityOptions,
                      option,
                      input.complexity,
                    )}
                    onKeyDown={moveRadioFocus}
                    key={optionKey(option)}
                    onClick={() =>
                      updateInput({ complexity: option.value || "" })
                    }
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
                      className={city === input.city ? "is-selected" : ""}
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
                    onChange={(event) =>
                      updateInput({ city: event.target.value })
                    }
                    type="text"
                    value={cities.includes(input.city || "") ? "" : input.city}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="estimate-navigation">
            <button
              className="button button--ghost-light"
              disabled={activeStep === 0}
              onClick={() =>
                setActiveStep((current) => Math.max(0, current - 1))
              }
              type="button"
            >
              {labels.back}
            </button>
            {activeStep === steps.length - 1 ? (
              <Link
                className="button button--primary"
                href={`${locale === "ro" ? "/ro/galerie" : "/en/gallery"}?finish=${encodeURIComponent(input.ceilingType)}&lighting=${encodeURIComponent(input.lighting)}`}
              >
                {locale === "ro"
                  ? "Vezi exemple potrivite"
                  : "View matching projects"}
              </Link>
            ) : (
              <button
                className="button button--primary"
                disabled={!hasValidEstimate && pricingAvailable}
                onClick={() =>
                  setActiveStep((current) =>
                    Math.min(steps.length - 1, current + 1),
                  )
                }
                type="button"
              >
                {labels.next}
              </button>
            )}
          </div>
        </div>
      </div>

      <aside className="estimate-result">
        <span>{labels.result}</span>
        <strong aria-live="polite">{estimateRon}</strong>
        <em>{estimateEur}</em>
        <div className="estimate-factors" aria-label={labels.factors}>
          {factorChips.map((factor) => (
            <small key={factor}>{factor}</small>
          ))}
        </div>
        <p>{pricing.disclaimer || labels.disclaimer}</p>
        <p>
          {pricing.vatMode === "included"
            ? locale === "ro"
              ? "TVA inclus."
              : "VAT included."
            : pricing.vatMode === "excluded"
              ? locale === "ro"
                ? "TVA exclus; nu este calculat aici."
                : "VAT excluded; not calculated here."
              : locale === "ro"
                ? "Tratamentul TVA se confirma in oferta."
                : "VAT treatment will be confirmed in the proposal."}
        </p>
        <div className="estimate-actions">
          <a
            className="button button--dark"
            href={hasValidEstimate ? prefilledWhatsappHref : whatsappHref}
          >
            {labels.whatsapp}
          </a>
          <button
            className="button button--primary"
            disabled={!hasValidEstimate}
            onClick={() => setShowLeadForm(true)}
            type="button"
          >
            {labels.showLeadForm}
          </button>
        </div>
      </aside>

      {showLeadForm && (
        <form className="lead-form" onSubmit={handleSubmit}>
          <label>
            <span>{labels.name} *</span>
            <input
              onChange={(event) =>
                setLead((current) => ({ ...current, name: event.target.value }))
              }
              required
              type="text"
              value={lead.name}
            />
          </label>
          <label>
            <span>{labels.phone} *</span>
            <input
              onChange={(event) =>
                setLead((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              required
              type="tel"
              value={lead.phone}
            />
          </label>
          <label>
            <span>{labels.email}</span>
            <input
              onChange={(event) =>
                setLead((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              type="email"
              value={lead.email}
            />
          </label>
          <label className="lead-form__message">
            <span>{labels.message}</span>
            <textarea
              onChange={(event) =>
                setLead((current) => ({
                  ...current,
                  message: event.target.value,
                }))
              }
              value={lead.message}
            />
          </label>
          <p className="lead-form__message">
            {locale === "ro"
              ? "* Obligatoriu. Emailul si mesajul sunt optionale. Datele sunt folosite pentru a raspunde solicitarii."
              : "* Required. Email and message are optional. Your details are used to respond to this enquiry."}{" "}
            <Link
              href={locale === "ro" ? "/ro/confidentialitate" : "/en/privacy"}
            >
              {locale === "ro" ? "Confidentialitate" : "Privacy"}
            </Link>
          </p>
          <button
            className="button button--primary"
            disabled={isSubmitting || status === "sent" || !hasValidEstimate}
            type="submit"
          >
            {labels.send}
          </button>
          {status === "sent" && (
            <p role="status" className="form-status form-status--ok">
              {labels.sent}
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="form-status form-status--error">
              {labels.submitError}
            </p>
          )}
          {status === "review" && (
            <p role="alert" className="form-status">
              {locale === "ro"
                ? "Preturile s-au schimbat. Verifica noua estimare si trimite din nou pentru confirmare."
                : "Prices changed. Review the updated estimate and send again to confirm."}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
