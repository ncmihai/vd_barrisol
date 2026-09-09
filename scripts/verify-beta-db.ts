import assert from "node:assert/strict";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { getFallbackSiteData } from "../src/lib/fallbackContent";
import { acceptLeadRequest } from "../src/lib/leadGuard";
import type { PricingSetting } from "../src/payload-types";
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";
import { up, down } from "../src/migrations/20260909_130243_beta_completion";

const url = new URL(process.env.DATABASE_URL || "");
if (
  !["localhost", "127.0.0.1"].includes(url.hostname) ||
  !url.pathname.includes("audit")
)
  throw new Error("Use a disposable local database with audit in its name.");
process.env.RESEND_API_KEY = "";
process.env.CONTACT_TO_EMAIL = "";
const payload = await getPayload({ config });
if (process.argv.includes("--rollback-check")) {
  const before = await payload.find({
    collection: "projects",
    limit: 200,
    locale: "ro",
  });
  const db = (payload.db as unknown as { drizzle: MigrateUpArgs["db"] })
    .drizzle;
  await down({ db, payload } as MigrateDownArgs);
  await up({ db, payload } as MigrateUpArgs);
  const after = await payload.find({
    collection: "projects",
    limit: 200,
    locale: "ro",
  });
  assert.deepEqual(
    after.docs.map((doc) => [doc.id, doc.slug, doc.title]),
    before.docs.map((doc) => [doc.id, doc.slug, doc.title]),
  );
  console.log(
    "Targeted beta migration rollback/reapply preserved existing project IDs, slugs and titles.",
  );
}
const users = await payload.find({
  collection: "users",
  where: { email: { equals: "audit@example.test" } },
});
if (!users.docs.length)
  await payload.create({
    collection: "users",
    data: {
      email: "audit@example.test",
      password: "local-audit-password-only",
      role: "admin",
    },
  });
const slug = "beta-audit-project";
const found = await payload.find({
  collection: "projects",
  where: { slug: { equals: slug } },
});
const project =
  found.docs[0] ||
  (await payload.create({
    collection: "projects",
    locale: "ro",
    data: {
      title: "Proiect test",
      slug,
      summary: "Date izolate de verificare.",
      publication: "draft",
      audience: "residential",
      finishId: "mat-standard",
      lightingId: "none",
      featured: true,
    },
  }));
await payload.update({
  collection: "projects",
  id: project.id,
  locale: "en",
  data: {
    title: "Audit project",
    summary: "Isolated verification content.",
    publication: "draft",
  },
});
let publicProjects = await payload.find({
  collection: "projects",
  overrideAccess: false,
});
assert(!publicProjects.docs.some((item) => item.id === project.id));
await payload.update({
  collection: "projects",
  id: project.id,
  data: { publication: "published" },
});
publicProjects = await payload.find({
  collection: "projects",
  locale: "en",
  fallbackLocale: false,
  overrideAccess: false,
});
assert(publicProjects.docs.some((item) => item.title === "Audit project"));
for (const locale of ["ro", "en"] as const) {
  const fallback = getFallbackSiteData(locale);
  await payload.updateGlobal({
    slug: "pricing-settings",
    locale,
    data: { ...fallback.pricing, approved: true } as PricingSetting,
  });
  await payload.updateGlobal({
    slug: "services",
    locale,
    data: {
      items: [
        {
          enabled: true,
          title: locale === "ro" ? "Serviciu test" : "Test service",
          description: "Isolated audit content",
          customQuote: true,
        },
      ],
      architects: {
        enabled: true,
        title: "Architects",
        description: "Isolated collaboration content",
      },
      faq: [
        { enabled: true, question: "Audit question?", answer: "Audit answer." },
      ],
    },
  });
}
const identity = `audit-${Date.now()}`;
const outcomes = await Promise.all(
  Array.from({ length: 6 }, () => acceptLeadRequest(identity)),
);
assert.equal(outcomes.filter(Boolean).length, 5);
let denied = false;
try {
  await payload.create({
    collection: "leads",
    overrideAccess: false,
    data: {
      name: "Denied",
      phone: "0793124425",
      locale: "en",
      preferredContact: "whatsapp",
    },
  });
} catch {
  denied = true;
}
assert(denied);
console.log(
  "Database verification passed: publication access, RO/EN content, approved pricing, atomic rate limits and denied public lead creation.",
);
await payload.destroy();
process.exit(0);
