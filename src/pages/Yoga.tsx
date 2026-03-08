"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { gsap } from "gsap";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Clock, MapPin, User, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import EventSignupDialog, {
  type EventSignupDialogHandle,
  type EventSignupDraftData,
} from "@/components/EventSignupDialog";
import { getYogaGuestSignups, MODAL_IDS } from "@/constants/modalIds";
import { usePendingModal } from "@/context/PendingModalContext";
import { usePageFirstVisit } from "@/context/PageAnimationContext";
import { useYogaAnimations } from "@/hooks/useYogaAnimations";
import { toast } from "@/components/ui/sonner";
import type { DaySchedule, YogaEvent } from "@/types/catalog";

declare global {
  interface Window {
    __yyAnimateDayChange?: () => Promise<void> | void;
    __yyPopActiveDay?: () => void;
  }
}

const CATALOG_STALE_MS = 2 * 60 * 1000; // 2 minutes

type YogaPageProps = {
  initialSchedule?: DaySchedule[];
  initialEvents?: YogaEvent[];
};

const YogaPage = ({ initialSchedule, initialEvents }: YogaPageProps) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupEvent, setSignupEvent] = useState<{
    name: string;
    day?: string;
    time?: string;
    yogaClassId?: string;
    yogaEventId?: string;
  }>({ name: "" });
  const prevSignupOpenRef = useRef(signupOpen);

  const queryClient = useQueryClient();

  const { data: schedule = [] } = useQuery({
    queryKey: ["schedule"],
    queryFn: async () => {
      const res = await fetch("/api/schedule");
      const json = await res.json();
      return Array.isArray(json) ? (json as DaySchedule[]) : [];
    },
    initialData: initialSchedule,
    staleTime: CATALOG_STALE_MS,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      const json = await res.json();
      return Array.isArray(json) ? (json as YogaEvent[]) : [];
    },
    initialData: initialEvents,
    staleTime: CATALOG_STALE_MS,
  });

  const { data: session } = useSession();

  const { data: scheduleBookingsData } = useQuery({
    queryKey: ["schedule-bookings", (session?.user as { id?: string })?.id ?? session?.user?.email],
    queryFn: async () => {
      const res = await fetch("/api/schedule-bookings");
      const json = (await res.json()) as { yogaClassIds?: string[] };
      return json.yogaClassIds ?? [];
    },
    enabled: !!session?.user,
    staleTime: CATALOG_STALE_MS,
  });

  const { data: eventBookingsData } = useQuery({
    queryKey: ["event-bookings", (session?.user as { id?: string })?.id ?? session?.user?.email],
    queryFn: async () => {
      const res = await fetch("/api/event-bookings");
      const json = (await res.json()) as { yogaEventIds?: string[] };
      return json.yogaEventIds ?? [];
    },
    enabled: !!session?.user,
    staleTime: CATALOG_STALE_MS,
  });

  const bookedClassIds = session?.user
    ? new Set(scheduleBookingsData ?? [])
    : new Set(getYogaGuestSignups().yogaClassIds);
  const bookedEventIds = session?.user
    ? new Set(eventBookingsData ?? [])
    : new Set(getYogaGuestSignups().yogaEventIds);

  useEffect(() => {
    if (prevSignupOpenRef.current && !signupOpen) {
      queryClient.invalidateQueries({ queryKey: ["schedule-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["event-bookings"] });
    }
    prevSignupOpenRef.current = signupOpen;
  }, [signupOpen, queryClient]);

  const contentLoaded = schedule !== undefined && events !== undefined;

  const shouldAnimate = usePageFirstVisit("yoga");
  const scope = useYogaAnimations(shouldAnimate);
  const pathname = usePathname();
  const { getStoredModalData, clearPendingModal } = usePendingModal();
  const eventSignupRef = useRef<EventSignupDialogHandle>(null);

  useEffect(() => {
    const stored = getStoredModalData();
    if (stored?.modalId !== MODAL_IDS.EVENT_SIGNUP) return;
    const data = stored.data as unknown as EventSignupDraftData | undefined;
    const draft = data ?? { eventName: "" };
    setSignupEvent({
      name: draft.eventName ?? "",
      day: draft.eventDay,
      time: draft.eventTime,
      yogaClassId: draft.yogaClassId,
      yogaEventId: draft.yogaEventId,
    });
    setTimeout(() => {
      eventSignupRef.current?.openTheModal();
      clearPendingModal();
    }, 0);
  }, [pathname, getStoredModalData, clearPendingModal]);

  const hasSchedule = schedule && schedule.length > 0;
  const currentDayIndex = hasSchedule
    ? Math.min(selectedDay, schedule.length - 1)
    : 0;
  const currentDay = hasSchedule ? schedule[currentDayIndex] : null;

  const openSignup = (
    name: string,
    day?: string,
    time?: string,
    yogaClassId?: string,
    yogaEventId?: string
  ) => {
    if (yogaClassId && bookedClassIds.has(yogaClassId)) {
      toast.info("You're already signed up for this class");
      return;
    }
    if (yogaEventId && bookedEventIds.has(yogaEventId)) {
      toast.info("You're already signed up for this event");
      return;
    }
    setSignupEvent({ name, day, time, yogaClassId, yogaEventId });
    setSignupOpen(true);
  };

  const onDayClick = async (index: number) => {
    await window.__yyAnimateDayChange?.();
    setSelectedDay(index);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const newCards = gsap.utils.toArray<HTMLElement>(".yy-classCard");
    if (newCards.length) {
      gsap.fromTo(
        newCards,
        { y: 14, },
        { y: 0, opacity: 1, duration: 0.10, stagger: 0.05, },
      );
    }

    requestAnimationFrame(() => window.__yyPopActiveDay?.());
  };

  return (
    <Layout>
      <div ref={scope}>
        {/* Hero with background image */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="yy-nav relative z-10 container mx-auto px-4 text-center">
            <h1 className="yy-title font-display text-5xl md:text-7xl font-light text-primary-foreground mb-4">
              Yoga Practices
            </h1>
            <p className="yy-subtitle text-accent text-lg font-body max-w-xl mx-auto">
              Eight unique movement and meditation styles, seven days a week. Find the practice
              that speaks to your body.
            </p>
            <Button
              className="yy-bookNow mt-6 gradient-purple text-primary-foreground border-0 hover:opacity-90"
              onClick={() => openSignup("Yoga class booking")}
            >
              Book Now
            </Button>
          </div>
        </section>

        {/* Weekly Schedule */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {!contentLoaded ? (
              <>
                <Skeleton className="h-10 w-48 mx-auto mb-12" />
                <div className="flex gap-2 mb-10 justify-center flex-wrap">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-20 rounded-full" />
                  ))}
                </div>
                <div className="grid gap-4 max-w-3xl mx-auto">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-5 w-64 mx-auto mt-8" />
              </>
            ) : (
              <>
                <h2 className="yy-scheduleTitle font-display text-4xl text-center mb-12">
                  Weekly Schedule
                </h2>

                {hasSchedule && (
                  <div className="yy-days flex overflow-x-auto gap-2 mb-10 pb-2 justify-center flex-wrap">
                    {schedule.map((day, i) => (
                      <button
                        key={day.day}
                        onClick={() => onDayClick(i)}
                        className={cn(
                          "yy-day px-5 py-2.5 rounded-full text-sm font-medium font-body transition-all whitespace-nowrap",
                          shouldAnimate && "opacity-0 translate-y-2",
                          currentDayIndex === i
                            ? "is-active gradient-purple text-primary-foreground shadow-lg"
                            : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary",
                        )}
                      >
                        {day.day}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  key={currentDayIndex}
                  className="yy-classes grid gap-4 max-w-3xl mx-auto"
                >
                  {currentDay?.classes?.length
                    ? currentDay.classes.map((cls) => (
                      <div
                        key={cls.id}
                        className={cn("yy-classCard yy-hoverLift group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all", shouldAnimate && "opacity-0 translate-y-3")}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-display text-2xl text-foreground mb-2">
                              {cls.name}
                            </h3>
                            <p className="text-muted-foreground text-sm font-body mb-3">
                              {cls.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {cls.time} · {cls.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {cls.hall}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {cls.instructor}
                              </span>
                            </div>
                          </div>
                          <Button
                            className="gradient-purple text-primary-foreground border-0 hover:opacity-90 shrink-0"
                            onClick={() =>
                              openSignup(
                                cls.name,
                                currentDay?.day,
                                cls.time,
                                cls.id,
                              )
                            }
                            disabled={bookedClassIds.has(cls.id)}
                          >
                            {bookedClassIds.has(cls.id) ? "Already signed up" : "Sign Up"}
                          </Button>
                        </div>
                      </div>
                    ))
                    : (
                      <p className="text-center text-sm text-muted-foreground font-body">
                        No classes scheduled yet for this day.
                      </p>
                    )}
                </div>

                <p className="yy-pricing text-center text-sm text-muted-foreground mt-8 font-body">
                  Single class: <span className="text-primary font-semibold">€10</span> ·
                  <Link
                    href="/memberships"
                    className="text-primary hover:underline ml-1"
                  >
                    View memberships →
                  </Link>
                </p>
              </>
            )}
          </div>
        </section>

        {/* Events */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            {!contentLoaded ? (
              <>
                <Skeleton className="h-10 w-56 mx-auto mb-4" />
                <Skeleton className="h-4 w-72 mx-auto mb-12" />
                <div className="yy-events grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="yy-eventsTitle font-display text-4xl text-center mb-4">
                  Upcoming Events
                </h2>
                <p className="text-center text-muted-foreground font-body mb-12">
                  Special workshops and experiences
                </p>

                <div className="yy-events grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {events.map((event) => (
                <div
                  key={event.id}
                  className="yy-eventCard yy-hoverLift rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 text-xs text-primary font-medium font-body mb-3">
                    <span className="px-2 py-1 rounded-full bg-primary/10">
                      {event.dateLabel}
                    </span>
                    <span>{event.price}</span>
                  </div>
                  <h3 className="font-display text-2xl mb-2">{event.name}</h3>
                  <p className="text-muted-foreground text-sm font-body mb-4">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-body mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {event.time} · {event.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.hall}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5"
                    onClick={() =>
                      openSignup(event.name, event.dateLabel, event.time, undefined, event.id)
                    }
                    disabled={bookedEventIds.has(event.id)}
                  >
                    {bookedEventIds.has(event.id) ? "Already signed up" : <>Reserve Spot <ArrowRight className="w-4 h-4 ml-1" /></>}
                  </Button>
                </div>
              ))}
                </div>
              </>
            )}
          </div>
        </section>

        <EventSignupDialog
          ref={eventSignupRef}
          open={signupOpen}
          onOpenChange={setSignupOpen}
          eventName={signupEvent.name}
          eventDay={signupEvent.day}
          eventTime={signupEvent.time}
          yogaClassId={signupEvent.yogaClassId}
          yogaEventId={signupEvent.yogaEventId}
        />
      </div>
    </Layout>
  );
};

export default YogaPage;
