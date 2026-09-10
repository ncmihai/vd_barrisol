import type { Locale } from "@/lib/i18n";
import type { PublicSiteData } from "@/lib/publicTypes";

const byLocale = {
  en: {
    aboutHeadline:
      "Stretch ceiling work with clean execution and clear communication",
    aboutIntro:
      "VD BARRISOL works from Constanta for residential and commercial interiors that need a precise ceiling finish, controlled lighting, and a calmer installation process.",
    calculatorCopy:
      "Add the approximate surface and the main options. The result is an indicative range, not a final offer, because measurements, material, lighting, access, and details change the real cost.",
    calculatorHeadline: "Estimate your ceiling budget",
    contactCopy:
      "Send the estimate or book a measurement. The next step is a technical discussion on material, lighting, access, and final dimensions.",
    contactHeadline: "Book a measurement with VD BARRISOL",
    footerText:
      "Premium stretch ceilings for homes, commercial spaces, and projects with integrated lighting.",
    galleryCopy:
      "Selected examples of stretch ceiling finishes, lighting details, and interior applications for homes and commercial spaces.",
    galleryHeadline: "Work examples and client notes",
    heroCopy:
      "For homes, hotels and commercial interiors in Constanta and nearby areas. Explore finishes and estimate your budget.",
    heroEyebrow: "Constanta and nearby areas",
    heroHeadline: "VD BARRISOL. Stretch ceilings.",
    serviceArea:
      "Mamaia-Sat, Valu lui Traian, Constanta, Mamaia, Cumpana, Navodari, Agigea, Lazu, Mangalia and Murfatlar",
    values: [
      {
        copy: "The visible finish matters as much as the technical system behind it. Edges, light lines, reflections, and transitions should look intentional.",
        title: "Controlled finish",
      },
      {
        copy: "The calculator gives an indicative range. Final pricing should follow measurements and a direct conversation about the room.",
        title: "Honest estimates",
      },
      {
        copy: "Homes, reception areas, salons, offices, and other commercial interiors need different ceiling choices. The site keeps those examples easy to compare.",
        title: "Residential and commercial",
      },
    ],
  },
  ro: {
    aboutHeadline:
      "Tavane extensibile lucrate curat, cu detalii explicate clar",
    aboutIntro:
      "VD BARRISOL lucreaza din Constanta pentru interioare rezidentiale si comerciale care au nevoie de finisaj precis, lumina controlata si un proces de montaj mai predictibil.",
    calculatorCopy:
      "Adauga suprafata aproximativa si optiunile principale. Rezultatul este un interval orientativ, nu o oferta finala, pentru ca masuratorile, materialul, iluminatul, accesul si detaliile schimba pretul real.",
    calculatorHeadline: "Estimeaza bugetul pentru tavan",
    contactCopy:
      "Trimite estimarea sau programeaza o masuratoare. Urmatorul pas este o discutie tehnica despre material, lumina, acces si dimensiunile finale.",
    contactHeadline: "Programeaza o masuratoare cu VD BARRISOL",
    footerText:
      "Tavane extensibile premium pentru locuinte, spatii comerciale si proiecte cu iluminat integrat.",
    galleryCopy:
      "Exemple selectate de finisaje, detalii de iluminat si aplicatii pentru locuinte si spatii comerciale.",
    galleryHeadline: "Exemple de lucrari si note de la clienti",
    heroCopy:
      "Pentru locuinte, hoteluri si spatii comerciale din Constanta si imprejurimi. Exploreaza finisajele si simuleaza bugetul.",
    heroEyebrow: "Constanta si imprejurimi",
    heroHeadline: "VD BARRISOL. Tavane extensibile.",
    serviceArea:
      "Mamaia-Sat, Valu lui Traian, Constanta, Mamaia, Cumpana, Navodari, Agigea, Lazu, Mangalia si Murfatlar",
    values: [
      {
        copy: "Finisajul vizibil conteaza la fel de mult ca sistemul tehnic din spate. Muchiile, liniile de lumina, reflexiile si imbinarile trebuie sa para intentionate.",
        title: "Finisaj controlat",
      },
      {
        copy: "Calculatorul ofera un interval orientativ. Pretul final trebuie stabilit dupa masuratori si o discutie directa despre camera.",
        title: "Estimari oneste",
      },
      {
        copy: "Locuintele, receptiile, saloanele, birourile si alte spatii comerciale cer solutii diferite. Site-ul pastreaza exemplele usor de comparat.",
        title: "Rezidential si comercial",
      },
    ],
  },
} as const;

export const getFallbackSiteData = (locale: Locale): PublicSiteData => {
  const copy = byLocale[locale];

  return {
    about: {
      headline: copy.aboutHeadline,
      image: {
        alt: "Detaliu de tavan extensibil cu iluminat cald integrat",
        src: "/placeholders/stretch-ceiling-detail.png",
      },
      intro: copy.aboutIntro,
      values: [...copy.values],
    },
    gallery: {
      copy: copy.galleryCopy,
      headline: copy.galleryHeadline,
    },
    home: {
      calculatorCopy: copy.calculatorCopy,
      calculatorHeadline: copy.calculatorHeadline,
      contactCopy: copy.contactCopy,
      contactHeadline: copy.contactHeadline,
      heroCopy: copy.heroCopy,
      heroEyebrow: copy.heroEyebrow,
      heroHeadline: copy.heroHeadline,
      heroSlides: [
        {
          caption:
            locale === "ro"
              ? "Living modern cu lumina perimetrala"
              : "Modern living room with perimeter light",
          image: {
            alt: "Living modern cu tavan extensibil si lumina perimetrala",
            src: "/placeholders/stretch-ceiling-living-room.png",
          },
        },
        {
          caption:
            locale === "ro"
              ? "Spatiu comercial cu plafon lucios"
              : "Commercial space with glossy ceiling",
          image: {
            alt: "Receptie comerciala cu tavan extensibil negru si linii LED",
            src: "/placeholders/stretch-ceiling-commercial.png",
          },
        },
        {
          caption:
            locale === "ro"
              ? "Detaliu cu spoturi si banda LED"
              : "Detail with spotlights and LED strip",
          image: {
            alt: "Detaliu plafon extensibil cu spoturi si banda LED",
            src: "/placeholders/stretch-ceiling-detail.png",
          },
        },
      ],
    },
    nav: {
      creditLabel: ".//NCM",
      footerLinks: [
        {
          href: locale === "ro" ? "/ro/galerie" : "/en/gallery",
          label: locale === "ro" ? "Galerie" : "Gallery",
        },
        {
          href: locale === "ro" ? "/ro/despre" : "/en/about",
          label: locale === "ro" ? "Despre" : "About",
        },
        {
          href: locale === "ro" ? "/ro/confidentialitate" : "/en/privacy",
          label: locale === "ro" ? "Confidentialitate" : "Privacy",
        },
        {
          href: locale === "ro" ? "/ro/cookies" : "/en/cookies",
          label: "Cookies",
        },
      ],
      footerText: copy.footerText,
      headerLinks: [
        {
          href: locale === "ro" ? "/ro/galerie" : "/en/gallery",
          label: locale === "ro" ? "Galerie" : "Gallery",
        },
        {
          href: locale === "ro" ? "/ro/despre" : "/en/about",
          label: locale === "ro" ? "Despre" : "About",
        },
      ],
    },
    pricing: {
      basePriceRonPerSqm: 180,
      ceilingTypes: [
        {
          label: locale === "ro" ? "Mat standard" : "Standard matte",
          value: "mat-standard",
          multiplier: 1,
        },
        {
          label: locale === "ro" ? "Lucios / oglinda" : "Gloss / mirror",
          value: "lucios",
          multiplier: 1.2,
        },
        {
          label:
            locale === "ro" ? "Translucid iluminat" : "Backlit translucent",
          value: "translucid",
          multiplier: 1.35,
        },
      ],
      cityFees: [
        { city: "Constanta", fixedRon: 0 },
        { city: "Bucuresti", fixedRon: 600 },
      ],
      complexityOptions: [
        {
          label: locale === "ro" ? "Camera simpla" : "Simple room",
          value: "simple",
          multiplier: 1,
        },
        {
          label: locale === "ro" ? "Forme moderate" : "Moderate shapes",
          value: "moderate",
          multiplier: 1.12,
        },
        {
          label: locale === "ro" ? "Forme complexe" : "Complex shapes",
          value: "complex",
          multiplier: 1.25,
        },
      ],
      disclaimer:
        locale === "ro"
          ? "Estimarea este aproximativa. Pretul final poate varia dupa masuratori, material, iluminat, acces si detaliile reale ale montajului."
          : "This is an approximate estimate. Final pricing may change after measurements, material choice, lighting, access, and installation details.",
      eurRate: 5,
      fallbackTravelFeeRon: 350,
      lightingOptions: [
        {
          label:
            locale === "ro"
              ? "Fara iluminat integrat"
              : "No integrated lighting",
          value: "none",
          fixedRon: 0,
          perSqmRon: 0,
        },
        {
          label:
            locale === "ro" ? "Banda LED perimetrala" : "Perimeter LED strip",
          value: "perimeter-led",
          fixedRon: 400,
          perSqmRon: 45,
        },
        {
          label: locale === "ro" ? "Iluminat complex" : "Complex lighting",
          value: "complex-lighting",
          fixedRon: 900,
          perSqmRon: 75,
        },
      ],
      minimumProjectRon: 1500,
      rangePercent: 15,
      vatMode: "not-specified",
    },
    projects: [
      {
        areaSqm: 34,
        ceilingType:
          locale === "ro"
            ? "Mat cu LED perimetral"
            : "Matte with perimeter LED",
        city: "Constanta",
        image: {
          alt: "Living modern cu tavan extensibil si lumina perimetrala",
          src: "/placeholders/stretch-ceiling-living-room.png",
        },
        slug: "living-modern-constanta",
        summary:
          locale === "ro"
            ? "Exemplu rezidential pentru un living cu lumina perimetrala si finisaj mat, potrivit pentru o atmosfera calda."
            : "Residential example for a living room with perimeter lighting and matte finish, suited to a warmer interior mood.",
        title:
          locale === "ro"
            ? "Living modern in Constanta"
            : "Modern living room in Constanta",
      },
      {
        areaSqm: 72,
        ceilingType:
          locale === "ro"
            ? "Lucios negru cu LED liniar"
            : "Glossy black with linear LED",
        city: "Bucuresti",
        image: {
          alt: "Receptie comerciala cu tavan extensibil negru si linii LED",
          src: "/placeholders/stretch-ceiling-commercial.png",
        },
        slug: "receptie-premium",
        summary:
          locale === "ro"
            ? "Exemplu comercial pentru o zona de receptie in care plafonul lucios si lumina liniara devin parte din identitatea spatiului."
            : "Commercial example for a reception area where glossy ceiling material and linear light become part of the space identity.",
        title: locale === "ro" ? "Receptie premium" : "Premium reception area",
      },
    ],
    settings: {
      brandName: "VD BARRISOL",
      domain: "vdbarrisol.ro",
      email: "vdbarrisol@gmail.com",
      facebookUrl: "https://www.facebook.com/p/VD-Barrisol-61564327003788/",
      instagramUrl: "https://www.instagram.com/vd_barrisol/",
      legalName: "VD BARRISOL S.R.L.",
      logo: {
        alt: "VD BARRISOL",
        src: "/brand/vd-barrisol-logo-transparent.png",
      },
      mainCity: "Constanta",
      phone: "0793 124 425",
      registrationNumber: "CUI 51496619",
      seoDescription:
        locale === "ro"
          ? "VD BARRISOL realizeaza tavane extensibile in Constanta si imprejurimi. Lucrarile din alte zone se discuta individual."
          : "VD BARRISOL installs stretch ceilings in Constanta and nearby areas. Projects further afield are discussed individually.",
      seoTitle:
        locale === "ro"
          ? "VD BARRISOL - tavane extensibile premium"
          : "VD BARRISOL - premium stretch ceilings",
      serviceArea: copy.serviceArea,
      serviceCities: [
        "Mamaia-Sat",
        "Valu lui Traian",
        "Constanta",
        "Mamaia",
        "Cumpana",
        "Navodari",
        "Agigea",
        "Lazu",
        "Mangalia",
        "Murfatlar",
      ],
      whatsappHref: "https://wa.me/40793124425",
      whatsappNumber: "40793124425",
    },
    testimonials: [
      {
        city: "Constanta",
        clientName:
          locale === "ro" ? "Client rezidential" : "Residential client",
        headline:
          locale === "ro"
            ? "Finisaj curat si lumina exact cum am vrut"
            : "Clean finish and exactly the light we wanted",
        quote:
          locale === "ro"
            ? "Estimarea a fost clara, iar discutia despre lumina si finisaj ne-a ajutat sa alegem o solutie potrivita pentru camera."
            : "The estimate was clear, and the discussion about light and finish helped us choose a suitable option for the room.",
      },
    ],
  };
};
