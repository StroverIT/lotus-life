"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Calendar, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/types/schedule";

function getTodayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

const Events = () => {
  const [date, setDate] = useState<string>(getTodayISO);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [signedUpEventIds, setSignedUpEventIds] = useState<Set<string>>(
    () => new Set()
  );
  const [signUpDialog, setSignUpDialog] = useState<{
    open: boolean;
    event: Event | null;
  }>({ open: false, event: null });
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/events?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [date]);

  const selectedDate = (() => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  })();

  const handleOpenSignUp = (evt: Event) => {
    setSignUpDialog({ open: true, event: evt });
    setGuestEmail("");
    setGuestName("");
  };

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const evt = signUpDialog.event;
    if (!evt || !guestEmail.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/events/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: evt.id,
          guestEmail: guestEmail.trim(),
          guestName: guestName.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Sign up failed");
      }
      setSignedUpEventIds((prev) => new Set(prev).add(evt.id));
      toast({
        title: "You're signed up",
        description: `See you at ${evt.title} on ${format(new Date(evt.date), "MMM d, yyyy")}.`,
      });
      setSignUpDialog({ open: false, event: null });
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
    <section id="events" className="py-24 bg-cream">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-5xl md:text-6xl text-charcoal mb-4">
            Events
          </h2>
          <p className="text-charcoal-light text-lg max-w-xl mx-auto">
            One-off events on specific dates
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="font-body bg-cream border-border text-charcoal hover:bg-sage-light hover:text-sage-dark hover:border-sage"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {format(selectedDate, "EEEE, MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setDate(format(d, "yyyy-MM-dd"));
                    setCalendarOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </motion.div>

        {loading ? (
          <p className="text-center text-charcoal-light font-body">
            Loading events…
          </p>
        ) : events.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-charcoal-light font-body italic"
          >
            No events on this date.
          </motion.p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt, index) => {
              const isSignedUp = signedUpEventIds.has(evt.id);
              return (
                <motion.article
                  key={evt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenSignUp(evt)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenSignUp(evt);
                    }
                  }}
                  className="group bg-marble rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-all duration-300 border border-border cursor-pointer flex flex-col"
                >
                  <div className="flex-1 min-h-0">
                    <h3 className="font-display text-2xl text-charcoal mb-2">
                      {evt.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sage font-body text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      {evt.time}
                    </div>
                    {evt.description && (
                      <p className="text-charcoal-light font-body text-sm">
                        {evt.description}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-3 pt-3 mt-3 border-t border-border">
                    <p className="text-charcoal-light text-sm font-body flex items-center gap-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {evt.location}
                    </p>
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
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={signUpDialog.open}
        onOpenChange={(open) =>
          setSignUpDialog((d) => ({ ...d, open }))
        }
      >
        <DialogContent className="font-body">
          <DialogHeader>
            <DialogTitle className="text-charcoal">
              Sign up for event
            </DialogTitle>
            <DialogDescription>
              {signUpDialog.event
                ? `${signUpDialog.event.title} • ${format(new Date(signUpDialog.event.date), "MMM d, yyyy")} at ${signUpDialog.event.time}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ev-guestEmail" className="text-charcoal">
                Email *
              </Label>
              <Input
                id="ev-guestEmail"
                type="email"
                placeholder="you@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                className="bg-cream border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-guestName" className="text-charcoal">
                Name
              </Label>
              <Input
                id="ev-guestName"
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

export default Events;
