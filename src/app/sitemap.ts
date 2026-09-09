import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/siteUrl";
import { getPublicSiteData } from "@/lib/publicData";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const routes = [
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
  ];

  const [roData, enData] = await Promise.all([
    getPublicSiteData("ro"),
    getPublicSiteData("en"),
  ]);
  const projectRoutes = [
    ...roData.projects
      .filter((project) => project.publication === "published")
      .map((project) => `/ro/proiecte/${project.slug}`),
    ...enData.projects
      .filter((project) => project.publication === "published")
      .map((project) => `/en/projects/${project.slug}`),
    ...(roData.services?.items.length ? ["/ro/servicii"] : []),
    ...(enData.services?.items.length ? ["/en/services"] : []),
    ...(roData.services?.architects ? ["/ro/arhitecti"] : []),
    ...(enData.services?.architects ? ["/en/architects"] : []),
  ];

  return [...routes, ...projectRoutes].map((route) => ({
    changeFrequency: "weekly",
    priority: route === "" || route === "/ro" || route === "/en" ? 1 : 0.8,
    url: `${siteUrl}${route}`,
  }));
}
