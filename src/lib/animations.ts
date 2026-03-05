"use client";

import { useEffect, type RefObject } from "react";
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
  { duration = 0.6, delay = 0, y = 20, ease = "power3.out", stagger = 0.1 }: StaggerOptions = {},
  prefersReducedMotion = false,
): void {
  const children = getChildren(container);
  if (children.length === 0) return;

  if (prefersReducedMotion) {
    gsap.set(children, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(children, { opacity: 0, y });

  gsap.fromTo(
    children,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
      stagger,
    },
  );
}

type BreathOptions = {
  duration?: number;
  scaleFrom?: number;
  scaleTo?: number;
  opacityFrom?: number;
  opacityTo?: number;
  letterSpacingFrom?: number;
  letterSpacingTo?: number;
};

type HoverLiftOptions = {
  duration?: number;
  liftY?: number;
  scale?: number;
  shadowIntensity?: number;
  iconRotateDeg?: number;
};

type ParallaxOptions = {
  strength?: number;
  maxOffset?: number;
};

type LightSweepOptions = {
  duration?: number;
  delay?: number;
};

/**
 * Creates a subtle breathing loop on a headline or CTA group.
 */
export function createBreathLoop(
  target: gsap.TweenTarget | null,
  {
    duration = 4.5,
    scaleFrom = 0.98,
    scaleTo = 1.02,
    opacityFrom = 0.9,
    opacityTo = 1,
    letterSpacingFrom = 0,
    letterSpacingTo = 0.02,
  }: BreathOptions = {},
  prefersReducedMotion = false,
): gsap.core.Timeline | null {
  if (!target) return null;

  if (prefersReducedMotion) {
    gsap.set(target, { scale: 1, opacity: 1, letterSpacing: "normal" });
    return null;
  }

  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
    defaults: { ease: "sine.inOut", duration: duration / 2 },
  });

  tl.fromTo(
    target,
    {
      scale: scaleFrom,
      opacity: opacityFrom,
      letterSpacing: `${letterSpacingFrom}em`,
    },
    {
      scale: scaleTo,
      opacity: opacityTo,
      letterSpacing: `${letterSpacingTo}em`,
    },
  );

  return tl;
}

/**
 * Builds a paused hover timeline for soft card lift and tiny icon rotation.
 * Call .play() / .reverse() on mouse enter/leave.
 */
export function createHoverSoftLift(
  card: HTMLElement | null,
  icon: HTMLElement | null,
  {
    duration = 0.35,
    liftY = -8,
    scale = 1.02,
    shadowIntensity = 0.18,
    iconRotateDeg = 3,
  }: HoverLiftOptions = {},
  prefersReducedMotion = false,
): gsap.core.Timeline | null {
  if (!card) return null;

  if (prefersReducedMotion) {
    gsap.set(card, { y: 0, scale: 1, boxShadow: "none" });
    if (icon) gsap.set(icon, { rotate: 0 });
    return null;
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out", duration } });

  tl.to(card, {
    y: liftY,
    scale,
    boxShadow: `0 18px 45px rgba(0,0,0,${shadowIntensity})`,
  });

  if (icon) {
    tl.to(
      icon,
      {
        rotate: iconRotateDeg,
      },
      0,
    );
  }

  return tl;
}

/**
 * Simple parallax effect for background elements based on scroll position.
 */
export function createParallax(
  target: HTMLElement | null,
  { strength = 0.2, maxOffset = 40 }: ParallaxOptions = {},
  prefersReducedMotion = false,
): () => void {
  if (!target || typeof window === "undefined" || prefersReducedMotion) {
    return () => {};
  }

  let frameId: number | null = null;

  const onScroll = () => {
    if (frameId != null) return;
    frameId = window.requestAnimationFrame(() => {
      const offset = Math.max(Math.min(window.scrollY * strength, maxOffset), -maxOffset);
      gsap.to(target, {
        y: offset,
        ease: "power1.out",
        duration: 0.6,
        overwrite: "auto",
      });
      frameId = null;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
    if (frameId != null) window.cancelAnimationFrame(frameId);
  };
}

/**
 * Warm light sweep across a hero overlay.
 */
export function createLightSweep(
  target: gsap.TweenTarget | null,
  { duration = 6, delay = 1.5 }: LightSweepOptions = {},
  prefersReducedMotion = false,
): gsap.core.Tween | null {
  if (!target) return null;

  if (prefersReducedMotion) {
    gsap.set(target, { opacity: 0.5 });
    return null;
  }

  return gsap.fromTo(
    target,
    { xPercent: -120 },
    {
      xPercent: 120,
      duration,
      delay,
      repeat: -1,
      ease: "sine.inOut",
    },
  );
}

type ScrollRevealHandler = (el: Element) => void;

/**
 * Scroll-based reveal hook using IntersectionObserver.
 */
export function useScrollReveal<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: ScrollRevealHandler,
  {
    rootMargin = "0px 0px -10% 0px",
    once = true,
  }: { rootMargin?: string; once?: boolean } = {},
  prefersReducedMotion = false,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      handler(el);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      handler(el);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handler(entry.target);
            if (once) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [ref, handler, rootMargin, once, prefersReducedMotion]);
}


