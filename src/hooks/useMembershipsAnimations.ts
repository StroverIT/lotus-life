"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useMembershipsAnimations() {
  const scope = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cleanups: Array<() => void> = [];

      // -----------------------------
      // Intro (page load)
      // -----------------------------
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".pp-nav", { y: -14, opacity: 0, duration: 0.55 })
        .from(".pp-title", { y: 18, opacity: 0, duration: 0.65 }, "-=0.15")
        .from(".pp-subtitle", { y: 12, opacity: 0, duration: 0.55 }, "-=0.35")
        .from(".pp-bookNowTop", { scale: 0.97, opacity: 0, duration: 0.45 }, "-=0.25");

      // -----------------------------
      // Cards reveal + perk stagger
      // -----------------------------
      gsap.from(".pp-card", {
        scrollTrigger: { trigger: ".pp-grid", start: "top 82%" },
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.utils.toArray<HTMLElement>(".pp-card").forEach((card) => {
        gsap.from(card.querySelectorAll(".pp-perk"), {
          scrollTrigger: { trigger: card, start: "top 85%" },
          y: 10,
          opacity: 0,
          duration: 0.45,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.05,
        });

        const cta = card.querySelector<HTMLElement>(".pp-cta");
        if (cta) {
          gsap.fromTo(
            cta,
            { scale: 0.99, opacity: 0 },
            {
              scrollTrigger: { trigger: card, start: "top 85%" },
              scale: 1,
              opacity: 1,
              duration: 0.45,
              ease: "power2.out",
              delay: 0.12,
            },
          );
        }
      });

      // -----------------------------
      // Popular plan spotlight
      // -----------------------------
      const popular = document.querySelector<HTMLElement>(".pp-card.is-popular");
      if (popular) {
        gsap.fromTo(
          popular,
          { scale: 0.98 },
          {
            scrollTrigger: { trigger: ".pp-grid", start: "top 82%" },
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: 0.18,
          },
        );

        const badge = popular.querySelector<HTMLElement>(".pp-badge");
        if (badge) {
          gsap.fromTo(
            badge,
            { y: -6, opacity: 0 },
            {
              scrollTrigger: { trigger: popular, start: "top 85%" },
              y: 0,
              opacity: 1,
              duration: 0.45,
              ease: "power2.out",
              delay: 0.1,
            },
          );
        }
      }

      // -----------------------------
      // Price count-up (0 -> price)
      // -----------------------------
      gsap.utils.toArray<HTMLElement>(".pp-priceNum").forEach((el) => {
        const endValue = Number(el.textContent?.replace(/[^\d]/g, "") || "0");
        const obj = { val: 0 };

        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: endValue,
              duration: 0.9,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = String(Math.round(obj.val));
              },
            });
          },
        });
      });

      // -----------------------------
      // Drop-in block reveal
      // -----------------------------
      gsap.from(".pp-dropin", {
        scrollTrigger: { trigger: ".pp-dropin", start: "top 88%" },
        y: 14,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      // -----------------------------
      // Hover micro-interactions
      // -----------------------------
      const cards = gsap.utils.toArray<HTMLElement>(".pp-card");
      cards.forEach((card) => {
        const onEnter = () =>
          gsap.to(card, { y: -6, duration: 0.22, ease: "power2.out" });
        const onLeave = () =>
          gsap.to(card, { y: 0, duration: 0.22, ease: "power2.out" });

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);

        cleanups.push(() => {
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
        });
      });

      const ctas = gsap.utils.toArray<HTMLElement>(".pp-cta");
      ctas.forEach((btn) => {
        const onEnter = () =>
          gsap.to(btn, { scale: 1.03, duration: 0.15, ease: "power1.out" });
        const onLeave = () =>
          gsap.to(btn, { scale: 1, duration: 0.15, ease: "power1.out" });

        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mouseleave", onLeave);

        cleanups.push(() => {
          btn.removeEventListener("mouseenter", onEnter);
          btn.removeEventListener("mouseleave", onLeave);
        });
      });

      return () => {
        cleanups.forEach((fn) => fn());
      };
    }, scope);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return scope;
}

