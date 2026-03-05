 "use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Check, Star } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { memberships, singleClassPrice } from "@/data/memberships";
import { cn } from "@/lib/utils";

const WHATSAPP_URL = "https://wa.me/359883317785";

const MembershipsPage = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );
    }
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
        },
      );
    }
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div ref={heroRef} className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-7xl font-light text-primary-foreground mb-4">
            Memberships
          </h1>
          <p className="text-accent text-lg font-body max-w-xl mx-auto">
            Choose the plan that fits your lifestyle. All memberships include access to both Pirin Hall and Rodopi Hall.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {memberships.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-2xl p-8 flex flex-col",
                  plan.highlighted
                    ? "gradient-purple text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]"
                    : "border border-border bg-card"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold font-body">
                      <Star className="w-3 h-3" /> {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="font-display text-2xl mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="font-display text-4xl font-semibold">{plan.price}</span>
                  <span className={cn("text-sm font-body ml-1", plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {plan.period}
                  </span>
                </div>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-body">
                      <Check className={cn("w-4 h-4 shrink-0 mt-0.5", plan.highlighted ? "text-accent" : "text-primary")} />
                      <span className={plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    "w-full",
                    plan.highlighted
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      : "gradient-purple text-primary-foreground border-0 hover:opacity-90"
                  )}
                >
                  <a href={`${WHATSAPP_URL}?text=Hi! I'm interested in the ${plan.name} membership`} target="_blank" rel="noopener noreferrer">
                    Get Started
                  </a>
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 p-8 rounded-xl bg-secondary max-w-md mx-auto">
            <p className="font-display text-xl mb-1">Drop-in Class</p>
            <p className="font-display text-3xl font-semibold text-primary mb-2">{singleClassPrice}</p>
            <p className="text-muted-foreground text-sm font-body">No commitment. Just show up and flow.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MembershipsPage;
