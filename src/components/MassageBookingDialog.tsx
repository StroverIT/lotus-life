import { useEffect, useMemo, useState } from "react";
import { Clock, Calendar, ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Massage } from "@/types/catalog";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { toast } from "@/components/ui/sonner";

const WHATSAPP_URL = "https://wa.me/359883317785";

const MASSAGE_TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

interface Props {
  massage: Massage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MassageBookingDialog = ({ massage, open, onOpenChange }: Props) => {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [step, setStep] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [duration, setDuration] = useState<"30" | "60" | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const reset = () => {
    setStep(1);
    setAuthChecked(false);
    setAuthed(false);
    setAuthBusy(false);
    setDuration(null);
    setDay(null);
    setTime(null);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me");
        const json = await res.json();
        if (!alive) return;
        const isAuthed = !!json?.user;
        setAuthed(isAuthed);
        setAuthChecked(true);
        if (!isAuthed) setStep(0);
      } catch {
        if (!alive) return;
        setAuthed(false);
        setAuthChecked(true);
        setStep(0);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open]);

  const continueAsGuest = async () => {
    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      setAuthed(true);
      setStep(1);
      toast.success("Signed in as guest");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Guest sign-in failed";
      toast.error(message);
    } finally {
      setAuthBusy(false);
    }
  };

  if (!massage) return null;

  const price = duration === "30" ? massage.price30 : massage.price60;

  const whatsappText = `Hi! I'd like to book a ${massage.name} (${duration} min, ${price}) on ${day} at ${time}`;
  const whatsappLink = `${WHATSAPP_URL}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{massage.name}</DialogTitle>
        </DialogHeader>

        {!authChecked ? (
          <div className="py-6 text-center text-sm text-muted-foreground font-body">
            Checking sign-in…
          </div>
        ) : !authed ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">
              To book, please sign in. Guests can book massage sessions.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                className="gradient-purple text-primary-foreground border-0 hover:opacity-90"
                type="button"
                onClick={continueAsGuest}
                disabled={authBusy}
              >
                Continue as guest
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => (window.location.href = `/login?redirect=${encodeURIComponent("/massage")}`)}
                disabled={authBusy}
              >
                Login / Register
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    s <= step ? "gradient-purple" : "bg-muted"
                  )}
                />
              ))}
            </div>

        {/* Step 1: Duration */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">Choose your session duration</p>
            <div className="grid grid-cols-2 gap-3">
              {(["30", "60"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDuration(d); setStep(2); }}
                  className={cn(
                    "rounded-xl border-2 p-6 text-center transition-all hover:border-primary/50",
                    duration === d ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="font-display text-xl font-semibold">{d} min</p>
                  <p className="text-primary font-display text-lg mt-1">
                    {d === "30" ? massage.price30 : massage.price60}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Day */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">Choose a day</p>
            <div className="grid grid-cols-3 gap-3">
              {massage.availableDays.map((d) => (
                <button
                  key={d}
                  onClick={() => { setDay(d); setStep(3); }}
                  className={cn(
                    "rounded-xl border-2 p-4 text-center transition-all hover:border-primary/50",
                    day === d ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <p className="font-body text-sm font-medium">{d}</p>
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="mt-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        )}

        {/* Step 3: Time */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">Choose a time slot</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {MASSAGE_TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTime(t); setStep(4); }}
                  className={cn(
                    "rounded-lg border-2 py-3 px-2 text-center text-sm font-body font-medium transition-all hover:border-primary/50",
                    time === t ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="mt-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        )}

        {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="space-y-4">
            <div className="rounded-xl bg-secondary p-5 space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Treatment</span>
                <span className="font-medium">{massage.name}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Day</span>
                <span className="font-medium">{day}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{time}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Price</span>
                <span className="font-display text-xl font-semibold text-primary">{price}</span>
              </div>
            </div>

            <Button asChild className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" /> Confirm via WhatsApp
              </a>
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MassageBookingDialog;
