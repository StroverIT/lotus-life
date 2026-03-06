"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function useMassageAnimations(enabled = true) {
  const scope = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!scope.current || prefersReducedMotion) return;

    if (!enabled) {
      const ctx = gsap.context(() => {
        gsap.set(
          [
            ".mm-nav",
            ".mm-title",
            ".mm-subtitle",
            ".mm-bookNowTop",
            ".mm-sectionTitle",
            ".mm-sectionIntro",
            ".mm-card",
            ".mm-cardTitle",
            ".mm-cardDesc",
            ".mm-benefit",
            ".mm-cardCta",
            ".mm-membersBanner",
            ".mm-membersCta",
          ],
          { opacity: 1, y: 0, scale: 1 },
        );
        gsap.utils.toArray<HTMLElement>(".mm-priceNum").forEach((el) => {
          const endValue = el.textContent?.replace(/[^\d]/g, "") || "0";
          if (endValue) el.textContent = endValue;
        });
      }, scope);
      return () => ctx.revert();
    }

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      // ---------------------------------
      // Intro timeline
      // ---------------------------------
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".mm-nav", { y: -14, opacity: 0, duration: 0.55 })
        .from(".mm-title", { y: 18, opacity: 0, duration: 0.65 }, "-=0.15")
        .from(".mm-subtitle", { y: 12, opacity: 0, duration: 0.55 }, "-=0.38")
        .from(".mm-bookNowTop", { scale: 0.97, opacity: 0, duration: 0.45 }, "-=0.25")
        .from(".mm-sectionTitle", { y: 10, opacity: 0, duration: 0.45 }, "-=0.15")
        .from(".mm-sectionIntro", { y: 10, opacity: 0, duration: 0.45 }, "-=0.3")
        .from(".mm-card", { y: 16, opacity: 0, duration: 0.55, stagger: 0.09 }, "-=0.05");

      // subtle pulse on the top Book Now (one time)
      const topBtn = document.querySelector(".mm-bookNowTop");
      if (topBtn) {
        gsap.fromTo(
          topBtn,
          { scale: 1 },
          {
            scale: 1.04,
            yoyo: true,
            repeat: 3,
            duration: 0.16,
            ease: "power1.inOut",
            delay: 0.75,
          },
        );
      }

      // ---------------------------------
      // Scroll reveals per card + count-up price
      // ---------------------------------
      gsap.utils.toArray<HTMLElement>(".mm-card").forEach((card) => {
        const priceNum = card.querySelector(".mm-priceNum") as HTMLElement | null;

        // card content reveal
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 86%",
          },
          y: 18,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        });

        gsap.from(
          card.querySelectorAll(
            ".mm-cardTitle, .mm-cardDesc, .mm-benefit, .mm-cardCta",
          ),
          {
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
            },
            y: 10,
            opacity: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power3.out",
            delay: 0.05,
          },
        );

        // price count-up (from 0 to number)
        if (priceNum) {
          const endValue = Number(
            priceNum.textContent?.replace(/[^\d]/g, "") || "0",
          );
          const obj = { val: 0 };

          ScrollTrigger.create({
            trigger: card,
            start: "top 88%",
            once: true,
            onEnter: () => {
              gsap.to(obj, {
                val: endValue,
                duration: 0.9,
                ease: "power2.out",
                onUpdate: () => {
                  priceNum.textContent = String(Math.round(obj.val));
                },
              });
            },
          });
        }
      });

      // ---------------------------------
      // Membership banner reveal
      // ---------------------------------
      gsap.from(".mm-membersBanner", {
        scrollTrigger: { trigger: ".mm-membersBanner", start: "top 85%" },
        y: 14,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });

      gsap.from(".mm-membersCta", {
        scrollTrigger: { trigger: ".mm-membersBanner", start: "top 85%" },
        scale: 0.98,
        opacity: 0,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.1,
      });

      // ---------------------------------
      // Hover lift for cards
      // ---------------------------------
      const hoverEls = Array.from(
        document.querySelectorAll<HTMLElement>(".mm-hoverLift"),
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

      // ---------------------------------
      // CTA hover micro-interaction (optional)
      // ---------------------------------
      gsap.utils.toArray<HTMLElement>(".mm-cardCta").forEach((btn) => {
        const onEnter = () =>
          gsap.to(btn, { scale: 1.03, duration: 0.15, ease: "power1.out" });
        const onLeave = () =>
          gsap.to(btn, { scale: 1, duration: 0.15, ease: "power1.out" });

        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mouseleave", onLeave);

        cleanups.push(() => {
          btn.removeEventListener("mouseenter", onEnter);
          btn.removeEventListener("mouseleave", onLeave);
        });
      });
    }, scope);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [prefersReducedMotion, enabled]);

  return scope;
}

