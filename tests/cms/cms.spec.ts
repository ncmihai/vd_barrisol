import { test, expect } from "@playwright/test";

test("CMS-backed production routes, editing invalidation, lead receipt and duplicate protection", async ({
  page,
  request,
}) => {
  await page.goto("/en");
  await expect(page.locator(".estimate-result strong")).toContainText("RON");
  await page.locator(".estimate-actions button").click();
  await page.getByRole("textbox", { name: "Name" }).fill("Audit enquiry");
  await page.getByRole("textbox", { name: "Phone" }).fill("0793124425");
  const saved = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/leads") &&
      response.request().method() === "POST",
  );
  await page.locator(".lead-form button[type=submit]").click();
  let response = await saved;
  if (response.status() === 409) {
    await expect(page.locator(".lead-form")).toContainText("review", {
      ignoreCase: true,
    });
    const refreshed = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith("/api/leads") &&
        candidate.request().method() === "POST",
    );
    await page.locator(".lead-form button[type=submit]").click();
    response = await refreshed;
  }
  expect(response.status()).toBe(200);
  const receipt = await response.json();
  const original = response.request();
  const repeat = await request.post("/api/leads", {
    headers: original.headers(),
    data: original.postData()!,
  });
  expect(repeat.status()).toBe(200);
  expect((await repeat.json()).id).toBe(receipt.id);
  for (const route of [
    "/ro/servicii",
    "/en/services",
    "/ro/arhitecti",
    "/en/architects",
    "/en/projects/beta-audit-project",
    "/admin",
  ])
    expect((await request.get(route)).status()).toBe(200);
  expect([401, 403]).toContain((await request.get("/api/leads")).status());
  const login = await request.post("/api/users/login", {
    data: {
      email: "audit@example.test",
      password: "local-audit-password-only",
    },
  });
  expect(login.status()).toBe(200);
  const revision = `CMS edit ${Date.now()}`;
  const edit = await request.post("/api/globals/gallery-page?locale=en", {
    data: { headline: revision, copy: "Audit copy" },
  });
  expect(edit.status()).toBe(200);
  await page.goto("/en/gallery");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(revision);
  const leads = await request.get("/api/leads?limit=10");
  expect(leads.status()).toBe(200);
  const record = (await leads.json()).docs.find(
    (lead: { id: number }) => lead.id === receipt.id,
  );
  expect(record.notificationStatus).toBe("skipped");
  expect(record.calculatorInput.schemaVersion).toBe(1);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
