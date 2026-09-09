import config from "@payload-config";
import { NextResponse, type NextRequest } from "next/server";
import { getPayload } from "payload";
import { REST_GET, REST_PATCH, REST_DELETE } from "@payloadcms/next/routes";

import {
  calculateEstimate,
  type EstimateInput,
  type PricingSettings,
  PricingValidationError,
  validateEstimateInput,
  validatePricingSettings,
} from "@/lib/pricing";
import { sendLeadNotification } from "@/lib/leadNotifications";
import type { Lead } from "@/payload-types";
import { acceptLeadRequest, hashLeadKey, readLeadBody } from "@/lib/leadGuard";
import { withDeadline } from "@/lib/timeouts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// The custom POST shadows Payload's catch-all route; preserve authenticated admin list/bulk operations.
const leadRoute = { params: Promise.resolve({ slug: ["leads"] }) };
export const GET = (request: NextRequest) =>
  REST_GET(config)(request, leadRoute);
export const PATCH = (request: NextRequest) =>
  REST_PATCH(config)(request, leadRoute);
export const DELETE = (request: NextRequest) =>
  REST_DELETE(config)(request, leadRoute);

type LeadJsonValue = Exclude<Lead["calculatorInput"], undefined>;

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const toLeadJsonValue = (value: unknown): LeadJsonValue => {
  if (value === null || value === undefined) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return value;
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return value as Record<string, unknown>;
  return null;
};

const asText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const asEstimateInput = (
  value: unknown,
  city: string,
): EstimateInput | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  return {
    schemaVersion: record.schemaVersion as 1,
    areaMode: record.areaMode as EstimateInput["areaMode"],
    dimensions: record.dimensions as EstimateInput["dimensions"],
    ceilingType: asText(record.ceilingType, 80),
    city,
    complexity: asText(record.complexity, 80),
    lighting: asText(record.lighting, 80),
    squareMeters:
      typeof record.squareMeters === "number" ? record.squareMeters : NaN,
  };
};

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await readLeadBody(request);
  } catch {
    return errorResponse("Invalid request body.");
  }

  const name = asText(body.name, 120);
  for (const [field, maximum] of Object.entries({
    name: 120,
    phone: 30,
    email: 160,
    city: 120,
    message: 4000,
  })) {
    if (
      body[field] !== undefined &&
      (typeof body[field] !== "string" || body[field].length > maximum)
    )
      return errorResponse(`Invalid ${field}.`);
  }
  const phone = asText(body.phone, 60);
  const city = asText(body.city, 120);
  const email = asText(body.email, 160);
  const message = asText(body.message, 4000);
  const locale = body.locale === "en" ? "en" : "ro";
  const preferredContact = ["whatsapp", "phone", "email"].includes(
    String(body.preferredContact),
  )
    ? (body.preferredContact as "whatsapp" | "phone" | "email")
    : "whatsapp";

  if (!name) return errorResponse("Name is required.");
  if (!phone) return errorResponse("Phone is required.");
  if (!/^[+\d\s().-]{7,30}$/.test(phone))
    return errorResponse("Invalid phone number.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return errorResponse("Invalid email.");
  if (body.website) return errorResponse("Invalid enquiry.");
  const requestId = request.headers.get("idempotency-key") || "";
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(requestId))
    return errorResponse("Missing request key.");

  const calculatorInput = asEstimateInput(body.calculatorInput, city);
  if (!calculatorInput)
    return errorResponse("A valid calculator configuration is required.");

  try {
    if (
      !(await acceptLeadRequest(
        request.headers
          .get(
            process.env.VERCEL ? "x-vercel-forwarded-for" : "x-forwarded-for",
          )
          ?.split(",")[0]
          ?.trim() || "unknown",
      ))
    )
      return errorResponse("Too many requests. Please use WhatsApp.", 429);
    const payload = await withDeadline(getPayload({ config }));
    const requestKey = hashLeadKey(requestId);
    const existing = await payload.find({
      collection: "leads",
      where: { requestKey: { equals: requestKey } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (existing.docs.length)
      return NextResponse.json({ ok: true, id: existing.docs[0].id });
    const pricing = (await payload.findGlobal({
      depth: 0,
      locale,
      fallbackLocale: false,
      slug: "pricing-settings",
    })) as unknown as PricingSettings;
    validatePricingSettings(pricing);
    if (pricing.approved !== true)
      return errorResponse("Pricing is unavailable. Please contact us.", 503);
    const validatedInput = validateEstimateInput(calculatorInput, pricing);
    const estimate = calculateEstimate(validatedInput, pricing);
    if (body.pricingVersion !== pricing.updatedAt)
      return NextResponse.json(
        {
          error: "Prices changed. Review the updated estimate before sending.",
          pricing,
          code: "PRICING_CHANGED",
        },
        { status: 409 },
      );
    const lead = await payload.create({
      collection: "leads",
      data: {
        requestKey,
        notificationStatus: "pending",
        calculatorInput: toLeadJsonValue({ ...validatedInput, locale }),
        city: validatedInput.city || "",
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
        source: "website-calculator",
      },
      overrideAccess: true,
    });

    try {
      const notification = await sendLeadNotification({
        requestKey,
        specification: JSON.stringify(validatedInput),
        city: validatedInput.city,
        email,
        estimateEurMax: estimate.estimateEurMax,
        estimateEurMin: estimate.estimateEurMin,
        estimateRonMax: estimate.estimateRonMax,
        estimateRonMin: estimate.estimateRonMin,
        message,
        name,
        phone,
      });
      await payload.update({
        collection: "leads",
        id: lead.id,
        data: { notificationStatus: notification.skipped ? "skipped" : "sent" },
        overrideAccess: true,
      });
    } catch (error) {
      console.error(
        "[lead-email] failed",
        error instanceof Error ? error.message : error,
      );
      await payload
        .update({
          collection: "leads",
          id: lead.id,
          data: { notificationStatus: "failed" },
          overrideAccess: true,
        })
        .catch(() => undefined);
    }

    return NextResponse.json({ estimate, id: lead.id, ok: true });
  } catch (error) {
    if (error instanceof PricingValidationError)
      return errorResponse(error.message);

    console.error(
      "[lead] failed",
      error instanceof Error ? error.message : error,
    );
    return errorResponse("The enquiry could not be saved right now.", 503);
  }
}
