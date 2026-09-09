"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedPaths, type Locale } from "@/lib/i18n";

export function LocaleLink({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const target = locale === "ro" ? "en" : "ro";
  const key = Object.entries(localizedPaths[locale]).find(
    ([, path]) => path === pathname,
  )?.[0] as keyof typeof localizedPaths.ro | undefined;
  const project = pathname.match(/^\/(ro|en)\/(proiecte|projects)\/([^/]+)$/);
  const href = key
    ? localizedPaths[target][key]
    : project
      ? `/${target}/${target === "ro" ? "proiecte" : "projects"}/${project[3]}`
      : localizedPaths[target].home;
  return (
    <Link
      className="locale-link"
      href={href}
      hrefLang={target}
      onClick={(event) => {
        if (window.location.search || window.location.hash) {
          event.preventDefault();
          window.location.assign(
            href + window.location.search + window.location.hash,
          );
        }
      }}
    >
      {target === "ro" ? "Romana" : "English"}
    </Link>
  );
}
