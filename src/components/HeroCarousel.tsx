"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const HeroMembrane = dynamic(() => import("./HeroMembrane"), { ssr: false });

import type { Locale } from "@/lib/i18n";
import { routeLabels } from "@/lib/i18n";
import type { PublicHomePage, PublicSiteSettings } from "@/lib/publicTypes";

export function HeroCarousel({
  home,
  locale,
  settings: _settings,
}: {
  home: PublicHomePage;
  locale: Locale;
  settings: PublicSiteSettings;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStretchReveal, setShowStretchReveal] = useState(false);
  const reducedMotion = useReducedMotion();
  const finishReveal = useCallback(() => {
    document.documentElement.dataset.vdIntro = "dismissed";
    setShowStretchReveal(false);
    try {
      window.sessionStorage.setItem("vd-barrisol-intro-seen", "1");
    } catch {
      /* Storage can be unavailable in private contexts. */
    }
  }, []);
  const labels = routeLabels[locale];
  const slides = home.heroSlides.length > 0 ? home.heroSlides : [];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches || reducedMotion || slides.length < 2 || isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(interval);
  }, [isPaused, slides.length, reducedMotion]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (
      mediaQuery.matches ||
      reducedMotion ||
      home.motionPreset !== "stretch" ||
      document.documentElement.dataset.vdIntro !== "pending" ||
      window.location.hash
    ) {
      return;
    }

    try {
      if (window.sessionStorage.getItem("vd-barrisol-intro-seen") === "1") {
        return;
      }

      const revealTimer = window.setTimeout(
        () => setShowStretchReveal(true),
        0,
      );
      const timeout = window.setTimeout(finishReveal, 6000);

      return () => {
        window.clearTimeout(revealTimer);
        window.clearTimeout(timeout);
      };
    } catch {
      return;
    }
  }, [home.motionPreset, reducedMotion, finishReveal]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="hero-shell">
      <div className="hero-media" aria-hidden="true">
        {slides.map((slide, index) =>
          index === 0 || index === activeIndex ? (
            <Image
              alt=""
              className={
                index === activeIndex
                  ? "hero-media__image is-active"
                  : "hero-media__image"
              }
              fill
              key={`${slide.image.src}-${index}`}
              priority={index === 0}
              sizes="100vw"
              src={slide.image.src}
              style={{
                objectPosition: `${slide.image.focalX ?? 50}% ${slide.image.focalY ?? 50}%`,
              }}
            />
          ) : null,
        )}
      </div>
      {showStretchReveal && !reducedMotion && (
        <HeroMembrane onComplete={finishReveal} locale={locale} />
      )}
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">{home.heroEyebrow}</p>
        <h1>{home.heroHeadline}</h1>
        <p>{home.heroCopy}</p>
        <div className="hero-actions">
          <a className="button button--primary" href="#calculator">
            {labels.calculator}
          </a>
          <Link
            className="button button--ghost"
            href={locale === "ro" ? "/ro/galerie" : "/en/gallery"}
          >
            {locale === "ro" ? "Vezi portofoliul" : "View portfolio"}
          </Link>
        </div>
      </div>
      <div className="hero-caption">
        <span>
          {slides[activeIndex]?.image.src.startsWith("/placeholders/")
            ? locale === "ro"
              ? "Imagine demonstrativa"
              : "Illustrative image"
            : slides[activeIndex]?.caption}
        </span>
        <div
          aria-label={locale === "ro" ? "Controale imagini" : "Image controls"}
          className="hero-dots"
          role="group"
        >
          {slides.map((slide, index) => (
            <button
              aria-label={`${locale === "ro" ? "Arata imaginea" : "Show image"} ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={index === activeIndex ? "is-active" : ""}
              key={`${slide.image.src}-dot`}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
          {slides.length > 1 && (
            <button
              aria-label={
                isPaused
                  ? locale === "ro"
                    ? "Porneste rotirea"
                    : "Resume rotation"
                  : locale === "ro"
                    ? "Opreste rotirea"
                    : "Pause rotation"
              }
              className="hero-dots__pause"
              onClick={() => setIsPaused((current) => !current)}
              type="button"
            >
              {isPaused ? "▶" : "Ⅱ"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
