"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function useHomeIntro() {
  const scope = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(".ll-nav", { y: 0, opacity: 1, duration: 0.5 })
        .to(".ll-heroTitle", { y: 0, opacity: 1, duration: 0.6 }, "-=0.2")
        .to(".ll-heroTagline", { y: 0, opacity: 1, duration: 0.55 }, "-=0.45")
        .to(".ll-featureCard", { y: 0, opacity: 1, duration: 0.55, stagger: 0.14 }, "-=0.2")
        .to(".ll-stat", { y: 0, opacity: 1, duration: 0.45, stagger: 0.08 }, "-=0.25");
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return scope;
}

