"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, Check, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { massageTypes, type MassageType } from "@/data/massages";
import MassageBookingDialog from "@/components/MassageBookingDialog";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { fadeInUp, staggerChildren } from "@/lib/animations";

const MassagePage = () => {
  const [selectedMassage, setSelectedMassage] = useState<MassageType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    fadeInUp(
      heroRef.current,
      {
        y: 20,
        duration: 0.8,
      },
      prefersReducedMotion,
    );

    staggerChildren(
      gridRef.current,
      {
        y: 20,
        duration: 0.6,
        stagger: 0.08,
      },
      prefersReducedMotion,
    );
  }, [prefersReducedMotion]);

  const handleBook = (massage: MassageType) => {
    setSelectedMassage(massage);
    setDialogOpen(true);
  };

  return (
    <Layout>
      {/* Hero with background image */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
        <div ref={heroRef} className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-7xl font-light text-primary-foreground mb-4">
            Massage Therapy
          </h1>
          <p className="text-accent text-lg font-body max-w-xl mx-auto">
            Healing touch guided by ancient wisdom. Six therapeutic treatments designed to restore your body and spirit.
          </p>
        </div>
      </section>

      {/* Treatments */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl text-center mb-4">Our Treatments</h2>
          <p className="text-center text-muted-foreground font-body mb-14 max-w-lg mx-auto">
            Each session is tailored to your needs. All treatments use organic, locally-sourced mountain botanicals.
          </p>

          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {massageTypes.map((massage, i) => (
              <div
                key={massage.id}
                className="group rounded-xl border border-border bg-card p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center">
                    <massage.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground font-body block">from</span>
                    <span className="text-xl font-display font-semibold text-primary">{massage.price30}</span>
                  </div>
                </div>

                <h3 className="font-display text-2xl mb-3">{massage.name}</h3>
                <p className="text-muted-foreground text-sm font-body mb-5 flex-1">{massage.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {massage.benefits.map((b) => (
                    <span key={b} className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-body">
                      <Check className="w-3 h-3" /> {b}
                    </span>
                  ))}
                </div>

                <Button
                  onClick={() => handleBook(massage)}
                  className="w-full gradient-purple text-primary-foreground border-0 hover:opacity-90"
                >
                  Book Now
                </Button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground font-body text-sm mb-4">
              Members enjoy up to 20% off all massage treatments
            </p>
            <Link href="/memberships" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all font-body text-sm">
              View Memberships <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <MassageBookingDialog
        massage={selectedMassage}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Layout>
  );
};

export default MassagePage;
