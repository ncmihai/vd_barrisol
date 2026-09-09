import { describe, expect, it } from "vitest";
import {
  calculateEstimate,
  parseDecimal,
  validatePricingSettings,
} from "@/lib/pricing";
import { getFallbackSiteData } from "@/lib/fallbackContent";
import { Projects } from "@/collections/Projects";
import { Testimonials } from "@/collections/Testimonials";
import { Leads } from "@/collections/Leads";
import { withDeadline } from "@/lib/timeouts";

const pricing = getFallbackSiteData("en").pricing;
const input = {
  ceilingType: pricing.ceilingTypes![0].value!,
  lighting: pricing.lightingOptions![0].value!,
  complexity: pricing.complexityOptions![0].value!,
  squareMeters: 20,
  city: "Constanta",
};
describe("beta trust boundaries", () => {
  it("matches accented city names without adding a fallback travel fee", () => {
    expect(
      calculateEstimate({ ...input, city: "Constan\u021ba" }, pricing),
    ).toEqual(calculateEstimate(input, pricing));
  });
  it("parses Romanian decimals and rejects malformed edits", () => {
    expect(parseDecimal("4,25")).toBe(4.25);
    for (const value of ["", "1e3", "2.3.4", "-3", "  ", "0x20"])
      expect(Number.isNaN(parseDecimal(value))).toBe(true);
  });
  it("derives dimension prices authoritatively instead of trusting supplied area", () => {
    const dimensions = calculateEstimate(
      {
        ...input,
        squareMeters: 999,
        areaMode: "dimensions",
        dimensions: { length: 4, width: 5 },
      },
      pricing,
    );
    expect(dimensions).toEqual(calculateEstimate(input, pricing));
    expect(() =>
      calculateEstimate({ ...input, squareMeters: 0.001 }, pricing),
    ).toThrow();
  });
  it("rejects invalid settings instead of using sample rates", () => {
    expect(() => validatePricingSettings({ ...pricing, eurRate: 0 })).toThrow();
    expect(() =>
      validatePricingSettings({
        ...pricing,
        ceilingTypes: [pricing.ceilingTypes![0], pricing.ceilingTypes![0]],
      }),
    ).toThrow();
    expect(() =>
      validatePricingSettings({ ...pricing, basePriceRonPerSqm: undefined }),
    ).toThrow();
  });
  it("restricts public collection access", async () => {
    const args = { req: { user: null } } as never;
    expect(await Projects.access!.read!(args)).toEqual({
      publication: { equals: "published" },
    });
    expect(await Testimonials.access!.read!(args)).toEqual({
      approved: { equals: true },
    });
    expect(await Leads.access!.create!(args)).toBe(false);
  });
  it("bounds hanging orchestration", async () => {
    await expect(withDeadline(new Promise(() => {}), 10)).rejects.toThrow(
      "deadline",
    );
  });
});
