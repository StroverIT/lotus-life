"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Clock, MapPin, User as UserIcon, Star, ChevronRight, ArrowUpRight, Sparkles, Filter, CheckCircle, XCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MembershipPlanCards } from "@/components/MembershipPlanCards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { fadeInUp } from "@/lib/animations";
import type { Membership } from "@/types/catalog";
import { useSession } from "next-auth/react";

type AccountVisit = {
  id: string;
  date: string;
  className: string;
  type: "CLASS" | "EVENT";
  duration: string;
  hall: string;
  instructor?: string | null;
};

type AccountResponse =
  | { kind: "guest"; membership: null; visits: AccountVisit[] }
  | {
      kind: "user";
      user: { id: string; name: string; email: string | null; image?: string | null } | null;
      membership: Membership | null;
      visits: AccountVisit[];
    };

type UserMembershipApplication = {
  id: string;
  membershipId: string;
  membershipName: string;
  membershipPrice: string;
  membershipPeriod: string;
  status: "PENDING" | "REJECTED" | "SUCCESSFUL";
  createdAt: string;
};

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function groupByMonth(visits: AccountVisit[]): Record<string, AccountVisit[]> {
  const groups: Record<string, AccountVisit[]> = {};
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
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [plans, setPlans] = useState<Membership[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembershipApplication[]>([]);
  const { data: session } = useSession();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    fadeInUp(
      headerRef.current,
      {
        y: 20,
        duration: 0.8,
      },
      prefersReducedMotion,
    );
  }, [prefersReducedMotion]);

  type VisitFilterType = "all" | "event" | "schedule";
  const [visitFilter, setVisitFilter] = useState<VisitFilterType>("all");
  const [monthFilter, setMonthFilter] = useState<string>("");

  const filteredVisits = useMemo(() => {
    let list = account?.visits ?? [];
    if (visitFilter === "event") list = list.filter((v) => v.type === "EVENT");
    else if (visitFilter === "schedule") list = list.filter((v) => v.type === "CLASS");
    if (monthFilter) {
      list = list.filter((v) => {
        const d = new Date(v.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === monthFilter;
      });
    }
    return list;
  }, [account?.visits, visitFilter, monthFilter]);

  const grouped = useMemo(() => {
    const g = groupByMonth(filteredVisits);
    return Object.entries(g).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredVisits]);

  const allMonthKeys = useMemo(() => {
    const g = groupByMonth(account?.visits ?? []);
    return Object.keys(g).sort((a, b) => b.localeCompare(a));
  }, [account?.visits]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [accountRes, plansRes] = await Promise.all([fetch("/api/account"), fetch("/api/memberships")]);
        const [accountJson, plansJson] = await Promise.all([accountRes.json(), plansRes.json()]);
        if (!alive) return;
        setAccount(accountJson as AccountResponse);
        setPlans(plansJson as Membership[]);
      } catch {
        if (!alive) return;
        setAccount({ kind: "guest", membership: null, visits: [] });
        setPlans([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (account?.kind !== "user") return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/user-memberships");
        const json = (await res.json()) as { applications?: UserMembershipApplication[] };
        if (!alive) return;
        setUserMemberships(json.applications ?? []);
      } catch {
        if (!alive) return;
        setUserMemberships([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [account?.kind]);

  // Display membership: User.membership (active) or latest SUCCESSFUL/PENDING UserMembership
  const accountMembershipId = account?.kind === "user" ? account.membership?.id ?? null : null;
  const latestApplication = userMemberships.find(
    (a) => a.status === "SUCCESSFUL" || a.status === "PENDING"
  );
  const latestApplicationAny = userMemberships[0];
  const applicationMembershipId = latestApplication?.membershipId ?? null;
  const applicationStatus = latestApplication?.status ?? null;

  const currentMembershipId = accountMembershipId ?? applicationMembershipId;
  const currentPlan = plans.find((m) => m.id === currentMembershipId) || null;
  const currentIdx = currentPlan ? plans.findIndex((m) => m.id === currentPlan.id) : -1;
  const upgradePlan = currentIdx >= 0 && currentIdx < plans.length - 1 ? plans[currentIdx + 1] : null;

  // Display plan/status for the top card (includes rejected)
  const displayPlan =
    accountMembershipId
      ? plans.find((m) => m.id === accountMembershipId) ?? null
      : latestApplicationAny
        ? plans.find((m) => m.id === latestApplicationAny.membershipId) ?? null
        : null;
  const displayStatus: "Active" | "Pending" | "Rejected" | null =
    accountMembershipId || latestApplicationAny?.status === "SUCCESSFUL"
      ? "Active"
      : latestApplicationAny?.status === "PENDING"
        ? "Pending"
        : latestApplicationAny?.status === "REJECTED"
          ? "Rejected"
          : null;

  const membershipStatusLabel = displayStatus;

  const sessionUser = session?.user;
  const displayName =
    (sessionUser?.name as string | undefined | null) ??
    (account?.kind === "user" ? account.user?.name ?? null : null);
  const displayEmail =
    (sessionUser?.email as string | undefined | null) ??
    (account?.kind === "user" ? account.user?.email ?? null : null);
  const displayImage =
    (sessionUser?.image as string | undefined | null) ??
    (account?.kind === "user" ? account.user?.image ?? null : null);

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-secondary" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <div ref={headerRef} className="relative z-10 container mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full gradient-purple flex items-center justify-center mx-auto mb-6 overflow-hidden">
            {displayImage ? (
              // User avatar when available
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayImage}
                alt={displayName ?? "Profile picture"}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-9 h-9 text-primary-foreground" />
            )}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-2">
            {displayName ? `Welcome, ${displayName}!` : "Welcome!"}
          </h1>
          {displayEmail && <p className="text-muted-foreground font-body text-sm">{displayEmail}</p>}
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
              {account && (account.visits?.length ?? 0) === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground font-body mb-2">You don't have any visits yet.</p>
                  <p className="text-sm text-muted-foreground font-body">
                    Book your first class or event to see it appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Yoga visit type tabs: All / Event bookings / Schedule bookings */}
                  <Tabs
                    value={visitFilter}
                    onValueChange={(v) => setVisitFilter(v as VisitFilterType)}
                    className="mb-6"
                  >
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="all" className="font-body">All</TabsTrigger>
                      <TabsTrigger value="event" className="font-body">Event bookings</TabsTrigger>
                      <TabsTrigger value="schedule" className="font-body">Schedule bookings</TabsTrigger>
                    </TabsList>

                    {/* Month filter */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                        <Filter className="w-4 h-4" />
                        <span>Filter by month</span>
                      </div>
                      <Select value={monthFilter || "all"} onValueChange={(v) => setMonthFilter(v === "all" ? "" : v)}>
                        <SelectTrigger className="w-[200px] font-body">
                          <SelectValue placeholder="All months" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="font-body">All months</SelectItem>
                          {allMonthKeys.map((key) => (
                            <SelectItem key={key} value={key} className="font-body">
                              {formatMonthLabel(key)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(visitFilter !== "all" || monthFilter) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground font-body"
                          onClick={() => {
                            setVisitFilter("all");
                            setMonthFilter("");
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>

                  </Tabs>

                  {filteredVisits.length === 0 ? (
                    <div className="text-center py-10 rounded-xl border border-dashed border-border">
                      <p className="text-muted-foreground font-body">
                        No {visitFilter === "all" ? "visits" : visitFilter === "event" ? "event bookings" : "schedule bookings"}
                        {monthFilter ? ` in ${formatMonthLabel(monthFilter)}` : ""}.
                      </p>
                    </div>
                  ) : (
                    grouped.map(([monthKey, visits]) => {
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
                                {visits.length} {visits.length === 1 ? "visit" : "visits"}
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
                                        variant={v.type === "EVENT" ? "default" : "secondary"}
                                        className={cn(
                                          "text-[10px] uppercase tracking-wider shrink-0",
                                          v.type === "EVENT" && "gradient-purple text-primary-foreground border-0"
                                        )}
                                      >
                                        {v.type === "EVENT" ? "Event" : "Class"}
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
                    })
                  )}
                </>
              )}
            </TabsContent>

            {/* ===== MEMBERSHIP TAB ===== */}
            <TabsContent value="membership">
              {/* Current Plan (including pending and rejected) */}
              {displayPlan ? (
                <div className="mb-10">
                  <h3 className="font-display text-2xl mb-4">
                    Your {membershipStatusLabel === "Pending" ? "Requested" : membershipStatusLabel === "Rejected" ? "Request" : "Current"} Plan
                  </h3>
                  <div
                    className={cn(
                      "rounded-2xl p-8 relative overflow-hidden",
                      membershipStatusLabel === "Pending" &&
                        "border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20",
                      membershipStatusLabel === "Active" && "border-2 border-emerald-500 dark:border-emerald-600 bg-card",
                      membershipStatusLabel === "Rejected" &&
                        "border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20",
                    )}
                  >
                    {membershipStatusLabel === "Active" && (
                      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl" />
                    )}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        {membershipStatusLabel === "Pending" ? (
                          <>
                            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold uppercase tracking-wider font-body">
                              Awaiting payment
                            </span>
                          </>
                        ) : membershipStatusLabel === "Rejected" ? (
                          <>
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <span className="text-xs text-red-700 dark:text-red-300 font-semibold uppercase tracking-wider font-body">
                              Request rejected
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider font-body">
                              Active Plan
                            </span>
                          </>
                        )}
                      </div>
                      <h4 className="font-display text-3xl text-foreground mb-1">{displayPlan.name}</h4>
                      <p className="text-primary font-display text-2xl mb-4">
                        {displayPlan.price} <span className="text-muted-foreground text-sm font-body">/ {displayPlan.period}</span>
                      </p>
                      <ul className="space-y-2">
                        {displayPlan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm font-body text-foreground">
                            <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {membershipStatusLabel === "Pending" && (
                        <p className="mt-4 text-sm text-muted-foreground font-body">
                          Pay by cash at the studio — we&apos;ll confirm when received.
                        </p>
                      )}
                      {membershipStatusLabel === "Rejected" && (
                        <p className="mt-4 text-sm text-muted-foreground font-body">
                          This request was not approved. You can choose another plan below.
                        </p>
                      )}
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
              <MembershipPlanCards
                plans={plans}
                currentMembershipId={currentMembershipId}
                rejectedPlanId={userMemberships.find((a) => a.status === "REJECTED")?.membershipId ?? null}
                status={membershipStatusLabel}
                layout="compact"
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default UserPanel;
