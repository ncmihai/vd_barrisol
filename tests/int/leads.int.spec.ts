// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getFallbackSiteData } from "@/lib/fallbackContent";

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  findGlobal: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  accept: vi.fn(),
  notify: vi.fn(),
}));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("@payloadcms/next/routes", () => ({
  REST_GET: vi.fn(),
  REST_PATCH: vi.fn(),
  REST_DELETE: vi.fn(),
}));
vi.mock("payload", () => ({ getPayload: async () => mocks }));
vi.mock("@/lib/leadNotifications", () => ({
  sendLeadNotification: mocks.notify,
}));
vi.mock("@/lib/leadGuard", async (original) => ({
  ...(await original<object>()),
  acceptLeadRequest: mocks.accept,
}));
import { POST } from "@/app/api/leads/route";

const pricing = {
  ...getFallbackSiteData("en").pricing,
  approved: true,
  updatedAt: "revision-1",
};
const body = () => ({
  name: "Test",
  phone: "0793124425",
  city: "Constanta",
  locale: "en",
  pricingVersion: "revision-1",
  calculatorInput: {
    squareMeters: 20,
    ceilingType: pricing.ceilingTypes![0].value,
    lighting: pricing.lightingOptions![0].value,
    complexity: pricing.complexityOptions![0].value,
  },
  estimateRonMin: 1,
  pricingSnapshot: { basePriceRonPerSqm: 1 },
});
const request = (value: unknown) =>
  new NextRequest("http://localhost/api/leads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "test-request-key-123456",
    },
    body: JSON.stringify(value),
  });

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYLOAD_SECRET = "test-only-secret";
  mocks.find.mockResolvedValue({ docs: [] });
  mocks.findGlobal.mockResolvedValue(pricing);
  mocks.create.mockResolvedValue({ id: 1 });
  mocks.update.mockResolvedValue({ id: 1 });
  mocks.accept.mockResolvedValue(true);
  mocks.notify.mockResolvedValue({ skipped: false });
});
describe("lead endpoint", () => {
  it("rejects null and array JSON before touching the database", async () => {
    expect((await POST(request(null))).status).toBe(400);
    expect((await POST(request([]))).status).toBe(400);
    expect(mocks.findGlobal).not.toHaveBeenCalled();
  });
  it("rejects oversized UTF-8 bodies", async () => {
    expect(
      (await POST(request({ ...body(), message: "é".repeat(11000) }))).status,
    ).toBe(400);
    expect(mocks.accept).not.toHaveBeenCalled();
  });
  it("saves server calculated prices and records notification delivery", async () => {
    expect((await POST(request(body()))).status).toBe(200);
    const saved = mocks.create.mock.calls[0][0].data;
    expect(saved.estimateRonMin).toBeGreaterThan(1);
    expect(saved.pricingSnapshot.basePriceRonPerSqm).toBe(
      pricing.basePriceRonPerSqm,
    );
    expect(saved.calculatorInput.schemaVersion).toBe(1);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { notificationStatus: "sent" } }),
    );
  });
  it("returns changed prices for review without saving", async () => {
    expect(
      (await POST(request({ ...body(), pricingVersion: "old" }))).status,
    ).toBe(409);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects invalid options", async () => {
    const value = body();
    value.calculatorInput.ceilingType = "unknown";
    expect((await POST(request(value))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("refuses unapproved prices", async () => {
    mocks.findGlobal.mockResolvedValue({ ...pricing, approved: false });
    expect((await POST(request(body()))).status).toBe(503);
  });
  it("rate limits before CMS reads", async () => {
    mocks.accept.mockResolvedValue(false);
    expect((await POST(request(body()))).status).toBe(429);
    expect(mocks.findGlobal).not.toHaveBeenCalled();
  });
  it("returns existing receipt without sending duplicate notifications", async () => {
    mocks.find.mockResolvedValue({ docs: [{ id: 2 }] });
    expect((await POST(request(body()))).status).toBe(200);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });
  it("keeps the saved lead when email fails", async () => {
    mocks.notify.mockRejectedValue(new Error("email unavailable"));
    expect((await POST(request(body()))).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { notificationStatus: "failed" } }),
    );
  });
  it("does not send email if persistence fails", async () => {
    mocks.create.mockRejectedValue(new Error("database unavailable"));
    expect((await POST(request(body()))).status).toBe(503);
    expect(mocks.notify).not.toHaveBeenCalled();
  });
});
