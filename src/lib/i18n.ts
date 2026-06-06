export const locales = ['ro', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ro'

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale)

export const normalizeLocale = (value?: string): Locale =>
  value && isLocale(value) ? value : defaultLocale

export const routeLabels = {
  en: {
    about: 'About',
    calculator: 'Estimate',
    contact: 'Contact',
    gallery: 'Gallery',
    home: 'Home',
    localeSwitch: 'Romana',
    localeSwitchPath: '/ro',
    whatsapp: 'WhatsApp',
  },
  ro: {
    about: 'Despre',
    calculator: 'Estimare',
    contact: 'Contact',
    gallery: 'Galerie',
    home: 'Acasa',
    localeSwitch: 'English',
    localeSwitchPath: '/en',
    whatsapp: 'WhatsApp',
  },
} satisfies Record<Locale, Record<string, string>>

export const localizedPaths = {
  en: {
    about: '/en/about',
    gallery: '/en/gallery',
    home: '/en',
  },
  ro: {
    about: '/ro/despre',
    gallery: '/ro/galerie',
    home: '/ro',
  },
} satisfies Record<Locale, Record<'about' | 'gallery' | 'home', string>>
