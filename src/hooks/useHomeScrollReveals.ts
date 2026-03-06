"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useHomeScrollReveals(enabled = true) {
  const scope = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion) return;

    if (!enabled) {
      const ctx = gsap.context(() => {
        gsap.set([".ll-philoTitle", ".ll-philoText", ".ll-value"], {
          opacity: 1,
          y: 0,
        });
      }, scope);
      return () => ctx.revert();
    }

    const ctx = gsap.context(() => {
      gsap.to(".ll-philoTitle", {
        scrollTrigger: {
          trigger: ".ll-philosophy",
          start: "top 75%",
        },
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.to(".ll-philoText", {
        scrollTrigger: {
          trigger: ".ll-philosophy",
          start: "top 75%",
        },
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay: 0.1,
        ease: "power3.out",
      });

      gsap.to(".ll-value", {
        scrollTrigger: {
          trigger: ".ll-values",
          start: "top 78%",
        },
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.12,
        ease: "power3.out",
      });
    }, scope);

    return () => ctx.revert();
  }, [prefersReducedMotion, enabled]);

  return scope;
}

