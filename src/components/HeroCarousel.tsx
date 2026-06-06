'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import type { Locale } from '@/lib/i18n'
import { routeLabels } from '@/lib/i18n'
import type { PublicHomePage, PublicSiteSettings } from '@/lib/publicTypes'

export function HeroCarousel({
  home,
  locale,
  settings,
}: {
  home: PublicHomePage
  locale: Locale
  settings: PublicSiteSettings
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const labels = routeLabels[locale]
  const slides = home.heroSlides.length > 0 ? home.heroSlides : []

  useEffect(() => {
    if (slides.length < 2) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 6500)

    return () => window.clearInterval(interval)
  }, [slides.length])

  if (slides.length === 0) {
    return null
  }

  const whatsappHref = settings.whatsappNumber ? settings.whatsappHref : '#contact'

  return (
    <section className="hero-shell">
      <div className="hero-media" aria-hidden="true">
        {slides.map((slide, index) => (
          <Image
            alt=""
            className={index === activeIndex ? 'hero-media__image is-active' : 'hero-media__image'}
            fill
            key={`${slide.image.src}-${index}`}
            priority={index === 0}
            sizes="100vw"
            src={slide.image.src}
          />
        ))}
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">{home.heroEyebrow}</p>
        <h1>{home.heroHeadline}</h1>
        <p>{home.heroCopy}</p>
        <div className="hero-actions">
          <a className="button button--primary" href="#calculator">
            {labels.calculator}
          </a>
          <a className="button button--ghost" href={whatsappHref}>
            WhatsApp
          </a>
        </div>
      </div>
      <div className="hero-caption">
        <span>{slides[activeIndex]?.caption}</span>
        <div aria-hidden="true" className="hero-dots">
          {slides.map((slide, index) => (
            <button
              aria-label={`Show slide ${index + 1}`}
              className={index === activeIndex ? 'is-active' : ''}
              key={`${slide.image.src}-dot`}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
