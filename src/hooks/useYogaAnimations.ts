"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useYogaAnimations(enabled = true) {
  const scope = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion) return;

    if (!enabled) {
      const ctx = gsap.context(() => {
        gsap.set(
          [
            ".yy-nav",
            ".yy-title",
            ".yy-subtitle",
            ".yy-bookNow",
            ".yy-scheduleTitle",
            ".yy-day",
            ".yy-classCard",
            ".yy-pricing",
            ".yy-eventsTitle",
            ".yy-eventCard",
          ],
          { opacity: 1, y: 0, scale: 1 },
        );
      }, scope);
      return () => ctx.revert();
    }

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // -----------------------------
      // Intro (on page load)
      // -----------------------------
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from(".yy-nav", { y: -14, opacity: 0, duration: 0.4 })
        .from(".yy-title", { y: 18, opacity: 0, duration: 0.5 }, "-=0.12")
        .from(".yy-subtitle", { y: 12, opacity: 0, duration: 0.42 }, "-=0.3")
        .from(".yy-bookNow", { scale: 0.96, opacity: 0, duration: 0.32 }, "-=0.22")
        .from(".yy-scheduleTitle", { y: 10, opacity: 0, duration: 0.34 }, "-=0.12")
        .to(".yy-day", { y: 0, opacity: 1, duration: 0.26, stagger: 0.05 }, "-=0.12")
        .to(".yy-classCard", { y: 0, opacity: 1, duration: 0.4, stagger: 0.07 }, "-=0.08")
        .from(".yy-pricing", { y: 8, opacity: 0, duration: 0.34 }, "-=0.18");

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
            duration: 0.12,
            ease: "power1.inOut",
            delay: 0.6,
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
        duration: 0.45,
        ease: "power3.out",
      });

      gsap.from(".yy-eventCard", {
        scrollTrigger: { trigger: ".yy-events", start: "top 82%" },
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.09,
        ease: "power3.out",
      });

      // -----------------------------
      // Hover lift (cards)
      // -----------------------------
      const hoverEls = Array.from(
        document.querySelectorAll<HTMLElement>(".yy-hoverLift"),
      );

      hoverEls.forEach((el) => {
        const onEnter = () => gsap.to(el, { y: -6, duration: 0.18, ease: "power2.out" });
        const onLeave = () => gsap.to(el, { y: 0, duration: 0.18, ease: "power2.out" });

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
          duration: 0.14,
          stagger: 0.02,
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
            duration: 0.1,
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
  }, [prefersReducedMotion, enabled]);

  return scope;
}

