"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Clock, UserPlus, LogIn, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { AnimateIn } from "@/components/AnimateIn";
import { useGsapScrollRevealStagger } from "@/hooks/useGsapScrollReveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type {
  Location,
  ClassItem,
  DaySchedule,
  WeeklySchedule,
} from "@/types/schedule";

function buildScheduleSlotId(
  day: string,
  cls: ClassItem
): string {
  const daySlug = day.toLowerCase();
  const nameSlug = cls.name.toLowerCase().replace(/\s+/g, "-");
  return `${daySlug}-${cls.time}-${nameSlug}-${cls.location}`;
}

const Schedule = () => {
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const gridRef = useGsapScrollRevealStagger<HTMLDivElement>({
    y: 20,
    duration: 0.5,
    stagger: 0.1,
    delay: 0,
    dependencies: [loading],
  });
  const [filter, setFilter] = useState<"all" | Location>("all");
  const [signedUpSlotIds, setSignedUpSlotIds] = useState<Set<string>>(
    () => new Set()
  );
  const [signUpDialog, setSignUpDialog] = useState<{
    open: boolean;
    scheduleSlotId: string;
    classLabel: string;
  }>({ open: false, scheduleSlotId: "", classLabel: "" });
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signUpStep, setSignUpStep] = useState<"choice" | "guest" | "signed-in">("choice");
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    fetch("/api/schedules")
      .then((res) => res.json())
      .then((data) => {
        setSchedules(Array.isArray(data) ? data : []);
        setSelectedWeekIndex(0);
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, []);

  const currentSchedule: DaySchedule[] =
    schedules[selectedWeekIndex]?.schedule ?? [];
  const filteredSchedule = currentSchedule.map((day) => ({
    ...day,
    classes: day.classes.filter(
      (cls) => filter === "all" || cls.location === filter
    ),
  }));
  const selectedWeek = schedules[selectedWeekIndex];

  const handleOpenSignUp = (day: string, cls: ClassItem) => {
    const scheduleSlotId = buildScheduleSlotId(day, cls);
    setSignUpDialog({
      open: true,
      scheduleSlotId,
      classLabel: `${cls.name} (${day}, ${cls.time})`,
    });
    setGuestEmail(session?.user?.email ?? "");
    setGuestName(session?.user?.name ?? "");
    setSignUpStep(session ? "signed-in" : "choice");
  };

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasSession = !!session?.user;
    if (!signUpDialog.scheduleSlotId) return;
    if (!hasSession && !guestEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/schedules/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleSlotId: signUpDialog.scheduleSlotId,
          ...(hasSession
            ? { userId: (session?.user as { id?: string })?.id ?? session?.user?.email }
            : { guestEmail: guestEmail.trim(), guestName: guestName.trim() || undefined }),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Sign up failed");
      }
      setSignedUpSlotIds((prev) =>
        new Set(prev).add(signUpDialog.scheduleSlotId)
      );
      toast({
        title: "You're signed up",
        description: `See you at ${signUpDialog.classLabel}.`,
      });
      setSignUpDialog((d) => ({ ...d, open: false }));
    } catch (err) {
      toast({
        title: "Sign up failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="schedule" className="py-24 bg-marble">
      <div className="container mx-auto px-4">
        <AnimateIn className="text-center mb-16" y={20} duration={0.6}>
          <h2 className="font-display text-5xl md:text-6xl text-charcoal mb-4">
            Weekly Schedule
          </h2>
          <p className="text-charcoal-light text-lg max-w-xl mx-auto">
            {selectedWeek
              ? `${selectedWeek.weekLabel} • Regular Practices`
              : "Loading…"}
          </p>
        </AnimateIn>

        {/* Week selector */}
        {schedules.length > 1 && (
          <AnimateIn className="flex justify-center mb-8" y={20} delay={0.1} duration={0.6}>
            <Select
              value={String(selectedWeekIndex)}
              onValueChange={(v) => setSelectedWeekIndex(Number(v))}
            >
              <SelectTrigger className="w-full max-w-sm font-body bg-cream border-border text-charcoal">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((week, i) => (
                  <SelectItem key={week.id} value={String(i)}>
                    {week.weekLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AnimateIn>
        )}

        {/* Location Filter */}
        <AnimateIn className="flex justify-center gap-4 mb-12" y={20} delay={0.2} duration={0.6}>
          {[
            { key: "all", label: "All Locations" },
            { key: "pirin", label: "Pirin Hall" },
            { key: "rodopi", label: "Rodopi Hall" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as "all" | Location)}
              className={`px-6 py-3 rounded-full font-body text-sm transition-all duration-300 ${
                filter === item.key
                  ? "bg-sage text-cream shadow-soft"
                  : "bg-cream text-charcoal hover:bg-sage-light"
              }`}
            >
              {item.label}
            </button>
          ))}
        </AnimateIn>

        {/* Schedule Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-cream rounded-2xl p-6 shadow-soft"
              >
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, classIndex) => (
                    <div
                      key={classIndex}
                      className="flex justify-between items-center gap-3 rounded-xl py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Skeleton className="h-4 w-12" />
                        <div className="min-w-0 space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSchedule.map((day) => (
              <div
                key={day.day}
                className="bg-cream rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-shadow duration-300"
              >
                <h3 className="font-display text-2xl text-charcoal mb-4 pb-3 border-b border-border">
                  {day.day}
                </h3>
                {day.classes.length > 0 ? (
                  <div className="space-y-2">
                    {day.classes.map((cls, index) => {
                      const slotId = buildScheduleSlotId(day.day, cls);
                      const isSignedUp = signedUpSlotIds.has(slotId);
                      return (
                        <div
                          key={`${cls.name}-${index}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenSignUp(day.day, cls)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleOpenSignUp(day.day, cls);
                            }
                          }}
                          className="group flex justify-between items-center gap-3 rounded-xl py-2 px-3 -mx-3 cursor-pointer transition-all duration-300 ease-out hover:bg-sage-light/50 hover:pl-4 border-l-2 border-l-transparent hover:border-l-sage/40"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-sage font-medium font-body text-sm shrink-0 transition-colors duration-300 group-hover:text-sage-dark">
                              {cls.time}
                            </span>
                            <div className="min-w-0">
                              <p className="text-charcoal font-medium font-body truncate transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                                {cls.name}
                              </p>
                              <p className="text-charcoal-light text-xs flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {cls.location === "pirin"
                                  ? "Pirin"
                                  : "Rodopi"}{" "}
                                Hall
                              </p>
                            </div>
                          </div>
                          <div
                            className={`shrink-0 font-body text-xs transition-all duration-300 ease-out ${
                              isSignedUp
                                ? "text-sage font-medium"
                                : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                            }`}
                          >
                            {isSignedUp ? (
                              "Signed up"
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-sage text-cream px-3 py-1.5 rounded-full transition-transform duration-200 ease-out group-hover:scale-105">
                                <UserPlus className="w-3 h-3" />
                                Sign up
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-charcoal-light text-sm italic">
                    No classes at selected location
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Booking Info */}
        <AnimateIn className="mt-12 text-center" y={20} delay={0.4} duration={0.6}>
          <div className="inline-flex items-center gap-3 bg-sage-light text-sage-dark px-6 py-4 rounded-xl">
            <Clock className="w-5 h-5" />
            <span className="font-body">
              Pre-booking required:{" "}
              <a href="tel:+359883317785" className="font-medium hover:underline">
                +359 883 317 785
              </a>
            </span>
          </div>
        </AnimateIn>
      </div>

      {/* Sign up dialog */}
      <Dialog
        open={signUpDialog.open}
        onOpenChange={(open) =>
          setSignUpDialog((d) => ({ ...d, open }))
        }
      >
        <DialogContent className="font-body">
          <DialogHeader>
            <DialogTitle className="text-charcoal">Sign up for class</DialogTitle>
            <DialogDescription>
              {signUpDialog.classLabel}
            </DialogDescription>
          </DialogHeader>
          {signUpStep === "choice" ? (
            <div className="space-y-3">
              <p className="text-charcoal-light text-sm font-body">
                Sign in to track your visits in your account, or continue as a guest.
              </p>
              <Button variant="sage" className="w-full font-body" asChild>
                <Link href="/auth/signin?callbackUrl=/panel">
                  <LogIn className="w-4 h-4" />
                  Sign in / Sign up
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full font-body border-border"
                onClick={() => setSignUpStep("guest")}
              >
                <User className="w-4 h-4" />
                Continue as guest
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitSignUp} className="space-y-4">
              {signUpStep === "signed-in" && (
                <p className="text-sage text-sm font-body">
                  You&apos;re signed in as {session?.user?.email}. This will be linked to your account.
                </p>
              )}
              {signUpStep === "guest" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="guestEmail" className="text-charcoal">
                      Email *
                    </Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      className="bg-cream border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guestName" className="text-charcoal">
                      Name
                    </Label>
                    <Input
                      id="guestName"
                      type="text"
                      placeholder="Your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-cream border-border"
                    />
                  </div>
                </>
              )}
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={submitting || (signUpStep === "guest" && !guestEmail.trim())}
                  className="bg-sage text-cream hover:bg-sage-dark"
                >
                  {submitting ? "Signing up…" : "Confirm sign up"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Schedule;
