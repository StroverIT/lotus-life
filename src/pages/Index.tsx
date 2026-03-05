"use client";

import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRight, Sparkles, Leaf, Users, Heart, Mountain } from "lucide-react";
import Layout from "@/components/Layout";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useRef } from "react";

const Index = () => {
  const { season } = useTheme();
  const heroImage = season === "winter" ? "/hero-winter.jpg" : "/hero-summer.jpg";

  const heroRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );
    }
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.3,
        },
      );
    }
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

        <div ref={heroRef} className="relative z-10 container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-accent text-sm tracking-[0.3em] uppercase font-body">
              Bansko, Bulgaria
            </span>
            <Sparkles className="w-5 h-5 text-accent" />
          </div>

          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-primary-foreground mb-6 tracking-tight">
            Lotus Life
          </h1>

          <p className="text-accent text-lg md:text-xl tracking-[0.2em] font-body font-light mb-16">
            breathe · move · create
          </p>

          {/* Two category cards with background images */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {/* Yoga Card */}
            <Link
              href="/yoga"
              className="group relative overflow-hidden rounded-2xl h-72 md:h-80 flex flex-col justify-end p-8 md:p-10 text-left transition-all duration-500 hover:shadow-[0_0_60px_-10px_hsl(var(--accent)_/_0.4)]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10">
                <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-2">
                  Yoga Practices
                </h2>
                <p className="text-primary-foreground/70 font-body text-sm leading-relaxed mb-4">
                  Hatha, Aerial, Taichi, Qi-gong, Dance Meditation, Sound Journeys and more.
                </p>
                <div className="flex items-center gap-2 text-accent text-sm font-medium group-hover:gap-3 transition-all">
                  View Schedule <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Massage Card */}
            <Link
              href="/massage"
              className="group relative overflow-hidden rounded-2xl h-72 md:h-80 flex flex-col justify-end p-8 md:p-10 text-left transition-all duration-500 hover:shadow-[0_0_60px_-10px_hsl(var(--accent)_/_0.4)]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10">
                <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-2">
                  Massage Therapy
                </h2>
                <p className="text-primary-foreground/70 font-body text-sm leading-relaxed mb-4">
                  Classic, Deep Tissue, Aromatherapy, Hot Stone, Thai and our signature Face
                  &amp; Body Ritual.
                </p>
                <div className="flex items-center gap-2 text-accent text-sm font-medium group-hover:gap-3 transition-all">
                  Explore Treatments <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick info strip */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "8+", label: "Yoga & Movement Styles" },
              { number: "6", label: "Massage Therapies" },
              { number: "2", label: "Mountain Studios" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-5xl font-semibold text-primary mb-2">
                  {stat.number}
                </p>
                <p className="text-muted-foreground text-sm font-body">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl mb-8 text-foreground">
              Our <span className="text-gradient-purple">Philosophy</span>
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg max-w-3xl mx-auto mb-4">
              Nestled in the heart of Bansko, Lotus Life offers a sanctuary where ancient
              wisdom meets modern wellness. Our two beautiful studio spaces -- Pirin Hall and
              Rodopi Hall -- provide the perfect environment for your practice, whether you're
              drawn to dynamic aerial yoga, peaceful meditation, or the flowing movements of
              Tai Chi.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed text-lg max-w-3xl mx-auto">
              We believe in the transformative power of consistent practice. Our diverse class
              offerings are designed to meet you where you are, guiding you toward greater
              strength, flexibility, and inner peace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Leaf,
                title: "Natural Harmony",
                description:
                  "Connect with nature's rhythm through mindful movement and breath.",
              },
              {
                icon: Users,
                title: "Community",
                description:
                  "Build meaningful connections in our welcoming studio spaces.",
              },
              {
                icon: Heart,
                title: "Holistic Wellness",
                description:
                  "Nurture body, mind, and spirit through diverse practices.",
              },
              {
                icon: Mountain,
                title: "Mountain Energy",
                description:
                  "Draw inspiration from the majestic Pirin mountains surrounding us.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-border bg-card p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center mx-auto mb-4">
                  <pillar.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm font-body leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
            >
              Learn Our Story <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
