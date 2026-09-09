import { notFound } from "next/navigation";
import { getPublicSiteData } from "@/lib/publicData";
import { ServicesContent } from "@/components/ServicesContent";
export const metadata = {
  title: "Servicii | VD BARRISOL",
  description: "Servicii - VD BARRISOL, Constanta.",
  alternates: {
    canonical: "/ro/servicii",
    languages: { ro: "/ro/servicii", en: "/en/services" },
  },
};
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if ((await params).locale !== "ro") notFound();
  const data = await getPublicSiteData("ro");
  if (!data.services?.items.length) notFound();
  return (
    <>
      <section className="page-hero">
        <div className="section__inner">
          <h1>Servicii</h1>
          <a
            className="button button--primary"
            href={data.settings.whatsappHref}
          >
            WhatsApp
          </a>
        </div>
      </section>
      <ServicesContent data={data} locale="ro" />
    </>
  );
}
