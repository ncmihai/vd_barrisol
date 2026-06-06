import type { Locale } from '@/lib/i18n'

export type LegalPageKind = 'cookies' | 'privacy'

type LegalSection = {
  body: string
  title: string
}

type LegalPageContent = {
  description: string
  eyebrow: string
  sections: LegalSection[]
  title: string
  updatedLabel: string
}

const content = {
  cookies: {
    en: {
      description:
        'Basic cookie information for the VD BARRISOL demo website. This text should be reviewed before public launch.',
      eyebrow: 'Cookie policy',
      sections: [
        {
          body: 'The website may use essential cookies and platform-level storage needed for security, routing, forms, and basic operation.',
          title: 'Essential use',
        },
        {
          body: 'Vercel Analytics and Speed Insights can collect privacy-friendly performance information so the site can be improved on real devices.',
          title: 'Analytics and performance',
        },
        {
          body: 'If contact forms, WhatsApp links, embedded media, or future third-party tools are expanded, this page must be updated before launch.',
          title: 'Future updates',
        },
      ],
      title: 'Cookie Policy',
      updatedLabel: 'Draft for private demo. Legal review required before public launch.',
    },
    ro: {
      description:
        'Informatii de baza despre cookie-uri pentru site-ul demo VD BARRISOL. Textul trebuie verificat inainte de lansarea publica.',
      eyebrow: 'Politica de cookies',
      sections: [
        {
          body: 'Site-ul poate folosi cookie-uri esentiale si stocare la nivel de platforma pentru securitate, rutare, formulare si functionare de baza.',
          title: 'Utilizare esentiala',
        },
        {
          body: 'Vercel Analytics si Speed Insights pot colecta informatii de performanta, orientate spre confidentialitate, pentru imbunatatirea site-ului pe dispozitive reale.',
          title: 'Analiza si performanta',
        },
        {
          body: 'Daca formularele de contact, linkurile WhatsApp, media incorporata sau alte instrumente externe vor fi extinse, aceasta pagina trebuie actualizata inainte de lansare.',
          title: 'Actualizari viitoare',
        },
      ],
      title: 'Politica de Cookies',
      updatedLabel: 'Draft pentru demo privat. Este necesara verificare juridica inainte de lansarea publica.',
    },
  },
  privacy: {
    en: {
      description:
        'Basic privacy information for the VD BARRISOL demo website. This text should be reviewed before public launch.',
      eyebrow: 'Privacy',
      sections: [
        {
          body: 'The website can collect contact details submitted through the estimate form, including name, phone number, email address, city, message, and estimate details.',
          title: 'Data we may collect',
        },
        {
          body: 'This information is used to reply to requests, prepare an approximate estimate, and continue the conversation by phone, email, or WhatsApp.',
          title: 'How it is used',
        },
        {
          body: 'Lead details are stored in the Payload admin database and may also be sent by email to the business contact configured for the website.',
          title: 'Where it is stored',
        },
        {
          body: 'For corrections or deletion requests, visitors should contact VD BARRISOL using the public email or phone number shown on the website.',
          title: 'Contact and deletion',
        },
      ],
      title: 'Privacy Policy',
      updatedLabel: 'Draft for private demo. Legal review required before public launch.',
    },
    ro: {
      description:
        'Informatii de baza despre confidentialitate pentru site-ul demo VD BARRISOL. Textul trebuie verificat inainte de lansarea publica.',
      eyebrow: 'Confidentialitate',
      sections: [
        {
          body: 'Site-ul poate colecta datele trimise prin formularul de estimare: nume, telefon, email, oras, mesaj si detaliile estimarii.',
          title: 'Date pe care le putem colecta',
        },
        {
          body: 'Aceste informatii sunt folosite pentru a raspunde solicitarilor, pentru a pregati o estimare aproximativa si pentru a continua discutia prin telefon, email sau WhatsApp.',
          title: 'Cum sunt folosite',
        },
        {
          body: 'Datele solicitarilor sunt pastrate in baza de date a dashboardului Payload si pot fi trimise si prin email catre contactul de business configurat pentru site.',
          title: 'Unde sunt stocate',
        },
        {
          body: 'Pentru corectarea sau stergerea datelor, vizitatorii trebuie sa contacteze VD BARRISOL folosind emailul sau telefonul public afisat pe site.',
          title: 'Contact si stergere',
        },
      ],
      title: 'Politica de Confidentialitate',
      updatedLabel: 'Draft pentru demo privat. Este necesara verificare juridica inainte de lansarea publica.',
    },
  },
} satisfies Record<LegalPageKind, Record<Locale, LegalPageContent>>

export const getLegalPageContent = (kind: LegalPageKind, locale: Locale) => content[kind][locale]
