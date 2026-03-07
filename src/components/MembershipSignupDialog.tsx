"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthOptions } from "@/components/ui/auth-options";
import { Button } from "@/components/ui/button";
import { MODAL_IDS } from "@/constants/modalIds";
import { toast } from "@/components/ui/sonner";
import type { Membership } from "@/types/catalog";

const STORAGE_KEY = "openModalOnReturn";

export interface MembershipSignupDraftData {
  membershipId?: string;
  membershipName?: string;
}

interface MembershipSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Membership | null;
}

export function MembershipSignupDialog({
  open,
  onOpenChange,
  plan,
}: MembershipSignupDialogProps) {
  const { data: session } = useSession();
  const [creating, setCreating] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [guestFormResetKey, setGuestFormResetKey] = useState(0);

  const getData = useCallback((): MembershipSignupDraftData => {
    const data: MembershipSignupDraftData = {
      membershipId: plan?.id,
      membershipName: plan?.name,
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ modalId: MODAL_IDS.MEMBERSHIP_SIGNUP, data })
      );
    }
    return data;
  }, [plan?.id, plan?.name]);

  const submitMembershipRequest = useCallback(
    async (guestData?: { name: string; email: string; phone: string }) => {
      if (!plan?.id) return false;
      const body: { membershipId: string; guestName?: string; guestEmail?: string; guestPhone?: string } = {
        membershipId: plan.id,
      };
      if (guestData) {
        body.guestName = guestData.name;
        body.guestEmail = guestData.email;
        body.guestPhone = guestData.phone;
      }
      const res = await fetch("/api/user-memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        toast.error(
          "Request failed",
          json.error === "guest_name_email_phone_required"
            ? { description: "Please enter your name, email and phone." }
            : { description: json.error ?? "Please try again." }
        );
        return false;
      }
      return true;
    },
    [plan?.id]
  );

  const handleUserConfirm = async () => {
    if (!plan) return;
    setCreating(true);
    try {
      const ok = await submitMembershipRequest();
      if (ok) {
        toast.success("Membership request sent", {
          description: `Your request for ${plan.name} has been received. Payment is by cash only—we'll contact you to confirm.`,
        });
        onOpenChange(false);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleGuestSubmit = useCallback(
    async (data: { name: string; email: string; phone: string }) => {
      if (!plan?.id) {
        toast.error("Error", { description: "Please select a plan first." });
        return;
      }
      setGuestBusy(true);
      try {
        const ok = await submitMembershipRequest(data);
        if (ok) {
          toast.success("Membership request sent", {
            description: `Your request for ${plan.name} has been received. Payment is by cash only—we'll contact you to confirm.`,
          });
          setGuestFormResetKey((k) => k + 1);
          onOpenChange(false);
        }
      } finally {
        setGuestBusy(false);
      }
    },
    [plan?.id, plan?.name, submitMembershipRequest, onOpenChange]
  );

  if (session?.user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Request membership</DialogTitle>
            <DialogDescription className="font-body">
              {plan ? (
                <>
                  Request <span className="font-semibold text-foreground">{plan.name}</span>.
                  Payment is by <span className="font-semibold text-foreground">cash only</span>—we&apos;ll confirm once received.
                </>
              ) : (
                "Select a plan from the options below, then open this dialog again."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90 font-body"
              onClick={handleUserConfirm}
              disabled={creating || !plan}
            >
              {creating ? "Sending…" : "Confirm request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Request membership</DialogTitle>
          <DialogDescription className="font-body">
            {plan ? (
              <>
                Sign in or enter your details to request{" "}
                <span className="font-semibold text-foreground">{plan.name}</span>. Payment is by{" "}
                <span className="font-semibold text-foreground">cash only</span>.
              </>
            ) : (
              "Select a plan from the options below, then click Get Started to request it."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <AuthOptions
            onGuestSubmit={handleGuestSubmit}
            busy={guestBusy}
            resetSignal={guestFormResetKey}
            redirect={true}
            callbackUrl="/memberships"
            modalId={MODAL_IDS.MEMBERSHIP_SIGNUP}
            onBeforeOAuthRedirect={getData}
            title="Sign in or enter your details"
            description="Continue with Google or Facebook, or enter your details below to request this membership."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
