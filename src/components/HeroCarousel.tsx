"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from "motion/react";
import { useEffect, useState } from "react";

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
      window.location.hash
    ) {
      return;
    }

    try {
      if (window.sessionStorage.getItem("vd-barrisol-intro-seen") === "1") {
        return;
      }

      window.sessionStorage.setItem("vd-barrisol-intro-seen", "1");
      const revealTimer = window.setTimeout(
        () => setShowStretchReveal(true),
        0,
      );
      const timeout = window.setTimeout(
        () => setShowStretchReveal(false),
        1050,
      );

      return () => {
        window.clearTimeout(revealTimer);
        window.clearTimeout(timeout);
      };
    } catch {
      return;
    }
  }, [home.motionPreset, reducedMotion]);

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
      <div className="hero-overlay" />
      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {showStretchReveal && (
            <m.div
              aria-hidden="true"
              className="hero-stretch-reveal"
              initial={{
                borderRadius: "18% 18% 4% 4%",
                opacity: 1,
                scaleY: 0.82,
              }}
              animate={{ borderRadius: "0%", opacity: 0, scaleY: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            >
              <span />
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>
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
