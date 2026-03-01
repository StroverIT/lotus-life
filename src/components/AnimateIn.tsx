"use client";

import { useGsapScrollReveal, type UseGsapScrollRevealOptions } from "@/hooks/useGsapScrollReveal";
import { cn } from "@/lib/utils";

export interface AnimateInProps extends UseGsapScrollRevealOptions, React.HTMLAttributes<HTMLDivElement> {}

export function AnimateIn({
  y,
  x,
  opacity,
  duration,
  delay,
  once,
  start,
  ease,
  className,
  children,
  ...rest
}: AnimateInProps) {
  const ref = useGsapScrollReveal<HTMLDivElement>({
    y,
    x,
    opacity,
    duration,
    delay,
    once,
    start,
    ease,
  });

  return (
    <div ref={ref} className={cn(className)} {...rest}>
      {children}
    </div>
  );
}
