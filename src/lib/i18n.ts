export const locales = ["ro", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ro";

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export const normalizeLocale = (value?: string): Locale =>
  value && isLocale(value) ? value : defaultLocale;

export const routeLabels = {
  en: {
    about: "About",
    bookMeasurement: "Book",
    calculator: "Estimate",
    contact: "Contact",
    gallery: "Gallery",
    home: "Home",
    localeSwitch: "Romana",
    localeSwitchPath: "/ro",
    whatsapp: "WhatsApp",
  },
  ro: {
    about: "Despre",
    bookMeasurement: "Programeaza",
    calculator: "Estimare",
    contact: "Contact",
    gallery: "Galerie",
    home: "Acasa",
    localeSwitch: "English",
    localeSwitchPath: "/en",
    whatsapp: "WhatsApp",
  },
} satisfies Record<Locale, Record<string, string>>;

export const localizedPaths = {
  en: {
    about: "/en/about",
    cookies: "/en/cookies",
    gallery: "/en/gallery",
    home: "/en",
    privacy: "/en/privacy",
  },
  ro: {
    about: "/ro/despre",
    cookies: "/ro/cookies",
    gallery: "/ro/galerie",
    home: "/ro",
    privacy: "/ro/confidentialitate",
  },
} satisfies Record<
  Locale,
  Record<"about" | "cookies" | "gallery" | "home" | "privacy", string>
>;
