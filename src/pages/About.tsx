 "use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Leaf, Users, Heart, Mountain, MapPin } from "lucide-react";
import Layout from "@/components/Layout";

const pillars = [
  { icon: Leaf, title: "Natural Harmony", description: "We work with nature, not against it. Our practices honor the body's natural rhythms and the mountain environment that surrounds us." },
  { icon: Users, title: "Community", description: "Lotus Life is more than a studio — it's a gathering place for seekers, movers, and creators from all walks of life." },
  { icon: Heart, title: "Holistic Wellness", description: "We believe in treating the whole person. Body, mind, and spirit are interconnected, and our offerings reflect that unity." },
  { icon: Mountain, title: "Mountain Energy", description: "The Pirin Mountains aren't just our backdrop — they're our teacher. Their stillness and strength inspire every class we offer." },
];

const AboutPage = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const philosophyRef = useRef<HTMLDivElement | null>(null);
  const pillarsRef = useRef<HTMLDivElement | null>(null);
  const studiosRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      );
    }
    if (philosophyRef.current) {
      gsap.fromTo(
        philosophyRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.1 },
      );
    }
    if (pillarsRef.current) {
      gsap.fromTo(
        pillarsRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
        },
      );
    }
    if (studiosRef.current) {
      gsap.fromTo(
        studiosRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
        },
      );
    }
  }, []);

  return (
    <Layout>
      {/* Hero with background image */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div ref={heroRef} className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="font-display text-5xl md:text-7xl font-light text-primary-foreground mb-4">
              About Lotus Life
            </h1>
            <p className="text-accent text-lg font-body max-w-xl mx-auto">
              Our story, philosophy, and the spaces where transformation happens.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div ref={philosophyRef} className="text-center">
            <h2 className="font-display text-4xl mb-8">Our Philosophy</h2>
            <p className="text-muted-foreground font-body leading-relaxed text-lg mb-6">
              Like the lotus flower that blooms from muddy waters into pure beauty, we believe every person carries within them the potential for profound transformation. Lotus Life was born from the desire to create a space where this transformation can unfold naturally.
            </p>
            <p className="text-muted-foreground font-body leading-relaxed text-lg">
              In the shadow of the Pirin Mountains, we've built a sanctuary where ancient healing arts meet modern understanding. Whether you come to stretch, to heal, to move, or simply to breathe — you'll find what you need here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl text-center mb-14">What We Stand For</h2>
          <div ref={pillarsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.title}
                className="rounded-xl bg-card border border-border p-8 text-center hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center mx-auto mb-5">
                  <pillar.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm font-body leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studios */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-4xl text-center mb-14">Our Studios</h2>
          <div ref={studiosRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Pirin Hall", address: "ul. Glazne 14, Bansko", desc: "Our larger space with panoramic mountain views. Home to group yoga classes, dance meditation, and special events. Equipped with aerial silks, sound healing instruments, and heated floors.", image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80" },
              { name: "Rodopi Hall", address: "ul. Tsar Simeon 22, Bansko", desc: "An intimate studio perfect for smaller groups and private sessions. All massage therapies are offered here, along with face yoga, qi-gong, and personal wellness consultations.", image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&q=80" },
            ].map((studio) => (
              <div
                key={studio.name}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url('${studio.image}')` }}
                />
                <div className="p-8">
                  <h3 className="font-display text-2xl mb-2">{studio.name}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-primary font-body mb-4">
                    <MapPin className="w-4 h-4" /> {studio.address}
                  </p>
                  <p className="text-muted-foreground text-sm font-body leading-relaxed">{studio.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
