import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Clock, ArrowLeft, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { AuthOptions } from "@/components/ui/auth-options";
import { cn } from "@/lib/utils";
import type { Massage } from "@/types/catalog";
import { MODAL_IDS } from "@/constants/modalIds";
import { toast } from "@/components/ui/sonner";
import { addDays, addMonths, format, getDay, startOfDay } from "date-fns";

const STORAGE_KEY = "openModalOnReturn";

const MASSAGE_TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

export interface MassageBookingDraftData {
  step?: number;
  massageId?: string;
  duration?: "30" | "60";
  day?: string;
  time?: string;
}

interface DraftState {
  step: number;
  authChecked: boolean;
  duration: "30" | "60" | null;
  day: Date | null;
  time: string | null;
  confirmBusy: boolean;
  guestFormResetKey: number;
}

const INITIAL_DRAFT: DraftState = {
  step: 1,
  authChecked: false,
  duration: null,
  day: null,
  time: null,
  confirmBusy: false,
  guestFormResetKey: 0,
};

export interface MassageBookingDialogHandle {
  openTheModal: () => void;
  getData: () => MassageBookingDraftData;
  setData: (data: MassageBookingDraftData) => void;
}

interface Props {
  massage: Massage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MassageBookingDialog = forwardRef<MassageBookingDialogHandle, Props>(
  function MassageBookingDialog({ massage, open, onOpenChange }, ref) {
  const { data: session, status } = useSession();
  const [draft, setDraft] = useState<DraftState>(INITIAL_DRAFT);
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());

  const { step, authChecked, duration, day, time, confirmBusy, guestFormResetKey } = draft;

  const todayStart = useMemo(() => startOfDay(new Date()), []);
  const tomorrowStart = useMemo(() => addDays(todayStart, 1), [todayStart]);

  const weekdayNamesToNumber: Record<string, number> = useMemo(
    () => ({
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    }),
    []
  );

  const allowedWeekdayNumbers = useMemo(
    () =>
      new Set(
        (massage?.availableDays ?? []).map((d) => weekdayNamesToNumber[d] ?? -1).filter((n) => n >= 0)
      ),
    [massage?.availableDays, weekdayNamesToNumber]
  );

  const reset = () => setDraft(INITIAL_DRAFT);

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const getData = useCallback((): MassageBookingDraftData => {
    const data: MassageBookingDraftData = {
      step: draft.step,
      massageId: massage?.id,
      duration: draft.duration ?? undefined,
      day: draft.day ? format(draft.day, "yyyy-MM-dd") : undefined,
      time: draft.time ?? undefined,
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ modalId: MODAL_IDS.MASSAGE_BOOKING, data })
      );
    }
    return data;
  }, [draft.step, draft.duration, draft.day, draft.time, massage?.id]);

  const setData = useCallback((d: MassageBookingDraftData) => {
    setDraft((prev) => ({
      ...prev,
      ...(d.step != null && d.step >= 1 && d.step <= 4 && { step: d.step }),
      ...(d.duration === "30" || d.duration === "60" ? { duration: d.duration } : {}),
      ...(d.day ? { day: new Date(d.day) } : {}),
      ...(d.time ? { time: d.time } : {}),
    }));
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      openTheModal: () => onOpenChange(true),
      getData,
      setData,
    }),
    [onOpenChange, getData, setData]
  );

  useEffect(() => {
    if (!open) return;
    if (status === "loading") {
      setDraft((prev) => ({ ...prev, authChecked: false }));
      return;
    }
    setDraft((prev) => ({ ...prev, authChecked: true }));
  }, [open, status]);

  useEffect(() => {
    if (!open) return;
    const from = format(tomorrowStart, "yyyy-MM-dd");
    const to = format(addMonths(tomorrowStart, 3), "yyyy-MM-dd");
    fetch(`/api/massage-bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((res) => res.json())
      .then((data: { taken?: Array<{ date: string; time: string }> }) => {
        const set = new Set<string>();
        for (const { date: d, time: t } of data.taken ?? []) {
          set.add(`${d}_${t}`);
        }
        setTakenSlots(set);
      })
      .catch(() => setTakenSlots(new Set()));
  }, [open, tomorrowStart]);

  if (!massage) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Massage booking</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground font-body py-4">
            Please select a massage from the list below.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  const price = duration === "30" ? massage.price30 : massage.price60;

  const isDayDisabled = (date: Date) => {
    const dateStart = startOfDay(date);
    if (dateStart < tomorrowStart) return true;
    if (allowedWeekdayNumbers.size > 0 && !allowedWeekdayNumbers.has(getDay(date))) return true;
    const dateStr = format(date, "yyyy-MM-dd");
    const takenCount = MASSAGE_TIME_SLOTS.filter((t) => takenSlots.has(`${dateStr}_${t}`)).length;
    if (takenCount === MASSAGE_TIME_SLOTS.length) return true;
    return false;
  };

  const dayLabel = day ? format(day, "EEEE, MMM d") : "";

  const handleConfirm = async () => {
    if (!day || !time || !duration) return;
    setDraft((prev) => ({ ...prev, confirmBusy: true }));
    try {
      const res = await fetch("/api/massage-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          massageId: massage.id,
          date: format(day, "yyyy-MM-dd"),
          time,
          duration: duration === "30" ? 30 : 60,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Booking failed");
      }
      toast.success("Booking confirmed");
      reset();
      onOpenChange(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Booking failed";
      toast.error(message);
    } finally {
      setDraft((prev) => ({ ...prev, confirmBusy: false }));
    }
  };

  const handleConfirmAsGuest = async (guestData: { name: string; email: string; phone: string }) => {
    if (!day || !time || !duration) return;
    setDraft((prev) => ({ ...prev, confirmBusy: true }));
    try {
      const res = await fetch("/api/massage-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          massageId: massage.id,
          date: format(day, "yyyy-MM-dd"),
          time,
          duration: duration === "30" ? 30 : 60,
          guestName: guestData.name,
          guestEmail: guestData.email,
          guestPhone: guestData.phone,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Booking failed");
      }
      toast.success("Booking confirmed");
      reset();
      setDraft((prev) => ({ ...prev, guestFormResetKey: prev.guestFormResetKey + 1 }));
      onOpenChange(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Booking failed";
      toast.error(message);
    } finally {
      setDraft((prev) => ({ ...prev, confirmBusy: false }));
    }
  };

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
                      onClick={() => setDraft((prev) => ({ ...prev, duration: d, step: 2 }))}
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

            {/* Step 2: Day — calendar, today and past disabled */}
            {step === 2 && (
              <div className="space-y-4 flex flex-col items-center">
                <p className="text-sm text-muted-foreground font-body w-full text-center">Choose a day</p>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={day ?? undefined}
                    onSelect={(date) => {
                      if (date) setDraft((prev) => ({ ...prev, day: date, step: 3 }));
                    }}
                    disabled={isDayDisabled}
                    defaultMonth={tomorrowStart}
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setDraft((prev) => ({ ...prev, step: 1 }))} className="mt-2 self-start">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </div>
            )}

            {/* Step 3: Time */}
            {step === 3 && day && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-body">Choose a time slot</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {MASSAGE_TIME_SLOTS.map((t) => {
                    const slotKey = `${format(day, "yyyy-MM-dd")}_${t}`;
                    const isTaken = takenSlots.has(slotKey);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={isTaken}
                        onClick={() => {
                          if (!isTaken) setDraft((prev) => ({ ...prev, time: t, step: 4 }));
                        }}
                        className={cn(
                          "rounded-lg border-2 py-3 px-2 text-center text-sm font-body font-medium transition-all hover:border-primary/50",
                          time === t ? "border-primary bg-primary/5" : "border-border",
                          isTaken && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setDraft((prev) => ({ ...prev, step: 2 }))} className="mt-2">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </div>
            )}

            {/* Step 4: Confirmation (if account) or sign in (Google, Facebook, guest) */}
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
                    <span className="font-medium">{dayLabel}</span>
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

                {session?.user ? (
                  <>
                    <Button
                      className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90"
                      onClick={handleConfirm}
                      disabled={confirmBusy}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Confirm booking
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDraft((prev) => ({ ...prev, step: 3 }))} disabled={confirmBusy}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  </>
                ) : (
                  <>
                    <AuthOptions
                      onGuestSubmit={handleConfirmAsGuest}
                      busy={confirmBusy}
                      resetSignal={guestFormResetKey}
                      redirect={true}
                      callbackUrl="/massage"
                      modalId={MODAL_IDS.MASSAGE_BOOKING}
                      onBeforeOAuthRedirect={getData}
                      title="Sign in or enter your details"
                      description="Continue with Google or Facebook, or enter your details below to confirm your booking."
                    />
                    <Button variant="ghost" size="sm" onClick={() => setDraft((prev) => ({ ...prev, step: 3 }))} disabled={confirmBusy}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default MassageBookingDialog;
