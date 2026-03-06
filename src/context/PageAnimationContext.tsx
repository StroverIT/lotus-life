"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PageKey =
  | "home"
  | "about"
  | "contact"
  | "yoga"
  | "memberships"
  | "massage";

type PageAnimationContextValue = {
  hasAnimated: (page: PageKey) => boolean;
  markAnimated: (page: PageKey) => void;
};

const PageAnimationContext = createContext<PageAnimationContextValue | null>(
  null,
);

export function PageAnimationsProvider({ children }: { children: ReactNode }) {
  const [animatedPages, setAnimatedPages] = useState<Set<PageKey>>(
    () => new Set(),
  );

  const hasAnimated = useCallback(
    (page: PageKey) => animatedPages.has(page),
    [animatedPages],
  );

  const markAnimated = useCallback((page: PageKey) => {
    setAnimatedPages((prev) => {
      if (prev.has(page)) return prev;
      const next = new Set(prev);
      next.add(page);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      hasAnimated,
      markAnimated,
    }),
    [hasAnimated, markAnimated],
  );

  return (
    <PageAnimationContext.Provider value={value}>
      {children}
    </PageAnimationContext.Provider>
  );
}

export function usePageFirstVisit(page: PageKey): boolean {
  const ctx = useContext(PageAnimationContext);

  if (!ctx) {
    throw new Error(
      "usePageFirstVisit must be used within a PageAnimationsProvider",
    );
  }

  const initialHasAnimated = ctx.hasAnimated(page);
  const [shouldAnimate] = useState(() => !initialHasAnimated);

  // When the page unmounts for the first time, remember that it has animated.
  // Subsequent mounts in the same session will get shouldAnimate = false.
  useEffect(() => {
    return () => {
      if (!initialHasAnimated) {
        ctx.markAnimated(page);
      }
    };
  }, [ctx, initialHasAnimated, page]);

  return shouldAnimate;
}

