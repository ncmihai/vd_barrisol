import type { Locale } from '@/lib/i18n'
import type { PublicSiteData } from '@/lib/publicTypes'

const byLocale = {
  en: {
    aboutHeadline: 'Premium stretch ceilings, installed with discipline',
    aboutIntro:
      'VD BARRISOL works from Constanta across Romania for homes and commercial spaces that need clean finishes, integrated lighting, and a ceiling system that feels architectural rather than improvised.',
    calculatorCopy:
      'Add the approximate surface and the main options. The estimate is a range, because final pricing depends on measurements, material, lighting, access, and installation details.',
    calculatorHeadline: 'Estimate your ceiling budget',
    contactCopy:
      'Send the estimate through the form or open WhatsApp directly. A final offer should always follow measurements and a short technical discussion.',
    contactHeadline: 'Talk to VD BARRISOL',
    footerText:
      'Premium stretch ceilings for homes, commercial spaces, and projects with integrated lighting.',
    galleryCopy:
      'A compact view of the kind of finishes, lighting, and interior details the site should present once real project photos are uploaded.',
    galleryHeadline: 'Projects and testimonials',
    heroCopy:
      'Premium stretch ceilings with clean detailing, integrated light, and a finish that changes how a room feels.',
    heroEyebrow: 'Constanta based, working across Romania',
    heroHeadline: 'VD BARRISOL stretch ceilings for refined interiors',
    serviceArea: 'Constanta and projects across Romania',
    values: [
      {
        copy: 'The ceiling is a visible finish, not a hidden technical layer. The design should make that quality obvious.',
        title: 'Finish first',
      },
      {
        copy: 'Calculator prices stay approximate because trust is built with honest ranges, not fake precision.',
        title: 'Transparent estimates',
      },
      {
        copy: 'The storage layer is isolated so Digi can be replaced by Hetzner later without redesigning the site.',
        title: 'Built to migrate',
      },
    ],
  },
  ro: {
    aboutHeadline: 'Tavane extensibile premium, montate cu disciplina',
    aboutIntro:
      'VD BARRISOL lucreaza din Constanta in mai multe orase din Romania pentru locuinte si spatii comerciale care au nevoie de finisaj curat, iluminat integrat si un plafon cu aspect arhitectural.',
    calculatorCopy:
      'Adauga suprafata aproximativa si optiunile principale. Estimarea este un interval, pentru ca pretul final depinde de masuratori, material, iluminat, acces si detaliile reale ale montajului.',
    calculatorHeadline: 'Estimeaza bugetul pentru tavan',
    contactCopy:
      'Trimite estimarea prin formular sau deschide direct WhatsApp. Oferta finala trebuie confirmata dupa masuratori si o scurta discutie tehnica.',
    contactHeadline: 'Vorbeste cu VD BARRISOL',
    footerText:
      'Tavane extensibile premium pentru locuinte, spatii comerciale si proiecte cu iluminat integrat.',
    galleryCopy:
      'O prezentare compacta a finisajelor, iluminatului si detaliilor interioare pe care site-ul le va arata dupa incarcarea fotografiilor reale.',
    galleryHeadline: 'Proiecte si testimoniale',
    heroCopy:
      'Tavane extensibile premium cu detalii curate, lumina integrata si un finisaj care schimba atmosfera camerei.',
    heroEyebrow: 'Constanta, cu proiecte in Romania',
    heroHeadline: 'VD BARRISOL - tavane extensibile pentru interioare rafinate',
    serviceArea: 'Constanta si proiecte in mai multe orase din Romania',
    values: [
      {
        copy: 'Tavanul este un finisaj vizibil, nu un detaliu tehnic ascuns. Designul trebuie sa arate clar calitatea lucrarii.',
        title: 'Finisajul pe primul loc',
      },
      {
        copy: 'Preturile din calculator raman aproximative pentru ca increderea vine din intervale oneste, nu din precizie falsa.',
        title: 'Estimari transparente',
      },
      {
        copy: 'Stratul de stocare este izolat ca Digi sa poata fi inlocuit cu Hetzner mai tarziu fara redesenarea site-ului.',
        title: 'Pregatit pentru migrare',
      },
    ],
  },
} as const

export const getFallbackSiteData = (locale: Locale): PublicSiteData => {
  const copy = byLocale[locale]

  return {
    about: {
      headline: copy.aboutHeadline,
      image: {
        alt: 'Detaliu de tavan extensibil cu iluminat cald integrat',
        src: '/placeholders/stretch-ceiling-detail.png',
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
          caption: locale === 'ro' ? 'Living modern cu lumina perimetrala' : 'Modern living room with perimeter light',
          image: {
            alt: 'Living modern cu tavan extensibil si lumina perimetrala',
            src: '/placeholders/stretch-ceiling-living-room.png',
          },
        },
        {
          caption: locale === 'ro' ? 'Spatiu comercial cu plafon lucios' : 'Commercial space with glossy ceiling',
          image: {
            alt: 'Receptie comerciala cu tavan extensibil negru si linii LED',
            src: '/placeholders/stretch-ceiling-commercial.png',
          },
        },
        {
          caption: locale === 'ro' ? 'Detaliu cu spoturi si banda LED' : 'Detail with spotlights and LED strip',
          image: {
            alt: 'Detaliu plafon extensibil cu spoturi si banda LED',
            src: '/placeholders/stretch-ceiling-detail.png',
          },
        },
      ],
    },
    nav: {
      creditLabel: 'made by NCM',
      footerLinks: [
        { href: locale === 'ro' ? '/ro/galerie' : '/en/gallery', label: locale === 'ro' ? 'Galerie' : 'Gallery' },
        { href: locale === 'ro' ? '/ro/despre' : '/en/about', label: locale === 'ro' ? 'Despre' : 'About' },
      ],
      footerText: copy.footerText,
      headerLinks: [
        { href: locale === 'ro' ? '/ro/galerie' : '/en/gallery', label: locale === 'ro' ? 'Galerie' : 'Gallery' },
        { href: locale === 'ro' ? '/ro/despre' : '/en/about', label: locale === 'ro' ? 'Despre' : 'About' },
      ],
    },
    pricing: {
      basePriceRonPerSqm: 180,
      ceilingTypes: [
        { label: locale === 'ro' ? 'Mat standard' : 'Standard matte', value: 'mat-standard', multiplier: 1 },
        { label: locale === 'ro' ? 'Lucios / oglinda' : 'Gloss / mirror', value: 'lucios', multiplier: 1.2 },
        { label: locale === 'ro' ? 'Translucid iluminat' : 'Backlit translucent', value: 'translucid', multiplier: 1.35 },
      ],
      cityFees: [
        { city: 'Constanta', fixedRon: 0 },
        { city: 'Bucuresti', fixedRon: 600 },
      ],
      complexityOptions: [
        { label: locale === 'ro' ? 'Camera simpla' : 'Simple room', value: 'simple', multiplier: 1 },
        { label: locale === 'ro' ? 'Forme moderate' : 'Moderate shapes', value: 'moderate', multiplier: 1.12 },
        { label: locale === 'ro' ? 'Forme complexe' : 'Complex shapes', value: 'complex', multiplier: 1.25 },
      ],
      disclaimer:
        locale === 'ro'
          ? 'Pretul este aproximativ si poate varia dupa masuratori, material, iluminat si detaliile reale ale montajului.'
          : 'The price is approximate and may change after measurements, material choice, lighting, and installation details.',
      eurRate: 5,
      fallbackTravelFeeRon: 350,
      lightingOptions: [
        { label: locale === 'ro' ? 'Fara iluminat integrat' : 'No integrated lighting', value: 'none', fixedRon: 0, perSqmRon: 0 },
        { label: locale === 'ro' ? 'Banda LED perimetrala' : 'Perimeter LED strip', value: 'perimeter-led', fixedRon: 400, perSqmRon: 45 },
        { label: locale === 'ro' ? 'Iluminat complex' : 'Complex lighting', value: 'complex-lighting', fixedRon: 900, perSqmRon: 75 },
      ],
      minimumProjectRon: 1500,
      rangePercent: 15,
      vatMode: 'not-specified',
    },
    projects: [
      {
        areaSqm: 34,
        ceilingType: locale === 'ro' ? 'Mat cu LED perimetral' : 'Matte with perimeter LED',
        city: 'Constanta',
        image: {
          alt: 'Living modern cu tavan extensibil si lumina perimetrala',
          src: '/placeholders/stretch-ceiling-living-room.png',
        },
        slug: 'living-modern-constanta',
        summary:
          locale === 'ro'
            ? 'Placeholder pentru un proiect rezidential cu lumina perimetrala si finisaj cald.'
            : 'Placeholder for a residential project with perimeter light and warm finish.',
        title: locale === 'ro' ? 'Living modern in Constanta' : 'Modern living room in Constanta',
      },
      {
        areaSqm: 72,
        ceilingType: locale === 'ro' ? 'Lucios negru cu LED liniar' : 'Glossy black with linear LED',
        city: 'Bucuresti',
        image: {
          alt: 'Receptie comerciala cu tavan extensibil negru si linii LED',
          src: '/placeholders/stretch-ceiling-commercial.png',
        },
        slug: 'receptie-premium',
        summary:
          locale === 'ro'
            ? 'Placeholder pentru o zona comerciala cu plafon negru, reflexii si lumina liniara.'
            : 'Placeholder for a commercial area with black ceiling, reflections, and linear light.',
        title: locale === 'ro' ? 'Receptie premium' : 'Premium reception area',
      },
    ],
    settings: {
      brandName: 'VD BARRISOL',
      domain: 'vdbarrisol.ro',
      email: 'office@vdbarrisol.ro',
      logo: {
        alt: 'VD BARRISOL',
        src: '/brand/vd-barrisol-logo-transparent.png',
      },
      mainCity: 'Constanta',
      phone: '',
      seoDescription:
        locale === 'ro'
          ? 'VD BARRISOL realizeaza tavane extensibile premium in Constanta si in alte orase din Romania.'
          : 'VD BARRISOL builds premium stretch ceilings in Constanta and across Romania.',
      seoTitle:
        locale === 'ro'
          ? 'VD BARRISOL - tavane extensibile premium'
          : 'VD BARRISOL - premium stretch ceilings',
      serviceArea: copy.serviceArea,
      whatsappHref: 'https://wa.me/',
      whatsappNumber: '',
    },
    testimonials: [
      {
        city: 'Constanta',
        clientName: locale === 'ro' ? 'Client rezidential' : 'Residential client',
        headline: locale === 'ro' ? 'Finisaj curat si lumina exact cum am vrut' : 'Clean finish and exactly the light we wanted',
        quote:
          locale === 'ro'
            ? 'Testimonial placeholder. Inainte de lansare trebuie inlocuit cu text real, aprobat de client.'
            : 'Placeholder testimonial. Replace before launch with real approved client text.',
      },
    ],
  }
}
