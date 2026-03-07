import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { addYogaGuestSignup, MODAL_IDS } from "@/constants/modalIds";
import { AuthOptions } from "@/components/ui/auth-options";
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
  const [creating, setCreating] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [guestFormResetKey, setGuestFormResetKey] = useState(0);

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

  const handleUserConfirm = useCallback(async () => {
    if (!yogaClassId && !yogaEventId) {
      toast({ title: "Choose a class or event", description: "Select a class or event below to reserve your spot." });
      return;
    }
    setCreating(true);
    try {
      if (yogaClassId) {
        const res = await fetch("/api/schedule-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ yogaClassId }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          if (res.status === 409) {
            toast({ title: "Already signed up", description: "You're already registered for this class." });
          } else if (res.status === 401) {
            toast({ title: "Sign in required", description: "Please sign in with Google or Facebook to reserve your spot." });
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
        if (!res.ok || !data.ok) {
          if (res.status === 409) {
            toast({ title: "Already signed up", description: "You're already registered for this event." });
          } else if (res.status === 401) {
            toast({ title: "Sign in required", description: "Please sign in with Google or Facebook to reserve your spot." });
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
      toast({ title: "Booking failed", description: "Please try again." });
      onOpenChange(false);
    } finally {
      setCreating(false);
    }
  }, [yogaClassId, yogaEventId, eventName, detail, onOpenChange]);

  const handleGuestSubmit = useCallback(
    async (data: { name: string; email: string; phone: string }) => {
      if (!yogaClassId && !yogaEventId) {
        toast({ title: "Error", description: "Please choose a class or event to reserve." });
        return;
      }
      setGuestBusy(true);
      try {
        if (yogaClassId) {
          const res = await fetch("/api/schedule-bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              yogaClassId,
              guestName: data.name,
              guestEmail: data.email,
              guestPhone: data.phone,
            }),
          });
          const json = (await res.json()) as { ok?: boolean; error?: string };
          if (!res.ok || !json.ok) {
            if (res.status === 409) {
              toast({ title: "Already signed up", description: "You're already registered for this class." });
            } else {
              toast({ title: "Booking failed", description: json.error ?? "Please try again." });
            }
            return;
          }
        } else if (yogaEventId) {
          const res = await fetch("/api/event-bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              yogaEventId,
              guestName: data.name,
              guestEmail: data.email,
              guestPhone: data.phone,
            }),
          });
          const json = (await res.json()) as { ok?: boolean; error?: string };
          if (!res.ok || !json.ok) {
            if (res.status === 409) {
              toast({ title: "Already signed up", description: "You're already registered for this event." });
            } else {
              toast({ title: "Booking failed", description: json.error ?? "Please try again." });
            }
            return;
          }
        }
        addYogaGuestSignup(yogaClassId, yogaEventId);
        toast({
          title: "You're signed up!",
          description: `You've been registered for ${eventName}${eventDay || eventTime ? ` on ${[eventDay, eventTime].filter(Boolean).join(" at ")}` : ""}.`,
        });
        setGuestFormResetKey((k) => k + 1);
        onOpenChange(false);
      } catch {
        toast({ title: "Booking failed", description: "Please try again." });
      } finally {
        setGuestBusy(false);
      }
    },
    [yogaClassId, yogaEventId, eventName, eventDay, eventTime, onOpenChange]
  );

  if (session?.user) {
    const hasSelection = !!(yogaClassId || yogaEventId);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Sign Up</DialogTitle>
            <DialogDescription className="font-body">
              {hasSelection ? (
                <>
                  Reserve your spot for <span className="font-semibold text-foreground">{eventName}</span>
                  {eventDay && <> on <span className="font-semibold text-foreground">{eventDay}</span></>}
                  {eventTime && <> at <span className="font-semibold text-foreground">{eventTime}</span></>}
                </>
              ) : (
                "Choose a class or event below to reserve your spot."
              )}
            </DialogDescription>
          </DialogHeader>
          {hasSelection && (
            <div className="mt-4">
              <Button
                className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90 font-body"
                onClick={handleUserConfirm}
                disabled={creating}
              >
                {creating ? "Confirming…" : "Confirm booking"}
              </Button>
            </div>
          )}
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

        <div className="mt-2">
          <AuthOptions
            onGuestSubmit={handleGuestSubmit}
            busy={guestBusy}
            resetSignal={guestFormResetKey}
            redirect={true}
            callbackUrl="/yoga"
            modalId={MODAL_IDS.EVENT_SIGNUP}
            onBeforeOAuthRedirect={getData}
            title="Sign in or enter your details"
            description="Continue with Google or Facebook, or enter your details below to reserve your spot."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default EventSignupDialog;
