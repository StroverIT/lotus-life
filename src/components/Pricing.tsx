"use client";

import { Check, Gift, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimateIn } from "@/components/AnimateIn";
import { useGsapScrollRevealStagger } from "@/hooks/useGsapScrollReveal";

interface PricingTier {
  name: string;
  price: number;
  icon: React.ReactNode;
  features: string[];
  highlighted?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Lotus Essence",
    price: 50,
    icon: <Sparkles className="w-6 h-6" />,
    features: [
      "1 friend pass",
      "Up to 6 visits",
      "Each additional visit: €8",
    ],
  },
  {
    name: "Lotus Bloom",
    price: 75,
    icon: <Users className="w-6 h-6" />,
    features: [
      "1 friend pass",
      "Unlimited regular practices",
      "15% off massages (Aksiniya Tsenova)",
      "15% off events",
      "15% off items in Lotus Life",
    ],
    highlighted: true,
  },
  {
    name: "Lotus Life",
    price: 120,
    icon: <Gift className="w-6 h-6" />,
    features: [
      "2 friend passes",
      "Unlimited regular practices",
      "15% off massages (Aksiniya Tsenova)",
      "15% off events",
      "15% off individual sessions",
      "15% off items in Lotus Life",
      "Welcome gift box",
    ],
  },
];

const Pricing = () => {
  const cardsRef = useGsapScrollRevealStagger<HTMLDivElement>({
    y: 30,
    duration: 0.6,
    stagger: 0.15,
  });

  return (
    <section id="pricing" className="py-24 bg-warm-white">
      <div className="container mx-auto px-4">
        <AnimateIn className="text-center mb-16" y={20} duration={0.6}>
          <h2 className="font-display text-5xl md:text-6xl text-charcoal mb-4">
            Memberships
          </h2>
          <p className="text-charcoal-light text-lg max-w-xl mx-auto mb-6">
            Prices in Lotus Life for 2026
          </p>
          <div className="inline-flex items-center gap-2 bg-sage-light text-sage-dark px-4 py-2 rounded-full text-sm font-body">
            <span>Single class: €10</span>
          </div>
        </AnimateIn>

        {/* Pricing Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                tier.highlighted
                  ? "bg-sage text-cream shadow-elevated"
                  : "bg-cream shadow-soft"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-charcoal text-cream text-xs px-4 py-1 rounded-full font-body">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  tier.highlighted ? "bg-sage-light text-sage" : "bg-sage-light text-sage"
                }`}
              >
                {tier.icon}
              </div>

              {/* Name & Price */}
              <h3
                className={`font-display text-2xl mb-2 ${
                  tier.highlighted ? "text-cream" : "text-charcoal"
                }`}
              >
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span
                  className={`font-display text-4xl font-light ${
                    tier.highlighted ? "text-cream" : "text-charcoal"
                  }`}
                >
                  €{tier.price}
                </span>
                <span
                  className={`text-sm ${
                    tier.highlighted ? "text-cream/70" : "text-charcoal-light"
                  }`}
                >
                  /month
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className={`flex items-start gap-3 text-sm ${
                      tier.highlighted ? "text-cream/90" : "text-charcoal-light"
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        tier.highlighted ? "text-cream" : "text-sage"
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={tier.highlighted ? "hero-outline" : "sage"}
                className={`w-full ${
                  tier.highlighted
                    ? "border-cream text-cream hover:bg-cream hover:text-sage"
                    : ""
                }`}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
