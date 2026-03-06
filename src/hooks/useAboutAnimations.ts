"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useAboutAnimations() {
  const scope = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // -----------------------------
      // Intro (page load)
      // -----------------------------
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".aa-nav", { y: -14, opacity: 0, duration: 0.55 })
        .from(".aa-title", { y: 18, opacity: 0, duration: 0.65 }, "-=0.15")
        .from(".aa-subtitle", { y: 12, opacity: 0, duration: 0.55 }, "-=0.35")
        .from(".aa-bookNow", { scale: 0.97, opacity: 0, duration: 0.45 }, "-=0.25");

      const btn = document.querySelector(".aa-bookNow");
      if (btn) {
        gsap.fromTo(
          btn,
          { scale: 1 },
          {
            scale: 1.04,
            yoyo: true,
            repeat: 3,
            duration: 0.16,
            ease: "power1.inOut",
            delay: 0.75,
          },
        );
      }

      // -----------------------------
      // Philosophy (scroll reveal)
      // -----------------------------
      gsap.from(".aa-philoTitle", {
        scrollTrigger: { trigger: ".aa-philosophy", start: "top 78%" },
        y: 14,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.from(".aa-philoText, .aa-philoP", {
        scrollTrigger: { trigger: ".aa-philosophy", start: "top 78%" },
        y: 12,
        opacity: 0,
        duration: 0.65,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.05,
      });

      // -----------------------------
      // Values (4 items) stagger
      // -----------------------------
      gsap.from(".aa-valuesTitle", {
        scrollTrigger: { trigger: ".aa-values", start: "top 80%" },
        y: 12,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
      });

      gsap.from(".aa-value", {
        scrollTrigger: { trigger: ".aa-values", start: "top 80%" },
        y: 16,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      });

      // -----------------------------
      // Studios (2 cards)
      // -----------------------------
      gsap.from(".aa-studiosTitle", {
        scrollTrigger: { trigger: ".aa-studios", start: "top 80%" },
        y: 12,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
      });

      gsap.from(".aa-studioCard", {
        scrollTrigger: { trigger: ".aa-studios", start: "top 82%" },
        y: 16,
        opacity: 0,
        duration: 0.6,
        stagger: 0.14,
        ease: "power3.out",
      });

      gsap.from(
        ".aa-studioCard .aa-studioTitle, .aa-studioCard .aa-studioAddress, .aa-studioCard .aa-studioDesc",
        {
          scrollTrigger: { trigger: ".aa-studios", start: "top 82%" },
          y: 10,
          opacity: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.06,
        },
      );

      // -----------------------------
      // Hover lift (values + studios)
      // -----------------------------
      const hoverEls = Array.from(
        document.querySelectorAll<HTMLElement>(".aa-hoverLift"),
      );

      hoverEls.forEach((el) => {
        const onEnter = () => gsap.to(el, { y: -6, duration: 0.22, ease: "power2.out" });
        const onLeave = () => gsap.to(el, { y: 0, duration: 0.22, ease: "power2.out" });

        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);

        cleanups.push(() => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
        });
      });
    }, scope);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return scope;
}

