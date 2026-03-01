"use client";

import { useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface UseGsapScrollRevealOptions {
  y?: number;
  x?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
  start?: string;
  ease?: string;
}

/**
 * Animates element on scroll into view using GSAP ScrollTrigger.
 * Returns a ref to attach to the element.
 */
export function useGsapScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseGsapScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    y = 20,
    x = 0,
    opacity = 0,
    duration = 0.6,
    delay = 0,
    once = true,
    start = "top 85%",
    ease = "power2.out",
  } = options;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.fromTo(
        el,
        { opacity, y, x },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          delay,
          ease,
          scrollTrigger: {
            trigger: el,
            start,
            once,
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: ref }
  );

  return ref;
}

export interface UseGsapScrollRevealStaggerOptions extends UseGsapScrollRevealOptions {
  stagger?: number;
  childSelector?: string;
  /** When provided, animation is re-run when these deps change (e.g. when data has loaded). */
  dependencies?: unknown[];
}

/**
 * Animates child elements with stagger when parent scrolls into view.
 */
export function useGsapScrollRevealStagger<T extends HTMLElement = HTMLDivElement>(
  options: UseGsapScrollRevealStaggerOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    y = 20,
    opacity = 0,
    duration = 0.5,
    delay = 0,
    stagger = 0.1,
    once = true,
    start = "top 85%",
    ease = "power2.out",
    childSelector = ":scope > *",
    dependencies = [],
  } = options;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const children = el.querySelectorAll(childSelector);
      if (children.length === 0) return;

      gsap.fromTo(
        children,
        { opacity, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger,
          ease,
          scrollTrigger: {
            trigger: el,
            start,
            once,
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: ref, dependencies }
  );

  return ref;
}
