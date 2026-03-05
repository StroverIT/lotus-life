"use client";

import { gsap } from "gsap";

type FadeOptions = {
  duration?: number;
  delay?: number;
  y?: number;
  ease?: string;
};

type StaggerOptions = FadeOptions & {
  stagger?: number;
};

/**
 * Safely resolves children of a container for staggered animations.
 */
function getChildren(container: Element | null): Element[] {
  if (!container) return [];
  // HTMLCollection -> Array
  return Array.from((container as HTMLElement).children ?? []);
}

/**
 * Base fade + translateY in animation.
 * If reduced motion is enabled, it simply sets the element to the end state.
 */
export function fadeInUp(
  target: gsap.TweenTarget | null,
  { duration = 0.8, delay = 0, y = 20, ease = "power3.out" }: FadeOptions = {},
  prefersReducedMotion = false,
): void {
  if (!target) return;

  if (prefersReducedMotion) {
    gsap.set(target, { opacity: 1, y: 0 });
    return;
  }

  gsap.fromTo(
    target,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
    },
  );
}

/**
 * Staggered fade/slide for all direct children of a container.
 * If reduced motion is enabled, it sets all children to the end state without animation.
 */
export function staggerChildren(
  container: Element | null,
  { duration = 0.6, delay = 0, y = 20, ease = "power1", stagger = 0.1 }: StaggerOptions = {},
  prefersReducedMotion = false,
): void {
  const children = getChildren(container);
  if (children.length === 0) return;

  if (prefersReducedMotion) {
    gsap.set(children, { opacity: 1, y: 0 });
    return;
  }

  // gsap.set(children, { opacity: 0, y });

  // gsap.fromTo(
  //   children,
  //   { opacity: 0, y },
  //   {
  //     opacity: 1,
  //     y: 0,
  //     duration,
  //     delay,
  //     ease,
  //     stagger,
  //   },
  // );
}

