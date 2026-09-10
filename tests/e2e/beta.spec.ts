import { test, expect } from "@playwright/test";

for (const locale of ["ro", "en"]) {
  test(`${locale}: calculator, locale continuity, invalid values and mobile layout`, async ({
    page,
  }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    const area = page.locator(".estimate-field--large input");
    await area.fill("24,5");
    await expect(page.locator(".estimate-result strong")).toContainText("RON");
    const whatsapp = page.locator(".estimate-actions a");
    expect(
      decodeURIComponent((await whatsapp.getAttribute("href")) || ""),
    ).toContain(locale === "ro" ? "24,5" : "24.5");
    await area.fill("");
    await expect(page.locator(".estimate-result strong")).not.toContainText(
      "RON",
    );
    await area.fill("24,5");
    await page.locator(".locale-link").click();
    await expect(page.locator(".estimate-field--large input")).toHaveValue(
      "24,5",
    );
    await page.locator(".estimate-actions button").click();
    await expect(page.locator(".lead-form")).toBeVisible();
    for (const width of [320, 390, 479, 736, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `output/playwright/beta-${locale}-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `output/playwright/beta-${locale}-mobile.png`,
      fullPage: true,
    });
  });
}

test("routes, equivalent gallery language switch and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of [
    "/ro",
    "/en",
    "/ro/galerie",
    "/en/gallery",
    "/ro/despre",
    "/en/about",
    "/ro/confidentialitate",
    "/en/privacy",
    "/ro/cookies",
    "/en/cookies",
  ]) {
    expect((await page.goto(route))?.status()).toBe(200);
  }
  await page.goto("/ro/galerie");
  await page.locator(".locale-link").click();
  await expect(page).toHaveURL(/\/en\/gallery$/);
  await page.goto("/ro#calculator");
  await expect(page.locator(".hero-stretch-reveal")).toHaveCount(0);
});

test("keyboard options and no-JavaScript contact fallback", async ({
  page,
  browser,
}) => {
  await page.goto("/en");
  await page.locator(".estimate-steps button").nth(1).click();
  const radio = page.getByRole("radio").first();
  await radio.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio").nth(1)).toHaveAttribute(
    "aria-checked",
    "true",
  );
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJS = await context.newPage();
  await noJS.goto("/en");
  // With JavaScript disabled, the app exposes the intentional contact fallback.
  expect(
    await noJS.locator("noscript").evaluate((node) => node.textContent),
  ).toContain("For an estimate");
  await expect(noJS.locator("noscript a")).toHaveAttribute("href", "#contact");
  await expect(noJS.locator('#contact a[href^="tel:"]')).toBeVisible();
  await context.close();
});

test("record repeatable mobile lab samples", async ({ page }, testInfo) => {
  const results = [];
  await page.setViewportSize({ width: 390, height: 844 });
  for (const reducedMotion of ["reduce", "no-preference"] as const) {
    for (let run = 0; run < 3; run++) {
      await page.emulateMedia({ reducedMotion });
      await page.addInitScript(() => {
        sessionStorage.removeItem("vd-barrisol-intro-seen");
        const metrics = { lcp: 0, cls: 0 };
        Object.assign(window, { auditMetrics: metrics });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) metrics.lcp = entry.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & {
              hadRecentInput: boolean;
              value: number;
            };
            if (!shift.hadRecentInput) metrics.cls += shift.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto("/en", { waitUntil: "networkidle" });
      await expect(page.locator(".hero-stretch-reveal")).toHaveCount(0, {
        timeout: 3000,
      });
      results.push({
        reducedMotion,
        run,
        ...(await page.evaluate(() => ({
          ...(
            window as unknown as { auditMetrics: { lcp: number; cls: number } }
          ).auditMetrics,
          resources: performance.getEntriesByType("resource").map((entry) => ({
            name: entry.name,
            bytes: (entry as PerformanceResourceTiming).encodedBodySize,
            ms: entry.duration,
          })),
        }))),
      });
    }
  }
  await testInfo.attach("mobile-lab-samples.json", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
});
