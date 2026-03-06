import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MODAL_IDS } from "@/constants/modalIds";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "openModalOnReturn";

export interface EventSignupDraftData {
  eventName: string;
  eventDay?: string;
  eventTime?: string;
  yogaClassId?: string;
  yogaEventId?: string;
}

export interface EventSignupDialogHandle {
  openTheModal: () => void;
  getData: () => EventSignupDraftData;
}

interface EventSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventDay?: string;
  eventTime?: string;
  yogaClassId?: string;
  yogaEventId?: string;
}

const EventSignupDialog = forwardRef<EventSignupDialogHandle, EventSignupDialogProps>(
  function EventSignupDialog({ open, onOpenChange, eventName, eventDay, eventTime, yogaClassId, yogaEventId }, ref) {
  const { data: session } = useSession();
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  const detail = [eventDay, eventTime].filter(Boolean).join(" at ");

  const getData = useCallback((): EventSignupDraftData => {
    const data: EventSignupDraftData = { eventName, eventDay, eventTime, yogaClassId, yogaEventId };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ modalId: MODAL_IDS.EVENT_SIGNUP, data })
      );
    }
    return data;
  }, [eventName, eventDay, eventTime, yogaClassId, yogaEventId]);

  useImperativeHandle(
    ref,
    () => ({
      openTheModal: () => onOpenChange(true),
      getData,
    }),
    [onOpenChange, getData]
  );

  useEffect(() => {
    if (!open || !session?.user) return;
    if (!yogaClassId && !yogaEventId) {
      toast({
        title: "You're signed up!",
        description: `You've been registered for ${eventName}${detail ? ` on ${detail}` : ""}.`,
      });
      onOpenChange(false);
      return;
    }
    let alive = true;
    setCreating(true);
    (async () => {
      try {
        if (yogaClassId) {
          const res = await fetch("/api/schedule-bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ yogaClassId }),
          });
          const data = (await res.json()) as { ok?: boolean; error?: string };
          if (!alive) return;
          if (!res.ok || !data.ok) {
            if (res.status === 409) {
              toast({ title: "Already signed up", description: "You're already registered for this class." });
            } else {
              toast({ title: "Booking failed", description: data.error ?? "Please try again." });
            }
            onOpenChange(false);
            return;
          }
        }
        if (yogaEventId) {
          const res = await fetch("/api/event-bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ yogaEventId }),
          });
          const data = (await res.json()) as { ok?: boolean; error?: string };
          if (!alive) return;
          if (!res.ok || !data.ok) {
            if (res.status === 409) {
              toast({ title: "Already signed up", description: "You're already registered for this event." });
            } else {
              toast({ title: "Booking failed", description: data.error ?? "Please try again." });
            }
            onOpenChange(false);
            return;
          }
        }
        toast({
          title: "You're signed up!",
          description: `You've been registered for ${eventName}${detail ? ` on ${detail}` : ""}.`,
        });
        onOpenChange(false);
      } catch {
        if (!alive) return;
        toast({ title: "Booking failed", description: "Please try again." });
        onOpenChange(false);
      } finally {
        if (alive) setCreating(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, session?.user, eventName, detail, onOpenChange, yogaClassId, yogaEventId]);

  const handleOAuth = async (provider: "google" | "facebook") => {
    setBusy(true);
    try {
      getData();
      const res = await signIn(provider, {
        callbackUrl: "/yoga",
        redirect: true,
      });
      if ((res as any)?.error) throw new Error((res as any).error);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Please try again.";
      toast({ title: "Sign-in failed", description: message });
      setBusy(false);
    }
  };

  const handleGuest = async () => {
    setBusy(true);
    try {
      const res = await signIn("guest", {
        callbackUrl: "/yoga",
        redirect: true,
      });
      if ((res as any)?.error) throw new Error((res as any).error);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Please try again.";
      toast({ title: "Guest sign-in failed", description: message });
    } finally {
      setBusy(false);
    }
  };

  if (session?.user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Sign Up</DialogTitle>
            <DialogDescription className="font-body">
              {(yogaClassId || yogaEventId) && creating
                ? "Confirming your spot…"
                : "Reserve your spot for "}
              {!(yogaClassId || yogaEventId) || !creating ? (
                <>
                  <span className="font-semibold text-foreground">{eventName}</span>
                  {eventDay && <> on <span className="font-semibold text-foreground">{eventDay}</span></>}
                  {eventTime && <> at <span className="font-semibold text-foreground">{eventTime}</span></>}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Sign Up</DialogTitle>
          <DialogDescription className="font-body">
            Reserve your spot for <span className="font-semibold text-foreground">{eventName}</span>
            {eventDay && <> on <span className="font-semibold text-foreground">{eventDay}</span></>}
            {eventTime && <> at <span className="font-semibold text-foreground">{eventTime}</span></>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <Button variant="outline" className="w-full gap-2 font-body" onClick={() => handleOAuth("facebook")} disabled={busy}>
            Continue with Facebook
          </Button>
          <Button variant="outline" className="w-full gap-2 font-body" onClick={() => handleOAuth("google")} disabled={busy}>
            Continue with Google
          </Button>
        </div>

        <div className="relative my-4">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-body">
            or continue as guest
          </span>
        </div>

        <Button
          type="button"
          className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90 font-body"
          onClick={handleGuest}
          disabled={busy}
        >
          Reserve My Spot
        </Button>
      </DialogContent>
    </Dialog>
  );
});

export default EventSignupDialog;
