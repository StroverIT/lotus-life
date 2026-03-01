"use client";

import { useRef } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Hero = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const logo = logoRef.current;
      const indicator = scrollIndicatorRef.current;
      if (!container || !logo) return;

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      const subtitle = container.querySelector("[data-hero='subtitle']");
      const title = container.querySelector("[data-hero='title']");
      const tagline = container.querySelector("[data-hero='tagline']");
      const location = container.querySelector("[data-hero='location']");
      const ctas = container.querySelector("[data-hero='ctas']");
      const cards = container.querySelector("[data-hero='cards']");

      tl.from(container, { opacity: 0, duration: 0.3 })
        .from(logo, { scale: 0.8, opacity: 0, duration: 0.8 }, 0.2)
        .from(subtitle, { opacity: 0, duration: 0.6 }, 0.4)
        .from(title, { opacity: 0, y: 20, duration: 0.8 }, 0.5)
        .from(tagline, { opacity: 0, duration: 0.6 }, 0.7)
        .from(location, { opacity: 0, duration: 0.6 }, 0.8)
        .from(ctas, { opacity: 0, y: 20, duration: 0.6 }, 0.9)
        .from(cards, { opacity: 0, y: 40, duration: 0.8 }, 1.1);

      if (indicator) {
        gsap.fromTo(
          indicator,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, delay: 1.5 }
        );
        const bounce = indicator.querySelector("[data-hero='bounce']");
        if (bounce) {
          gsap.to(bounce, {
            y: 8,
            duration: 0.75,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            delay: 1.5,
          });
        }
      }
    },
    { scope: wrapperRef }
  );

  const handleLogoMouseEnter = () => {
    if (logoRef.current) gsap.to(logoRef.current, { scale: 1.05, duration: 0.3, ease: "power2.out" });
  };
  const handleLogoMouseLeave = () => {
    if (logoRef.current) gsap.to(logoRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
  };

  return (
    <section ref={wrapperRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero-studio.jpg"
          alt="Lotus Life yoga studio interior"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-warm-white/70 via-warm-white/50 to-warm-white/90" />
      </div>

      <div ref={containerRef} className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="flex flex-col items-center">
          <div ref={logoRef} className="mb-8">
            <div
              className="relative w-48 h-48 md:w-64 md:h-64 cursor-pointer"
              onMouseEnter={handleLogoMouseEnter}
              onMouseLeave={handleLogoMouseLeave}
            >
              <Image
                src="/lotus-life-logo.svg"
                alt="Lotus Life logo"
                width={256}
                height={256}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <p
            data-hero="subtitle"
            className="text-charcoal-light text-lg tracking-[0.3em] uppercase mb-4 font-body"
          >
            Embrace Your Inner Harmony
          </p>

          <h1
            data-hero="title"
            className="font-display text-6xl md:text-8xl font-light text-charcoal mb-6"
          >
            Lotus Life
          </h1>

          <div
            data-hero="tagline"
            className="flex items-center gap-8 text-charcoal-light text-lg tracking-widest font-light mb-8"
          >
            <span>breathe</span>
            <span className="w-1 h-1 rounded-full bg-sage" />
            <span>move</span>
            <span className="w-1 h-1 rounded-full bg-sage" />
            <span>create</span>
          </div>

          <div
            data-hero="location"
            className="flex items-center gap-2 text-charcoal-light mb-10"
          >
            <MapPin className="w-4 h-4" />
            <span className="font-body">Bansko, Bulgaria</span>
          </div>

          <div
            data-hero="ctas"
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <a href="#schedule">View Schedule</a>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="#pricing">Memberships</a>
            </Button>
          </div>
        </div>

        <div
          data-hero="cards"
          className="mt-20 grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
        >
          <div className="bg-cream/80 backdrop-blur-sm rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-xl text-charcoal mb-2">Pirin Hall</h3>
            <p className="text-charcoal-light text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nayden Gerov 34, Str.
            </p>
          </div>
          <div className="bg-cream/80 backdrop-blur-sm rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-xl text-charcoal mb-2">Rodopi Hall</h3>
            <p className="text-charcoal-light text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nayden Gerov 36, Str.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-sage/50 rounded-full flex justify-center p-2">
          <div data-hero="bounce" className="w-1 h-2 bg-sage rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
