"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { PublicProject } from "@/lib/publicTypes";
import type { Locale } from "@/lib/i18n";

export function ProjectGrid({
  locale,
  projects,
  filters = false,
}: {
  locale: Locale;
  projects: PublicProject[];
  filters?: boolean;
}) {
  const [selection, setSelection] = useState({
    audience: "",
    finish: "",
    lighting: "",
  });
  useEffect(() => {
    if (!filters) return;
    const read = () => {
      const query = new URLSearchParams(window.location.search);
      setSelection({
        audience: query.get("audience") || "",
        finish: query.get("finish") || "",
        lighting: query.get("lighting") || "",
      });
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, [filters]);
  const select = (audience: string) => {
    setSelection({ audience, finish: "", lighting: "" });
    const url = new URL(window.location.href);
    for (const key of ["audience", "finish", "lighting"])
      url.searchParams.delete(key);
    if (audience) url.searchParams.set("audience", audience);
    window.history.pushState(null, "", url);
  };
  const visible = projects.filter(
    (project) =>
      (!selection.audience || project.audience === selection.audience) &&
      (!selection.finish || project.finishId === selection.finish) &&
      (!selection.lighting || project.lightingId === selection.lighting),
  );
  return (
    <>
      {filters && (
        <div
          className="portfolio-filters"
          aria-label={locale === "ro" ? "Filtre proiecte" : "Project filters"}
        >
          {[
            ["", locale === "ro" ? "Toate / reseteaza" : "All / reset"],
            ["residential", locale === "ro" ? "Rezidential" : "Residential"],
            [
              "commercial",
              locale === "ro" ? "Comercial / hoteluri" : "Commercial / hotels",
            ],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={
                selection.audience === value &&
                !selection.finish &&
                !selection.lighting
              }
              onClick={() => select(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {!visible.length && (
        <p>
          {locale === "ro"
            ? "Nu exista proiecte pentru aceasta selectie."
            : "No projects match this selection."}
        </p>
      )}
      <div className="project-grid">
        {visible.map((project) => (
          <article className="project-card" key={project.slug}>
            <div className="project-card__image">
              <Image
                alt={project.image.alt}
                fill
                sizes="(max-width: 720px) 100vw, 50vw"
                src={project.image.src}
                style={{
                  objectPosition: `${project.image.focalX ?? 50}% ${project.image.focalY ?? 50}%`,
                }}
              />
            </div>
            <div className="project-card__body">
              {project.image.src.startsWith("/placeholders/") && (
                <small>
                  {locale === "ro"
                    ? "Imagine demonstrativa"
                    : "Illustrative image"}
                </small>
              )}
              {project.publication === "demo" && (
                <small>
                  {locale === "ro" ? "Proiect demonstrativ" : "Demo project"}
                </small>
              )}
              <span>{project.city}</span>
              <h3>
                <a
                  href={
                    locale === "ro"
                      ? `/ro/proiecte/${project.slug}`
                      : `/en/projects/${project.slug}`
                  }
                >
                  {project.title}
                </a>
              </h3>
              <p>{project.summary}</p>
              <dl>
                {project.areaSqm && (
                  <>
                    <dt>{locale === "ro" ? "mp" : "sqm"}</dt>
                    <dd>{project.areaSqm}</dd>
                  </>
                )}
                {project.ceilingType && (
                  <>
                    <dt>{locale === "ro" ? "tip" : "type"}</dt>
                    <dd>{project.ceilingType}</dd>
                  </>
                )}
              </dl>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
