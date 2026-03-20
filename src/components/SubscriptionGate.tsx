import Image from "next/image";
import type { ReactNode } from "react";

function isSubscriptionPaid(): boolean {
  return process.env.SUBSCRIPTION_PAID === "true";
}

function SubscriptionPausedScreen() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16"
      role="alert"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(var(--lotus-glow)/0.45),transparent_55%),radial-gradient(ellipse_90%_60%_at_100%_100%,hsl(var(--primary)/0.12),transparent_50%),radial-gradient(ellipse_70%_50%_at_0%_90%,hsl(var(--accent)/0.2),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.92)_0%,hsl(var(--background)/0.96)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
        <p className="mb-6 font-body text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
          Lotus Life
        </p>

        <h1 className="max-w-md font-display text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl">
          We’ll be back shortly
        </h1>
        <p className="mt-5 max-w-sm text-pretty font-body text-base leading-relaxed text-muted-foreground">
          Our site is paused while we renew hosting. Thank you for your patience — see you in the studio.
        </p>
      </div>
    </div >
  );
}

/**
 * When `SUBSCRIPTION_PAID` is not exactly `"true"`, the app shows a full-screen message instead of children.
 * Set `SUBSCRIPTION_PAID=true` in the environment when the subscription is active.
 */
export function SubscriptionGate({ children }: { children: ReactNode }) {
  if (isSubscriptionPaid()) {
    return children;
  }

  return <SubscriptionPausedScreen />;
}
