"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useYogaAnimations() {
  const scope = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // -----------------------------
      // Intro (on page load)
      // -----------------------------
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from(".yy-nav", { y: -14, opacity: 0, duration: 0.55 })
        .from(".yy-title", { y: 18, opacity: 0, duration: 0.65 }, "-=0.15")
        .from(".yy-subtitle", { y: 12, opacity: 0, duration: 0.55 }, "-=0.35")
        .from(".yy-bookNow", { scale: 0.96, opacity: 0, duration: 0.45 }, "-=0.25")
        .from(".yy-scheduleTitle", { y: 10, opacity: 0, duration: 0.45 }, "-=0.15")
        .to(".yy-day", { y: 0, opacity: 1, duration: 0.35, stagger: 0.06 }, "-=0.15")
        .to(".yy-classCard", { y: 0, opacity: 1, duration: 0.55, stagger: 0.09 }, "-=0.1")
        .from(".yy-pricing", { y: 8, opacity: 0, duration: 0.45 }, "-=0.2");

      // Subtle attention pulse for Book Now (once)
      const book = document.querySelector(".yy-bookNow");
      if (book) {
        gsap.fromTo(
          book,
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
      // Scroll reveals (Events section)
      // -----------------------------
      gsap.from(".yy-eventsTitle", {
        scrollTrigger: { trigger: ".yy-eventsTitle", start: "top 80%" },
        y: 14,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.from(".yy-eventCard", {
        scrollTrigger: { trigger: ".yy-events", start: "top 82%" },
        y: 16,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      });

      // -----------------------------
      // Hover lift (cards)
      // -----------------------------
      const hoverEls = Array.from(
        document.querySelectorAll<HTMLElement>(".yy-hoverLift"),
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

      // -----------------------------
      // Day tab click animation: animate current cards OUT only.
      // The page click handler is responsible for updating state and animating new cards IN.
      // -----------------------------
      (window as any).__yyAnimateDayChange = async () => {
        const cards = gsap.utils.toArray<HTMLElement>(".yy-classCard");
        if (!cards.length) return;

        await gsap.to(cards, {
          y: 10,
          opacity: 0,
          duration: 0.18,
          stagger: 0.03,
          ease: "power2.in",
        });
      };

      // Nice active-day nudge
      (window as any).__yyPopActiveDay = () => {
        const active = document.querySelector(
          ".yy-day.is-active",
        ) as HTMLElement | null;
        if (!active) return;
        gsap.fromTo(
          active,
          { scale: 1 },
          {
            scale: 1.06,
            duration: 0.14,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
          },
        );
      };
    }, scope);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return scope;
}

