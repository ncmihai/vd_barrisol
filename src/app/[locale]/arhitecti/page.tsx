import { notFound } from "next/navigation";
import { getPublicSiteData } from "@/lib/publicData";
export const metadata = {
  title: "Colaborare cu arhitecti | VD BARRISOL",
  description: "Colaborare cu arhitecti - VD BARRISOL, Constanta.",
  alternates: {
    canonical: "/ro/arhitecti",
    languages: { ro: "/ro/arhitecti", en: "/en/architects" },
  },
};
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  if ((await params).locale !== "ro") notFound();
  const data = await getPublicSiteData("ro");
  const content = data.services?.architects;
  if (!content) notFound();
  return (
    <>
      <section className="page-hero">
        <div className="section__inner">
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <a
            className="button button--primary"
            href={data.settings.whatsappHref}
          >
            WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
