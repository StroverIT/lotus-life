"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function useHoverLift(selector = ".ll-hoverLift") {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>(selector));

    const cleanups: Array<() => void> = [];

    cards.forEach((el) => {
      const onEnter = () => gsap.to(el, { y: -6, duration: 0.25, ease: "power2.out" });
      const onLeave = () => gsap.to(el, { y: 0, duration: 0.25, ease: "power2.out" });

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);

      cleanups.push(() => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [selector, prefersReducedMotion]);
}

