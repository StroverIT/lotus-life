"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function useHomeIntro(enabled = true) {
  const scope = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion) return;

    if (!enabled) {
      const ctx = gsap.context(() => {
        gsap.set([".ll-nav", ".ll-heroTitle", ".ll-heroTagline", ".ll-featureCard", ".ll-stat"], {
          opacity: 1,
          y: 0,
        });
      }, scope);
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power1" } });

      tl.to(".ll-nav", { y: 0, opacity: 1, duration: 0.5 })
        .to(".ll-heroTitle", { y: 0, opacity: 1, duration: 0.6 }, "-=0.2")
        .to(".ll-heroTagline", { y: 0, opacity: 1, duration: 0.55 }, "-=0.45")
        .to(".ll-featureCard", { y: 0, opacity: 1, duration: 0.15, stagger: 0.14 }, "-=0.39")
        .to(".ll-stat", { y: 0, opacity: 1, duration: 0.45, stagger: 0.08 }, "-=0.25");
    }, scope);

    return () => ctx.revert();
  }, [prefersReducedMotion, enabled]);

  return scope;
}

