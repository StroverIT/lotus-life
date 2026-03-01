"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MOCK_CURRENT_MEMBERSHIP,
  getMockAttendances,
} from "@/lib/mockPanelData";
import {
  PRICING_TIERS,
  getBenefitsUpgradeFrom,
  getBenefitsFromTo,
  getUpgradeTiers,
  getTierById,
  type PricingTierId,
} from "@/lib/pricing";
import { Check } from "lucide-react";

// Use mock preset: "none" | "one" | "many" to demo different states
const ATTENDANCE_PRESET: "none" | "one" | "many" = "many";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PanelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=/panel");
    }
  }, [status, router]);

  const attendances = getMockAttendances(ATTENDANCE_PRESET);
  const membership = MOCK_CURRENT_MEMBERSHIP;
  const currentTier = membership ? getTierById(membership) : null;
  const upgradeTiers = getUpgradeTiers(membership);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-charcoal-light font-body">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-display text-4xl text-charcoal mb-1">
          Your account
        </h1>
        <p className="text-charcoal-light font-body">
          {session?.user?.email}
        </p>
      </div>

      {/* History */}
      <section className="mb-16">
        <h2 className="font-display text-2xl text-charcoal mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sage" />
          Your visits
        </h2>
        {attendances.length === 0 ? (
          <div className="bg-cream rounded-2xl p-8 border border-border text-center">
            <p className="text-charcoal-light font-body mb-4">
              You haven&apos;t attended anything yet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="sage" asChild>
                <Link href="/#schedule">View schedule</Link>
              </Button>
              <Button variant="outline" asChild className="border-sage text-sage hover:bg-sage-light">
                <Link href="/#events">View events</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[...attendances]
              .sort(
                (a, b) =>
                  new Date(b.attendedAt).getTime() -
                  new Date(a.attendedAt).getTime()
              )
              .map((att) => (
                <div
                  key={att.id}
                  className="bg-cream rounded-xl p-4 border border-border flex flex-wrap items-center gap-3"
                >
                  <span
                    className={`text-xs font-body px-2 py-1 rounded-full ${
                      att.type === "event"
                        ? "bg-sage-light text-sage-dark"
                        : "bg-charcoal/10 text-charcoal"
                    }`}
                  >
                    {att.type === "event" ? "Event" : "Class"}
                  </span>
                  <span className="font-body font-medium text-charcoal">
                    {att.title}
                  </span>
                  <span className="text-charcoal-light text-sm font-body">
                    {formatDate(att.date)} · {att.time}
                  </span>
                  <span className="text-charcoal-light text-sm font-body flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {att.location}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Membership */}
      <section>
        <h2 className="font-display text-2xl text-charcoal mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-sage" />
          Membership
        </h2>
        {!currentTier ? (
          <>
            <p className="text-charcoal-light font-body mb-6">
              You don&apos;t have a membership. Choose a plan below.
            </p>
            <div className="space-y-6">
              {PRICING_TIERS.map((tier, index) => {
                const benefitsUpgrade = getBenefitsUpgradeFrom(
                  index === 0 ? null : (PRICING_TIERS[index - 1].id as PricingTierId)
                );
                return (
                  <div
                    key={tier.id}
                    className={`rounded-2xl p-6 border transition-all duration-300 ${
                      tier.highlighted
                        ? "bg-sage text-cream border-sage shadow-elevated"
                        : "bg-cream border-border shadow-soft"
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                      <h3
                        className={`font-display text-xl ${
                          tier.highlighted ? "text-cream" : "text-charcoal"
                        }`}
                      >
                        {tier.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`font-display text-3xl font-light ${
                            tier.highlighted ? "text-cream" : "text-charcoal"
                          }`}
                        >
                          €{tier.price}
                        </span>
                        <span
                          className={`text-sm ${
                            tier.highlighted ? "text-cream/70" : "text-charcoal-light"
                          }`}
                        >
                          /month
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {tier.features.map((f, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-2 text-sm font-body ${
                            tier.highlighted ? "text-cream/90" : "text-charcoal-light"
                          }`}
                        >
                          <Check
                            className={`w-4 h-4 shrink-0 ${
                              tier.highlighted ? "text-cream" : "text-sage"
                            }`}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {index < PRICING_TIERS.length - 1 && benefitsUpgrade.length > 0 && (
                      <p
                        className={`text-xs font-body mb-4 ${
                          tier.highlighted ? "text-cream/80" : "text-charcoal-light"
                        }`}
                      >
                        Upgrade to {PRICING_TIERS[index + 1].name} to get:{" "}
                        {benefitsUpgrade.join(", ")}
                      </p>
                    )}
                    <Button
                      variant={tier.highlighted ? "hero-outline" : "sage"}
                      className={
                        tier.highlighted
                          ? "border-cream text-cream hover:bg-cream hover:text-sage"
                          : ""
                      }
                      asChild
                    >
                      <span>Get {tier.name}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="bg-sage text-cream rounded-2xl p-6 mb-6 shadow-soft">
              <p className="text-cream/80 text-sm font-body mb-2">
                Current plan
              </p>
              <h3 className="font-display text-2xl mb-2">{currentTier.name}</h3>
              <p className="font-display text-3xl font-light mb-4">
                €{currentTier.price}
                <span className="text-cream/70 text-lg">/month</span>
              </p>
              <ul className="space-y-2">
                {currentTier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-cream/90 text-sm font-body">
                    <Check className="w-4 h-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            {upgradeTiers.length > 0 && (
              <>
                <h3 className="font-display text-xl text-charcoal mb-4">
                  Upgrade for more
                </h3>
                <div className="space-y-4">
                  {upgradeTiers.map((tier) => {
                    const benefitsGain = getBenefitsFromTo(membership, tier.id);
                    return (
                      <div
                        key={tier.id}
                        className="bg-cream rounded-xl p-6 border border-border"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                          <h4 className="font-display text-lg text-charcoal">
                            {tier.name}
                          </h4>
                          <span className="font-body text-charcoal">
                            €{tier.price}/month
                            <span className="text-charcoal-light text-sm ml-1">
                              (+€{tier.price - (currentTier?.price ?? 0)})
                            </span>
                          </span>
                        </div>
                        <p className="text-sage-dark text-sm font-body mb-2">
                          Benefits you&apos;ll gain:
                        </p>
                        <ul className="space-y-1 mb-4">
                          {benefitsGain.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-charcoal-light text-sm font-body"
                            >
                              <ArrowRight className="w-3 h-3 text-sage" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <Button variant="sage" size="sm">
                          Upgrade to {tier.name}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <p className="mt-12 text-center">
        <Link href="/" className="text-sage hover:underline font-body text-sm">
          Back to home
        </Link>
      </p>
    </div>
  );
}
