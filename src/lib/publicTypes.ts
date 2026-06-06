import type { PricingSettings } from "@/lib/pricing";

export type PublicImage = {
  alt: string;
  height?: number;
  src: string;
  width?: number;
};

export type PublicSiteSettings = {
  brandName: string;
  domain: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  legalName: string;
  logo: PublicImage;
  mainCity: string;
  phone: string;
  registrationNumber: string;
  seoDescription: string;
  seoTitle: string;
  serviceArea: string;
  serviceCities: string[];
  whatsappHref: string;
  whatsappNumber: string;
};

export type PublicNav = {
  creditHref?: string;
  creditLabel: string;
  footerLinks: Array<{
    href: string;
    label: string;
    newTab?: boolean;
  }>;
  footerText: string;
  headerLinks: Array<{
    href: string;
    label: string;
  }>;
};

export type PublicHomePage = {
  calculatorCopy: string;
  calculatorHeadline: string;
  contactCopy: string;
  contactHeadline: string;
  heroCopy: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSlides: Array<{
    caption?: string;
    image: PublicImage;
  }>;
  seoDescription?: string;
  seoTitle?: string;
};

export type PublicGalleryPage = {
  copy: string;
  headline: string;
  seoDescription?: string;
  seoTitle?: string;
};

export type PublicAboutPage = {
  headline: string;
  image: PublicImage;
  intro: string;
  seoDescription?: string;
  seoTitle?: string;
  values: Array<{
    copy: string;
    title: string;
  }>;
};

export type PublicProject = {
  areaSqm?: number;
  ceilingType?: string;
  city?: string;
  image: PublicImage;
  slug: string;
  summary: string;
  title: string;
};

export type PublicTestimonial = {
  city?: string;
  clientName: string;
  headline?: string;
  image?: PublicImage;
  quote: string;
};

export type PublicSiteData = {
  about: PublicAboutPage;
  gallery: PublicGalleryPage;
  home: PublicHomePage;
  nav: PublicNav;
  pricing: PricingSettings;
  projects: PublicProject[];
  settings: PublicSiteSettings;
  testimonials: PublicTestimonial[];
};
