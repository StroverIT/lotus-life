"use client";

import { Crown, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Membership } from "@/types/catalog";

type AdminMembershipsTabProps = {
  membershipPlans: Membership[];
  onAddPlan: () => void;
  onDelete: (id: string) => void;
};

const AdminMembershipsTab = ({ membershipPlans, onAddPlan, onDelete }: AdminMembershipsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl">Membership Plans</h3>
        <Button variant="outline" size="sm" onClick={onAddPlan}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Plan
        </Button>
      </div>
      <div className="grid gap-4">
        {membershipPlans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display text-xl">{plan.name}</h4>
                  {plan.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-primary font-display text-lg font-semibold mb-2">
                  {plan.price}{" "}
                  <span className="text-muted-foreground text-sm font-body font-normal">/ {plan.period}</span>
                </p>
                <ul className="text-muted-foreground text-sm font-body space-y-1">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                  {plan.features.length > 3 && (
                    <li className="text-xs">+{plan.features.length - 3} more features</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDelete(plan.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMembershipsTab;
