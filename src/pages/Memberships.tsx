"use client";

import { useState, useEffect } from "react";
import { Check, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePageFirstVisit } from "@/context/PageAnimationContext";
import { useMembershipsAnimations } from "@/hooks/useMembershipsAnimations";
import { MembershipSignupDialog } from "@/components/MembershipSignupDialog";
import type { Membership } from "@/types/catalog";

const singleClassPrice = "€10";

const MembershipsPage = () => {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [plans, setPlans] = useState<Membership[]>([]);
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);

  const shouldAnimate = usePageFirstVisit("memberships");
  const scope = useMembershipsAnimations(shouldAnimate);

  useEffect(() => {
    const t = setTimeout(() => setContentLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const plansRes = await fetch("/api/memberships");
        const plansJson = await plansRes.json();
        if (!alive) return;
        setPlans(plansJson as Membership[]);
      } catch {
        if (!alive) return;
        setPlans([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const openSignup = (plan: Membership | null) => {
    setSelectedPlan(plan);
    setSignupOpen(true);
  };

  return (
    <Layout>
      <div ref={scope}>
        {/* Hero */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="pp-nav relative z-10 container mx-auto px-4 text-center">
            <h1 className="pp-title font-display text-5xl md:text-7xl font-light text-primary-foreground mb-4">
              Memberships
            </h1>
            <p className="pp-subtitle text-accent text-lg font-body max-w-xl mx-auto">
              Choose the plan that fits your lifestyle. All memberships include access to both
              Pirin Hall and Rodopi Hall.
            </p>
            <Button
              className="pp-bookNowTop mt-6 gradient-purple text-primary-foreground border-0 hover:opacity-90"
              onClick={() => openSignup(plans[0] ?? null)}
            >
              Book Now
            </Button>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {!contentLoaded || plans.length === 0 ? (
              <>
                <div className="pp-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-2xl" />
                  ))}
                </div>
                <div className="pp-dropin text-center mt-12 p-8 rounded-xl bg-secondary max-w-md mx-auto">
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-10 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-48 mx-auto" />
                </div>
              </>
            ) : (
              <>
                <div className="pp-grid grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {plans.map((plan) => {
                    const currency = plan.price.replace(/\d/g, "").trim() || "€";
                    const amount = Number(
                      plan.price.replace(/[^\d]/g, ""),
                    );

                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          "pp-card relative rounded-2xl p-8 flex flex-col",
                          plan.highlighted
                            ? "is-popular gradient-purple text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]"
                            : "border border-border bg-card",
                        )}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="pp-badge flex items-center gap-1 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold font-body">
                              <Star className="w-3 h-3" /> {plan.badge}
                            </span>
                          </div>
                        )}

                        <h3 className="pp-planName font-display text-2xl mb-2">
                          {plan.name}
                        </h3>
                        <div className="mb-6">
                          <span className="font-display text-4xl font-semibold">
                            {currency}
                            <span className="pp-priceNum ml-1">
                              {Number.isNaN(amount) ? plan.price : amount}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "pp-priceUnit text-sm font-body ml-1",
                              plan.highlighted
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {plan.period}
                          </span>
                        </div>

                        <ul className="flex-1 space-y-3 mb-8">
                          {plan.features.map((f) => (
                            <li
                              key={f}
                              className="pp-perk flex items-start gap-2 text-sm font-body"
                            >
                              <Check
                                className={cn(
                                  "w-4 h-4 shrink-0 mt-0.5",
                                  plan.highlighted ? "text-accent" : "text-primary",
                                )}
                              />
                              <span
                                className={
                                  plan.highlighted
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                                }
                              >
                                {f}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <Button
                          type="button"
                          onClick={() => openSignup(plan)}
                          className={cn(
                            "pp-cta w-full",
                            plan.highlighted
                              ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                              : "gradient-purple text-primary-foreground border-0 hover:opacity-90",
                          )}
                        >
                          Get Started
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="pp-dropin text-center mt-12 p-8 rounded-xl bg-secondary max-w-md mx-auto">
                  <p className="font-display text-xl mb-1">Drop-in Class</p>
                  <p className="font-display text-3xl font-semibold text-primary mb-2">
                    {singleClassPrice}
                  </p>
                  <p className="text-muted-foreground text-sm font-body">
                    No commitment. Just show up and flow.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        <MembershipSignupDialog
          open={signupOpen}
          onOpenChange={setSignupOpen}
          plan={selectedPlan}
        />
      </div>
    </Layout>
  );
};

export default MembershipsPage;
