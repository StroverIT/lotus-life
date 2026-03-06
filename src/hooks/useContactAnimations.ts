"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useContactAnimations() {
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

      tl.from(".cc-nav", { y: -14, opacity: 0, duration: 0.55 })
        .from(".cc-title", { y: 18, opacity: 0, duration: 0.65 }, "-=0.15")
        .from(".cc-subtitle", { y: 12, opacity: 0, duration: 0.55 }, "-=0.35")
        .from(".cc-bookNowTop", { scale: 0.97, opacity: 0, duration: 0.45 }, "-=0.25");

      // -----------------------------
      // "Let's Connect" block (cards + studios, top-to-bottom)
      // -----------------------------
      gsap.from(".cc-card, .cc-studio", {
        scrollTrigger: { trigger: ".cc-cards", start: "top 80%" },
        y: 14,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.from(".cc-hourRow", {
        scrollTrigger: { trigger: ".cc-hours", start: "top 85%" },
        y: 10,
        opacity: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
      });

      // -----------------------------
      // Form reveal (scroll)
      // -----------------------------
      gsap.from(".cc-formTitle", {
        scrollTrigger: { trigger: ".cc-form", start: "top 82%" },
        y: 12,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
      });

      gsap.from(".cc-field", {
        scrollTrigger: { trigger: ".cc-form", start: "top 82%" },
        y: 12,
        opacity: 0,
        duration: 0.5,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.05,
      });

      gsap.from(".cc-submit", {
        scrollTrigger: { trigger: ".cc-form", start: "top 82%" },
        scale: 0.98,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.18,
      });

      // -----------------------------
      // Hover lift (contact cards)
      // -----------------------------
      const hoverEls = Array.from(
        document.querySelectorAll<HTMLElement>(".cc-hoverLift"),
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
      // Input focus micro-interaction
      // -----------------------------
      const inputs = Array.from(
        document.querySelectorAll<HTMLElement>(".cc-input"),
      );

      inputs.forEach((el) => {
        const onFocus = () =>
          gsap.to(el, { y: -1, duration: 0.15, ease: "power1.out" });
        const onBlur = () =>
          gsap.to(el, { y: 0, duration: 0.15, ease: "power1.out" });

        el.addEventListener("focus", onFocus, true);
        el.addEventListener("blur", onBlur, true);

        cleanups.push(() => {
          el.removeEventListener("focus", onFocus, true);
          el.removeEventListener("blur", onBlur, true);
        });
      });

      // -----------------------------
      // Submit button hover + click feedback
      // -----------------------------
      const submit = document.querySelector<HTMLElement>(".cc-submit");
      if (submit) {
        const onEnter = () =>
          gsap.to(submit, { scale: 1.03, duration: 0.15, ease: "power1.out" });
        const onLeave = () =>
          gsap.to(submit, { scale: 1, duration: 0.15, ease: "power1.out" });
        const onDown = () =>
          gsap.to(submit, { scale: 0.98, duration: 0.08, ease: "power1.out" });
        const onUp = () =>
          gsap.to(submit, { scale: 1.03, duration: 0.1, ease: "power1.out" });

        submit.addEventListener("mouseenter", onEnter);
        submit.addEventListener("mouseleave", onLeave);
        submit.addEventListener("mousedown", onDown);
        submit.addEventListener("mouseup", onUp);

        cleanups.push(() => {
          submit.removeEventListener("mouseenter", onEnter);
          submit.removeEventListener("mouseleave", onLeave);
          submit.removeEventListener("mousedown", onDown);
          submit.removeEventListener("mouseup", onUp);
        });
      }
    }, scope);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return scope;
}

