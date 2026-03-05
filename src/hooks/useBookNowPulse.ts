"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function useBookNowPulse() {
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;

    const btn = document.querySelector<HTMLElement>(".ll-bookNow");
    if (!btn) return;

    gsap.fromTo(
      btn,
      { scale: 1 },
      { scale: 1.04, yoyo: true, repeat: 3, duration: 0.18, ease: "power1.inOut", delay: 0.8 },
    );
  }, [prefersReducedMotion]);
}

