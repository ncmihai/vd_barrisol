import Image from "next/image";
import type { PublicProject } from "@/lib/publicTypes";
import type { Locale } from "@/lib/i18n";

export function ProjectDetails({
  project,
  locale,
  whatsapp,
}: {
  project: PublicProject;
  locale: Locale;
  whatsapp: string;
}) {
  const message = `${locale === "ro" ? "Buna, as dori sa discut un proiect similar cu" : "Hello, I would like to discuss a project similar to"} ${project.title}`;
  return (
    <section className="section">
      <div className="section__inner">
        {project.image.src.startsWith("/placeholders/") && (
          <p>
            {locale === "ro" ? "Imagine demonstrativa" : "Illustrative image"}
          </p>
        )}
        {project.publication === "demo" && (
          <p>{locale === "ro" ? "Proiect demonstrativ" : "Demo project"}</p>
        )}
        {project.details && <p className="preserve-lines">{project.details}</p>}
        {project.technicalDetails && (
          <p className="preserve-lines">{project.technicalDetails}</p>
        )}
        <div className="project-grid">
          {project.images?.map((image) => (
            <figure key={image.src}>
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width || 1200}
                height={image.height || 800}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <figcaption>{image.alt}</figcaption>
            </figure>
          ))}
        </div>
        <a
          className="button button--primary"
          href={`${whatsapp}${whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(message)}`}
        >
          {locale === "ro"
            ? "Discuta un proiect similar"
            : "Discuss a similar project"}
        </a>
      </div>
    </section>
  );
}
