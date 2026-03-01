"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, UserPlus } from "lucide-react";
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
    setGuestEmail("");
    setGuestName("");
  };

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpDialog.scheduleSlotId || !guestEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/schedules/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleSlotId: signUpDialog.scheduleSlotId,
          guestEmail: guestEmail.trim(),
          guestName: guestName.trim() || undefined,
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl text-charcoal mb-4">
            Weekly Schedule
          </h2>
          <p className="text-charcoal-light text-lg max-w-xl mx-auto">
            {selectedWeek
              ? `${selectedWeek.weekLabel} • Regular Practices`
              : "Loading…"}
          </p>
        </motion.div>

        {/* Week selector */}
        {schedules.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
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
          </motion.div>
        )}

        {/* Location Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center gap-4 mb-12"
        >
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
        </motion.div>

        {/* Schedule Grid */}
        {loading ? (
          <p className="text-center text-charcoal-light font-body">
            Loading schedule…
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="wait">
              {filteredSchedule.map((day, dayIndex) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: dayIndex * 0.1, duration: 0.5 }}
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
                          <motion.div
                            key={`${cls.name}-${index}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleOpenSignUp(day.day, cls)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleOpenSignUp(day.day, cls);
                              }
                            }}
                            className="group flex justify-between items-center gap-3 rounded-xl py-2 px-3 -mx-3 hover:bg-sage-light/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="text-sage font-medium font-body text-sm shrink-0">
                                {cls.time}
                              </span>
                              <div className="min-w-0">
                                <p className="text-charcoal font-medium font-body truncate">
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
                              className={`shrink-0 font-body text-xs ${
                                isSignedUp
                                  ? "text-sage font-medium"
                                  : "opacity-0 group-hover:opacity-100 transition-opacity"
                              }`}
                            >
                              {isSignedUp ? (
                                "Signed up"
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-sage text-cream px-3 py-1.5 rounded-full">
                                  <UserPlus className="w-3 h-3" />
                                  Sign up
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-charcoal-light text-sm italic">
                      No classes at selected location
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Booking Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-sage-light text-sage-dark px-6 py-4 rounded-xl">
            <Clock className="w-5 h-5" />
            <span className="font-body">
              Pre-booking required:{" "}
              <a href="tel:+359883317785" className="font-medium hover:underline">
                +359 883 317 785
              </a>
            </span>
          </div>
        </motion.div>
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
          <form onSubmit={handleSubmitSignUp} className="space-y-4">
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
            <DialogFooter>
              <Button
                type="submit"
                disabled={submitting || !guestEmail.trim()}
                className="bg-sage text-cream hover:bg-sage-dark"
              >
                {submitting ? "Signing up…" : "Sign up"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Schedule;
