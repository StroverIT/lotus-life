"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageFirstVisit } from "@/context/PageAnimationContext";
import { useMembershipsAnimations } from "@/hooks/useMembershipsAnimations";
import { MembershipSignupDialog } from "@/components/MembershipSignupDialog";
import { MembershipPlanCards } from "@/components/MembershipPlanCards";
import type { Membership } from "@/types/catalog";

const singleClassPrice = "€10";

type UserMembershipApplication = {
  id: string;
  membershipId: string;
  status: "PENDING" | "REJECTED" | "SUCCESSFUL";
};

const CATALOG_STALE_MS = 2 * 60 * 1000; // 2 minutes

const MembershipsPage = () => {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ["memberships"],
    queryFn: async () => {
      const res = await fetch("/api/memberships");
      const json = await res.json();
      return Array.isArray(json) ? (json as Membership[]) : [];
    },
    staleTime: CATALOG_STALE_MS,
  });

  const { data: userMemberships = [] } = useQuery({
    queryKey: ["user-memberships", (session?.user as { id?: string })?.id ?? session?.user?.email],
    queryFn: async () => {
      const res = await fetch("/api/user-memberships");
      const json = (await res.json()) as { applications?: UserMembershipApplication[] };
      return json.applications ?? [];
    },
    enabled: !!session?.user,
    staleTime: CATALOG_STALE_MS,
  });

  const shouldAnimate = usePageFirstVisit("memberships");
  const scope = useMembershipsAnimations(shouldAnimate);

  useEffect(() => {
    const t = setTimeout(() => setContentLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  const refetchUserMemberships = () => {
    queryClient.invalidateQueries({ queryKey: ["user-memberships"] });
  };

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
                <div className="pp-grid">
                  <MembershipPlanCards
                    plans={plans}
                    currentMembershipId={currentMembershipId}
                    rejectedPlanId={rejectedPlanId}
                    status={isPending ? "Pending" : isSuccessful ? "Active" : null}
                    layout="featured"
                    onSelectPlan={openSignup}
                  />
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
