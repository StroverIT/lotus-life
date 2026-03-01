"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Calendar, MapPin, Sparkles, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MOCK_CURRENT_MEMBERSHIP,
  getMockAttendances,
  VISITS_PAGE_SIZE,
  type MockAttendance,
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
import { useGsapScrollRevealStagger } from "@/hooks/useGsapScrollReveal";

// Use mock preset: "none" | "one" | "many" to demo different states
const ATTENDANCE_PRESET: "none" | "one" | "many" = "many";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAttendedAt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PanelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"visits" | "membership">("visits");
  const [visibleCount, setVisibleCount] = useState(VISITS_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=/panel");
    }
  }, [status, router]);

  const attendances = getMockAttendances(ATTENDANCE_PRESET);
  const sortedAttendances = useMemo(
    () =>
      [...attendances].sort(
        (a, b) =>
          new Date(b.attendedAt).getTime() - new Date(a.attendedAt).getTime()
      ),
    [attendances]
  );
  const displayedAttendances = sortedAttendances.slice(0, visibleCount);
  const hasMore = visibleCount < sortedAttendances.length;
  const total = sortedAttendances.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + VISITS_PAGE_SIZE, total));
  }, [total]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: null, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  // Reset visible count when preset or data changes
  useEffect(() => {
    setVisibleCount(VISITS_PAGE_SIZE);
  }, [ATTENDANCE_PRESET, attendances.length]);

  const membership = MOCK_CURRENT_MEMBERSHIP;
  const currentTier = membership ? getTierById(membership) : null;
  const upgradeTiers = getUpgradeTiers(membership);
  const nextTier = upgradeTiers[0] ?? null;

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-charcoal-light font-body">Loading…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-4xl text-charcoal mb-1">
          Your account
        </h1>
        <p className="text-charcoal-light font-body">
          {session?.user?.email}
        </p>
      </div>

      {/* Sticky tab bar */}
      <div
        className="sticky top-0 z-10 -mx-4 px-4 pt-2 pb-2 bg-cream border-b border-border mb-8"
        style={{ marginTop: "-0.5rem" }}
      >
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-charcoal-light hover:text-sage font-body text-sm transition-colors"
            aria-label="Back to home"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("visits")}
            className={`px-4 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
              activeTab === "visits"
                ? "bg-sage text-cream"
                : "text-charcoal-light hover:bg-charcoal/5"
            }`}
          >
            Visits
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("membership")}
            className={`px-4 py-2.5 rounded-lg font-body text-sm font-medium transition-colors ${
              activeTab === "membership"
                ? "bg-sage text-cream"
                : "text-charcoal-light hover:bg-charcoal/5"
            }`}
          >
            Membership
          </button>
          </div>
        </div>
      </div>

      {/* Tab content with key so animations re-run on switch */}
      {activeTab === "visits" && (
        <VisitsTabContent
          key="visits"
          attendances={displayedAttendances}
          total={total}
          hasMore={hasMore}
          sentinelRef={sentinelRef}
        />
      )}
      {activeTab === "membership" && (
        <MembershipTabContent
          key="membership"
          currentTier={currentTier}
          nextTier={nextTier}
          upgradeTiers={upgradeTiers}
          membershipId={membership}
        />
      )}
    </div>
  );
}

interface VisitsTabContentProps {
  attendances: MockAttendance[];
  total: number;
  hasMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

function VisitsTabContent({
  attendances,
  total,
  hasMore,
  sentinelRef,
}: VisitsTabContentProps) {
  const listRef = useGsapScrollRevealStagger<HTMLDivElement>({
    y: 16,
    opacity: 0,
    duration: 0.5,
    stagger: 0.08,
    childSelector: ":scope > *",
    dependencies: [attendances.length],
  });

  if (attendances.length === 0) {
    return (
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
    );
  }

  return (
    <section>
      <h2 className="font-display text-2xl text-charcoal mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-sage" />
        Your visits
      </h2>
      <div ref={listRef} className="space-y-3">
        {attendances.map((att) => (
          <div
            key={att.id}
            className="bg-cream rounded-xl p-4 border border-border"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
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
            </div>
            <p className="text-charcoal-light text-sm font-body mb-1">
              {formatDate(att.date)} · {att.time}
            </p>
            <p className="text-charcoal-light text-sm font-body flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {att.location}
            </p>
            <p className="text-charcoal-light/80 text-xs font-body">
              Attended on {formatAttendedAt(att.attendedAt)}
            </p>
          </div>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className="h-4" aria-hidden />}
    </section>
  );
}

interface MembershipTabContentProps {
  currentTier: ReturnType<typeof getTierById> | null;
  nextTier: ReturnType<typeof getTierById> | null;
  upgradeTiers: ReturnType<typeof getUpgradeTiers>;
  membershipId: PricingTierId | null;
}

function MembershipTabContent({
  currentTier,
  nextTier,
  upgradeTiers,
  membershipId,
}: MembershipTabContentProps) {
  const listRef = useGsapScrollRevealStagger<HTMLDivElement>({
    y: 16,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    childSelector: ":scope > *",
  });

  return (
    <section>
      <h2 className="font-display text-2xl text-charcoal mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-sage" />
        Membership
      </h2>
      <div ref={listRef} className="space-y-6">
        {!currentTier ? (
          <>
            <p className="text-charcoal-light font-body mb-2">
              You don&apos;t have a membership. Choose a plan below.
            </p>
            {PRICING_TIERS.map((tier, index) => {
              const nextTierData = PRICING_TIERS[index + 1];
              const benefitsUpgrade = nextTierData
                ? getBenefitsUpgradeFrom(tier.id as PricingTierId)
                : [];
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
                  {nextTierData && benefitsUpgrade.length > 0 && (
                    <p
                      className={`text-xs font-body mb-4 ${
                        tier.highlighted ? "text-cream/80" : "text-charcoal-light"
                      }`}
                    >
                      Upgrade to {nextTierData.name} to get:{" "}
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
          </>
        ) : (
          <>
            <div className="bg-sage text-cream rounded-2xl p-6 shadow-soft">
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
            {nextTier && (
              <div className="bg-cream rounded-2xl p-6 border border-border">
                <h3 className="font-display text-xl text-charcoal mb-3">
                  {nextTier.name}
                </h3>
                <p className="font-body text-charcoal mb-2">
                  €{nextTier.price}/month
                  <span className="text-charcoal-light text-sm ml-1">
                    (+€{nextTier.price - (currentTier?.price ?? 0)}/month)
                  </span>
                </p>
                <ul className="space-y-2 mb-4">
                  {nextTier.features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-charcoal-light text-sm font-body"
                    >
                      <Check className="w-4 h-4 shrink-0 text-sage" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-sage-dark text-sm font-body mb-2">
                  Benefits you&apos;ll gain:
                </p>
                <ul className="space-y-1 mb-4">
                  {getBenefitsFromTo(membershipId, nextTier.id).map((f, i) => (
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
                  Upgrade to {nextTier.name}
                </Button>
              </div>
            )}
            {upgradeTiers.length > 1 &&
              upgradeTiers.slice(1).map((tier) => {
                const benefitsGain = getBenefitsFromTo(membershipId, tier.id);
                return (
                  <div
                    key={tier.id}
                    className="bg-cream rounded-xl p-6 border border-border"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <h4 className="font-display text-lg text-charcoal">
                        {tier.name}
                      </h4>
                      <span className="font-body text-charcoal text-sm">
                        €{tier.price}/month
                        <span className="text-charcoal-light text-sm ml-1">
                          (+€{tier.price - (currentTier?.price ?? 0)}/month)
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
          </>
        )}
      </div>
    </section>
  );
}
