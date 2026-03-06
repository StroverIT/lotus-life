import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface EventSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventDay?: string;
  eventTime?: string;
}

const EventSignupDialog = ({ open, onOpenChange, eventName, eventDay, eventTime }: EventSignupDialogProps) => {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [busy, setBusy] = useState(false);
  const [authed, setAuthed] = useState(false);

  const detail = [eventDay, eventTime].filter(Boolean).join(" at ");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();
        if (!alive) return;
        setAuthed(!!json?.user);
      } catch {
        if (!alive) return;
        setAuthed(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !authed) return;
    toast({
      title: "You're signed up!",
      description: `You've been registered for ${eventName}${detail ? ` on ${detail}` : ""}.`,
    });
    onOpenChange(false);
  }, [open, authed, eventName, detail, onOpenChange]);

  const handleOAuth = async (provider: "google" | "facebook") => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent("/yoga")}`,
        },
      });
      if (error) throw error;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Please try again.";
      toast({ title: "Sign-in failed", description: message });
      setBusy(false);
    }
  };

  const handleGuest = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      setAuthed(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Please try again.";
      toast({ title: "Guest sign-in failed", description: message });
    } finally {
      setBusy(false);
    }
  };

  if (authed) return null;

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
};

export default EventSignupDialog;
