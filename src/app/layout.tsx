import type { Metadata } from "next";
import { headers } from "next/headers";

import { getSiteUrl } from "@/lib/siteUrl";

import "./globals.css";

export const metadata: Metadata = {
  applicationName: "VD BARRISOL",
  generator: "Next.js",
  metadataBase: new URL(getSiteUrl()),
  robots:
    process.env.VDB_PUBLIC_INDEXING === "1" &&
    process.env.VDB_CONTENT_MODE !== "demo"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-vd-locale") === "en" ? "en" : "ro";

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
