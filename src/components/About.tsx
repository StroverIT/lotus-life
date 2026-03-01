"use client";

import { useRef } from "react";
import { Heart, Leaf, Sun, Mountain } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimateIn } from "@/components/AnimateIn";
import { useGsapScrollRevealStagger } from "@/hooks/useGsapScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const valuesRef = useGsapScrollRevealStagger<HTMLDivElement>({
    y: 20,
    duration: 0.5,
    stagger: 0.1,
  });
  const float1Ref = useRef<HTMLDivElement>(null);
  const float2Ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (float1Ref.current) {
        gsap.to(float1Ref.current, {
          y: -10,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (float2Ref.current) {
        gsap.to(float2Ref.current, {
          y: 10,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    },
    []
  );

  const values = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Natural Harmony",
      description:
        "Connect with nature's rhythm through mindful movement and breath.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Community",
      description:
        "Build meaningful connections in our welcoming studio spaces.",
    },
    {
      icon: <Sun className="w-6 h-6" />,
      title: "Holistic Wellness",
      description:
        "Nurture body, mind, and spirit through diverse practices.",
    },
    {
      icon: <Mountain className="w-6 h-6" />,
      title: "Mountain Energy",
      description:
        "Draw inspiration from the majestic Pirin mountains surrounding us.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-cream">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <AnimateIn x={-30} duration={0.8}>
            <h2 className="font-display text-5xl md:text-6xl text-charcoal mb-6">
              Our Philosophy
            </h2>
            <p className="text-charcoal-light text-lg leading-relaxed mb-6">
              Nestled in the heart of Bansko, Lotus Life offers a sanctuary where
              ancient wisdom meets modern wellness. Our two beautiful studio
              spaces—Pirin Hall and Rodopi Hall—provide the perfect environment
              for your practice, whether you're drawn to dynamic aerial yoga,
              peaceful meditation, or the flowing movements of Tai Chi.
            </p>
            <p className="text-charcoal-light text-lg leading-relaxed mb-8">
              We believe in the transformative power of consistent practice.
              Our diverse class offerings are designed to meet you where you are,
              guiding you toward greater strength, flexibility, and inner peace.
            </p>

            <div ref={valuesRef} className="grid sm:grid-cols-2 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-sage-light flex items-center justify-center text-sage flex-shrink-0">
                    {value.icon}
                  </div>
                  <div>
                    <h4 className="font-display text-lg text-charcoal mb-1">
                      {value.title}
                    </h4>
                    <p className="text-charcoal-light text-sm">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateIn>

          <AnimateIn x={30} duration={0.8} className="relative">
            <div className="aspect-square bg-marble rounded-3xl flex items-center justify-center overflow-hidden">
              <div className="text-center p-12">
                <svg viewBox="0 0 120 120" className="w-32 h-32 mx-auto text-sage mb-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M60 20 C60 20, 45 45, 45 65 C45 80, 52 88, 60 88 C68 88, 75 80, 75 65 C75 45, 60 20, 60 20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M38 35 C38 35, 30 55, 38 70 C43 78, 52 78, 60 70"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M82 35 C82 35, 90 55, 82 70 C77 78, 68 78, 60 70"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M22 50 C22 50, 22 68, 38 75 C48 79, 58 72, 60 65"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M98 50 C98 50, 98 68, 82 75 C72 79, 62 72, 60 65"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <p className="font-display text-3xl text-charcoal italic">
                  "Embrace Your<br />Inner Harmony"
                </p>
              </div>
            </div>

            <div
              ref={float1Ref}
              className="absolute -bottom-4 -left-4 w-24 h-24 bg-sage-light rounded-2xl -z-10"
            />
            <div
              ref={float2Ref}
              className="absolute -top-4 -right-4 w-16 h-16 bg-sage/20 rounded-xl -z-10"
            />
          </AnimateIn>
        </div>
      </div>
    </section>
  );
};

export default About;
