"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Check, Star, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePageFirstVisit } from "@/context/PageAnimationContext";
import { useMembershipsAnimations } from "@/hooks/useMembershipsAnimations";
import { MembershipSignupDialog } from "@/components/MembershipSignupDialog";
import type { Membership } from "@/types/catalog";

const singleClassPrice = "€10";

type UserMembershipApplication = {
  id: string;
  membershipId: string;
  status: "PENDING" | "REJECTED" | "SUCCESSFUL";
};

const MembershipsPage = () => {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [plans, setPlans] = useState<Membership[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembershipApplication[]>([]);
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const { data: session } = useSession();

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

  const refetchUserMemberships = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/user-memberships");
      const json = (await res.json()) as { applications?: UserMembershipApplication[] };
      setUserMemberships(json.applications ?? []);
    } catch {
      setUserMemberships([]);
    }
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) {
      setUserMemberships([]);
      return;
    }
    refetchUserMemberships();
  }, [session?.user, refetchUserMemberships]);

  const latestApplication = userMemberships.find(
    (a) => a.status === "SUCCESSFUL" || a.status === "PENDING"
  );
  const latestApplicationAny = userMemberships[0];
  const currentMembershipId = latestApplication?.membershipId ?? null;
  const currentIdx = currentMembershipId ? plans.findIndex((p) => p.id === currentMembershipId) : -1;
  const isPending = latestApplication?.status === "PENDING";
  const isSuccessful = latestApplication?.status === "SUCCESSFUL";
  const isRejected = latestApplicationAny?.status === "REJECTED";
  const rejectedPlanId = isRejected ? latestApplicationAny?.membershipId : null;

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
                  {plans.map((plan, idx) => {
                    const currency = plan.price.replace(/\d/g, "").trim() || "€";
                    const amount = Number(
                      plan.price.replace(/[^\d]/g, ""),
                    );
                    const isCurrent = plan.id === currentMembershipId;
                    const isRejectedPlan = plan.id === rejectedPlanId;
                    const isDisplayPlan = isCurrent || isRejectedPlan;
                    const isUpgrade = currentIdx >= 0 && idx === currentIdx + 1;
                    const isDowngrade = currentIdx >= 0 && idx === currentIdx - 1;

                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          "pp-card relative rounded-2xl p-8 flex flex-col",
                          plan.highlighted && !isDisplayPlan
                            ? "is-popular gradient-purple text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]"
                            : "border border-border bg-card",
                          isCurrent && isSuccessful && "border-2 border-emerald-500 dark:border-emerald-600 shadow-lg shadow-emerald-500/10",
                          isCurrent && isPending && "border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20",
                          isRejectedPlan && "border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20",
                        )}
                      >
                        {isCurrent && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            {isPending ? (
                              <Badge className="gap-1.5 border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 text-xs font-body font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                Awaiting payment
                              </Badge>
                            ) : (
                              <Badge className="gap-1.5 border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 text-xs font-body font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Current plan
                              </Badge>
                            )}
                          </div>
                        )}
                        {isRejectedPlan && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="gap-1.5 border-0 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 text-xs font-body font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Request rejected
                            </Badge>
                          </div>
                        )}
                        {isUpgrade && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="gap-1 gradient-purple text-primary-foreground border-0 text-xs font-body">
                              <ArrowUpRight className="w-3 h-3" /> Upgrade
                            </Badge>
                          </div>
                        )}
                        {isDowngrade && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge variant="secondary" className="text-xs font-body gap-1">
                              <ArrowDownRight className="w-3 h-3" /> Downgrade
                            </Badge>
                          </div>
                        )}
                        {plan.badge && !isDisplayPlan && !isUpgrade && !isDowngrade && (
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
                              (plan.highlighted && !isDisplayPlan)
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
                                  (plan.highlighted && !isDisplayPlan) ? "text-accent" : "text-primary",
                                )}
                              />
                              <span
                                className={
                                  (plan.highlighted && !isDisplayPlan)
                                    ? "text-primary-foreground/80"
                                    : "text-muted-foreground"
                                }
                              >
                                {f}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {isCurrent ? (
                          isPending ? (
                            <p className="text-center text-sm text-muted-foreground font-body py-2">
                              Pay by cash at the studio — we&apos;ll confirm when received.
                            </p>
                          ) : (
                            <Button
                              type="button"
                              disabled
                              variant="outline"
                              className="w-full border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            >
                              Current plan
                            </Button>
                          )
                        ) : isRejectedPlan ? (
                          <p className="text-center text-sm text-muted-foreground font-body py-2">
                            This request was not approved. You can choose another plan.
                          </p>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => openSignup(plan)}
                            className={cn(
                              "pp-cta w-full",
                              plan.highlighted && !isUpgrade && !isDowngrade
                                ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                                : "gradient-purple text-primary-foreground border-0 hover:opacity-90",
                              isUpgrade && "gradient-purple text-primary-foreground border-0 hover:opacity-90",
                              isDowngrade && "border-border bg-secondary hover:bg-secondary/80",
                            )}
                          >
                            {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Get Started"}
                          </Button>
                        )}
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
          onSuccess={refetchUserMemberships}
        />
      </div>
    </Layout>
  );
};

export default MembershipsPage;
