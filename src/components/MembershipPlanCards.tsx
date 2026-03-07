"use client";

import Link from "next/link";
import {
  Check,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Membership } from "@/types/catalog";

export type MembershipPlanStatus = "Active" | "Pending" | "Rejected" | null;

export interface MembershipPlanCardsProps {
  plans: Membership[];
  currentMembershipId: string | null;
  rejectedPlanId?: string | null;
  status?: MembershipPlanStatus;
  /** "featured" = large cards (Memberships page), "compact" = smaller (UserPanel) */
  layout?: "featured" | "compact";
  /** When provided, render Button with onClick. Otherwise render Link to /memberships. */
  onSelectPlan?: (plan: Membership) => void;
  className?: string;
}

export function MembershipPlanCards({
  plans,
  currentMembershipId,
  rejectedPlanId = null,
  status = null,
  layout = "featured",
  onSelectPlan,
  className,
}: MembershipPlanCardsProps) {
  const currentIdx =
    currentMembershipId != null ? plans.findIndex((p) => p.id === currentMembershipId) : -1;
  const isFeatured = layout === "featured";

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6",
        isFeatured ? "max-w-5xl mx-auto" : "",
        className
      )}
    >
      {plans.map((plan, idx) => {
        const isCurrent = plan.id === currentMembershipId;
        const isRejectedPlan = plan.id === rejectedPlanId;
        const isDisplayPlan = isCurrent || isRejectedPlan;
        const isUpgrade = currentIdx >= 0 && idx > currentIdx;
        const isDowngrade = currentIdx >= 0 && idx < currentIdx;

        const currency = plan.price.replace(/\d/g, "").trim() || "€";
        const amount = Number(plan.price.replace(/[^\d]/g, ""));
        const displayStatus = isCurrent ? status : isRejectedPlan ? "Rejected" : null;

        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl p-8 border border-border bg-card",
              isFeatured && "pp-card",
              !isFeatured && "rounded-xl p-6 transition-all",
              isDisplayPlan && displayStatus === "Active" && "border-emerald-500 dark:border-emerald-600 shadow-lg shadow-emerald-500/10",
              isDisplayPlan && displayStatus === "Pending" &&
                (isFeatured
                  ? "border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
                  : "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10"),
              isDisplayPlan && displayStatus === "Rejected" &&
                (isFeatured
                  ? "border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                  : "border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10"),
              isFeatured &&
                !isDisplayPlan &&
                plan.highlighted &&
                "is-popular gradient-purple text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]",
              !isFeatured && !isDisplayPlan && "hover:border-primary/20",
            )}
          >
            {/* Badges */}
            {isCurrent && (
              <div className={isFeatured ? "absolute -top-3 left-1/2 -translate-x-1/2" : "absolute -top-2.5 right-4"}>
                {displayStatus === "Pending" ? (
                  <Badge className="gap-1.5 border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 text-xs font-body font-medium">
                    <Clock className={isFeatured ? "w-3.5 h-3.5" : "w-3 h-3"} />
                    Awaiting payment
                  </Badge>
                ) : displayStatus === "Active" ? (
                  <Badge className="gap-1.5 border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 text-xs font-body font-medium">
                    <CheckCircle className={isFeatured ? "w-3.5 h-3.5" : "w-3 h-3"} />
                    {isFeatured ? "Current plan" : "Current"}
                  </Badge>
                ) : null}
              </div>
            )}
            {isRejectedPlan && (
              <div className={isFeatured ? "absolute -top-3 left-1/2 -translate-x-1/2" : "absolute -top-2.5 right-4"}>
                <Badge className="gap-1.5 border-0 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 text-xs font-body font-medium">
                  <XCircle className={isFeatured ? "w-3.5 h-3.5" : "w-3 h-3"} />
                  {isFeatured ? "Request rejected" : "Rejected"}
                </Badge>
              </div>
            )}
            {isUpgrade && (
              <div className={isFeatured ? "absolute -top-3 left-1/2 -translate-x-1/2" : "absolute -top-2.5 right-4"}>
                <Badge className={cn("gap-1 gradient-purple text-primary-foreground border-0 text-xs font-body", !isFeatured && "text-[10px]")}>
                  <ArrowUpRight className="w-3 h-3" /> Upgrade
                </Badge>
              </div>
            )}
            {isDowngrade && (
              <div className={isFeatured ? "absolute -top-3 left-1/2 -translate-x-1/2" : "absolute -top-2.5 right-4"}>
                <Badge variant="secondary" className={cn("text-xs font-body gap-1", !isFeatured && "text-[10px]")}>
                  {isFeatured && <ArrowDownRight className="w-3 h-3" />}
                  Downgrade
                </Badge>
              </div>
            )}
            {plan.badge && !isDisplayPlan && !isUpgrade && !isDowngrade && (
              <div className={isFeatured ? "absolute -top-3 left-1/2 -translate-x-1/2" : "absolute -top-2.5 left-4"}>
                {isFeatured ? (
                  <span className="pp-badge flex items-center gap-1 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold font-body">
                    <Star className="w-3 h-3" /> {plan.badge}
                  </span>
                ) : (
                  <Badge className="gradient-purple text-primary-foreground border-0 text-[10px]">
                    {plan.badge}
                  </Badge>
                )}
              </div>
            )}

            {/* Title & price */}
            {isFeatured ? (
              <>
                <h3 className="pp-planName font-display text-2xl mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="font-display text-4xl font-semibold">
                    {currency}
                    <span className="pp-priceNum ml-1">{Number.isNaN(amount) ? plan.price : amount}</span>
                  </span>
                  <span
                    className={cn(
                      "pp-priceUnit text-sm font-body ml-1",
                      plan.highlighted && !isDisplayPlan ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
              </>
            ) : (
              <>
                <h4 className="font-display text-xl mt-2 mb-1">{plan.name}</h4>
                <p className="text-primary font-display text-2xl mb-4">
                  {plan.price} <span className="text-muted-foreground text-xs font-body">/ {plan.period}</span>
                </p>
              </>
            )}

            {/* Features */}
            <ul className={cn("flex-1 space-y-3 mb-8", !isFeatured && "space-y-1.5 mb-5")}>
              {plan.features.map((f) => (
                <li
                  key={f}
                  className={cn(
                    "flex items-start gap-2 font-body",
                    isFeatured ? "pp-perk text-sm" : "text-xs text-muted-foreground",
                  )}
                >
                  {isFeatured ? (
                    <Check
                      className={cn(
                        "w-4 h-4 shrink-0 mt-0.5",
                        plan.highlighted && !isDisplayPlan ? "text-accent" : "text-primary",
                      )}
                    />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      isFeatured && plan.highlighted && !isDisplayPlan
                        ? "text-primary-foreground/80"
                        : undefined
                    }
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            {/* Action */}
            {isDisplayPlan ? (
              displayStatus === "Pending" ? (
                <p
                  className={cn(
                    "text-center text-muted-foreground font-body py-2",
                    !isFeatured && "text-xs py-1",
                  )}
                >
                  Pay by cash at the studio — we&apos;ll confirm when received.
                </p>
              ) : displayStatus === "Rejected" ? (
                <p
                  className={cn(
                    "text-center text-muted-foreground font-body py-2",
                    !isFeatured && "text-xs py-1",
                  )}
                >
                  {isFeatured
                    ? "This request was not approved. You can choose another plan."
                    : "Request was not approved. You can choose another plan."}
                </p>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  disabled
                >
                  {isFeatured ? "Current plan" : "Current Plan"}
                </Button>
              )
            ) : onSelectPlan ? (
              <Button
                type="button"
                onClick={() => onSelectPlan(plan)}
                className={cn(
                  "w-full pp-cta",
                  plan.highlighted && !isUpgrade && !isDowngrade
                    ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    : "gradient-purple text-primary-foreground border-0 hover:opacity-90",
                  isUpgrade && "gradient-purple text-primary-foreground border-0 hover:opacity-90",
                  isDowngrade && "border-border bg-secondary hover:bg-secondary/80",
                )}
              >
                {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Get Started"}
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                <Link
                  href={
                    isUpgrade ? "/memberships?upgrade=1" : isDowngrade ? "/memberships?downgrade=1" : "/memberships"
                  }
                >
                  {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Choose Plan"}
                </Link>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
