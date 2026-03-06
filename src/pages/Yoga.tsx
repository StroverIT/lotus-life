"use client";

import { useState, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { Clock, MapPin, User, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { weeklySchedule, yogaEvents } from "@/data/schedule";
import { cn } from "@/lib/utils";
import EventSignupDialog from "@/components/EventSignupDialog";
import { usePageFirstVisit } from "@/context/PageAnimationContext";
import { useYogaAnimations } from "@/hooks/useYogaAnimations";

const YogaPage = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupEvent, setSignupEvent] = useState<{ name: string; day?: string; time?: string }>({
    name: "",
  });
  const [contentLoaded, setContentLoaded] = useState(false);

  const shouldAnimate = usePageFirstVisit("yoga");
  const scope = useYogaAnimations(shouldAnimate);

  useEffect(() => {
    const t = setTimeout(() => setContentLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  const hasSchedule = weeklySchedule && weeklySchedule.length > 0;
  const currentDayIndex = hasSchedule
    ? Math.min(selectedDay, weeklySchedule.length - 1)
    : 0;
  const currentDay = hasSchedule ? weeklySchedule[currentDayIndex] : null;

  const openSignup = (name: string, day?: string, time?: string) => {
    setSignupEvent({ name, day, time });
    setSignupOpen(true);
  };

  const onDayClick = async (index: number) => {
    await (window as any).__yyAnimateDayChange?.();
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

    requestAnimationFrame(() => (window as any).__yyPopActiveDay?.());
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
                    {weeklySchedule.map((day, i) => (
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
                              )
                            }
                          >
                            Sign Up
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
                  {yogaEvents.map((event) => (
                <div
                  key={event.id}
                  className="yy-eventCard yy-hoverLift rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-2 text-xs text-primary font-medium font-body mb-3">
                    <span className="px-2 py-1 rounded-full bg-primary/10">
                      {event.date}
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
                      openSignup(event.name, event.date, event.time)
                    }
                  >
                    Reserve Spot <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ))}
                </div>
              </>
            )}
          </div>
        </section>

        <EventSignupDialog
          open={signupOpen}
          onOpenChange={setSignupOpen}
          eventName={signupEvent.name}
          eventDay={signupEvent.day}
          eventTime={signupEvent.time}
        />
      </div>
    </Layout>
  );
};

export default YogaPage;
