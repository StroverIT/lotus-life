"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Clock, MapPin, User as UserIcon, Star, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { sampleVisits, Visit } from "@/data/visits";
import { memberships } from "@/data/memberships";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { fadeInUp } from "@/lib/animations";

// Simulated current membership (null = no membership)
const currentMembershipId: string | null = "essence";

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function groupByMonth(visits: Visit[]): Record<string, Visit[]> {
  const groups: Record<string, Visit[]> = {};
  for (const v of visits) {
    const d = new Date(v.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  }
  return groups;
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const UserPanel = () => {
  const [guest, setGuest] = useState<{ name?: string; email?: string } | null>(null);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const guestRaw = window.localStorage.getItem("lotus-life-guest");
      setGuest(guestRaw ? JSON.parse(guestRaw) : null);
    }
    fadeInUp(
      headerRef.current,
      {
        y: 20,
        duration: 0.8,
      },
      prefersReducedMotion,
    );
  }, [prefersReducedMotion]);

  const grouped = useMemo(() => {
    const g = groupByMonth(sampleVisits);
    // Sort months descending
    return Object.entries(g).sort(([a], [b]) => b.localeCompare(a));
  }, []);

  const currentPlan = memberships.find((m) => m.id === currentMembershipId) || null;
  const currentIdx = currentPlan ? memberships.findIndex((m) => m.id === currentPlan.id) : -1;
  const upgradePlan = currentIdx >= 0 && currentIdx < memberships.length - 1 ? memberships[currentIdx + 1] : null;

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-secondary" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div ref={headerRef} className="relative z-10 container mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full gradient-purple flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-2">
            {guest ? guest.name : "My Account"}
          </h1>
          {guest && (
            <p className="text-muted-foreground font-body text-sm">{guest.email}</p>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs defaultValue="visits" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-10">
              <TabsTrigger value="visits" className="font-body">Visits</TabsTrigger>
              <TabsTrigger value="membership" className="font-body">Membership</TabsTrigger>
            </TabsList>

            {/* ===== VISITS TAB ===== */}
            <TabsContent value="visits">
              {grouped.map(([monthKey, visits]) => {
                const totalMin = visits.reduce((sum, v) => sum + parseDuration(v.duration), 0);
                const hours = Math.floor(totalMin / 60);
                const mins = totalMin % 60;
                return (
                  <div key={monthKey} className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-2xl text-foreground">{formatMonthLabel(monthKey)}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground font-body">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {visits.length} visits
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {hours > 0 ? `${hours}h ` : ""}{mins > 0 ? `${mins}m` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {visits.map((v) => (
                        <div
                          key={v.id}
                          className="rounded-xl border border-border bg-card p-4 hover:border-primary/20 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-display text-lg text-foreground truncate">{v.className}</h4>
                                <Badge
                                  variant={v.type === "event" ? "default" : "secondary"}
                                  className={cn(
                                    "text-[10px] uppercase tracking-wider shrink-0",
                                    v.type === "event" && "gradient-purple text-primary-foreground border-0"
                                  )}
                                >
                                  {v.type}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground font-body">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(v.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {v.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {v.hall}
                                </span>
                                {v.instructor && (
                                  <span className="flex items-center gap-1">
                                    <UserIcon className="w-3 h-3" />
                                    {v.instructor}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            {/* ===== MEMBERSHIP TAB ===== */}
            <TabsContent value="membership">
              {/* Current Plan */}
              {currentPlan ? (
                <div className="mb-10">
                  <h3 className="font-display text-2xl mb-4">Your Current Plan</h3>
                  <div className="rounded-2xl border-2 border-primary bg-card p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-primary" />
                        <span className="text-xs text-primary font-semibold uppercase tracking-wider font-body">Active Plan</span>
                      </div>
                      <h4 className="font-display text-3xl text-foreground mb-1">{currentPlan.name}</h4>
                      <p className="text-primary font-display text-2xl mb-4">
                        {currentPlan.price} <span className="text-muted-foreground text-sm font-body">/ {currentPlan.period}</span>
                      </p>
                      <ul className="space-y-2">
                        {currentPlan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm font-body text-foreground">
                            <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-10 text-center py-8">
                  <p className="text-muted-foreground font-body mb-2">You don't have an active membership yet.</p>
                  <p className="text-sm text-muted-foreground font-body">Choose a plan below to get started!</p>
                </div>
              )}

              {/* Upgrade / Upsell */}
              {upgradePlan && (
                <div className="mb-10">
                  <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-accent/10 p-8 relative overflow-hidden">
                    <div className="absolute top-3 right-3">
                      <Badge className="gradient-purple text-primary-foreground border-0 gap-1">
                        <Sparkles className="w-3 h-3" /> Recommended Upgrade
                      </Badge>
                    </div>
                    <h4 className="font-display text-2xl text-foreground mb-1">{upgradePlan.name}</h4>
                    <p className="text-primary font-display text-xl mb-4">
                      {upgradePlan.price} <span className="text-muted-foreground text-sm font-body">/ {upgradePlan.period}</span>
                    </p>
                    <ul className="space-y-2 mb-6">
                      {upgradePlan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm font-body text-foreground">
                          <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className="gradient-purple text-primary-foreground border-0 hover:opacity-90">
                      <ArrowUpRight className="w-4 h-4 mr-1" /> Upgrade to {upgradePlan.name}
                    </Button>
                  </div>
                </div>
              )}

              {/* All Plans */}
              <Separator className="my-8" />
              <h3 className="font-display text-2xl mb-6">All Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {memberships.map((plan) => {
                  const isActive = plan.id === currentMembershipId;
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "rounded-xl border bg-card p-6 transition-all relative",
                        isActive ? "border-primary shadow-lg shadow-primary/10" : "border-border hover:border-primary/20"
                      )}
                    >
                      {plan.badge && (
                        <Badge className="absolute -top-2.5 left-4 gradient-purple text-primary-foreground border-0 text-[10px]">
                          {plan.badge}
                        </Badge>
                      )}
                      {isActive && (
                        <Badge variant="outline" className="absolute -top-2.5 right-4 border-primary text-primary text-[10px]">
                          Current
                        </Badge>
                      )}
                      <h4 className="font-display text-xl mt-2 mb-1">{plan.name}</h4>
                      <p className="text-primary font-display text-2xl mb-4">
                        {plan.price} <span className="text-muted-foreground text-xs font-body">/ {plan.period}</span>
                      </p>
                      <ul className="space-y-1.5 mb-5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-xs font-body text-muted-foreground">
                            <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isActive ? (
                        <Button variant="outline" className="w-full border-primary text-primary" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                          <Link href="/contact">Choose Plan</Link>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default UserPanel;
