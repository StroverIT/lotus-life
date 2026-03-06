"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { usePageFirstVisit } from "@/context/PageAnimationContext";
import { useContactAnimations } from "@/hooks/useContactAnimations";

const WHATSAPP_URL = "https://wa.me/359883317785";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const shouldAnimate = usePageFirstVisit("contact");
  const scope = useContactAnimations(shouldAnimate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours. Namaste.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      <div ref={scope}>
        {/* Hero */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="cc-nav relative z-10 container mx-auto px-4 text-center">
            <h1 className="cc-title font-display text-5xl md:text-7xl font-light text-primary-foreground mb-4">
              Get in Touch
            </h1>
            <p className="cc-subtitle text-accent text-lg font-body max-w-xl mx-auto">
              Questions, bookings, or just a friendly hello — we'd love to hear from you.
            </p>
            <Button
              className="cc-bookNowTop mt-6 gradient-purple text-primary-foreground border-0 hover:opacity-90"
              asChild
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                Book Now
              </a>
            </Button>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Info */}
              <div>
                <h2 className="font-display text-3xl mb-8">Let's Connect</h2>

                <div className="cc-cards space-y-6 mb-10">
                  <a
                    href="tel:+359883317785"
                    className="cc-card cc-hoverLift flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="cc-cardLabel text-sm text-muted-foreground font-body">
                        Call us
                      </p>
                      <p className="cc-cardMain font-medium group-hover:text-primary transition-colors">
                        +359 883 317 785
                      </p>
                    </div>
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cc-card cc-hoverLift flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="cc-cardLabel text-sm text-muted-foreground font-body">
                        WhatsApp
                      </p>
                      <p className="cc-cardMain font-medium group-hover:text-primary transition-colors">
                        Message us directly
                      </p>
                    </div>
                  </a>
                  <a
                    href="mailto:hello@lotuslife.bg"
                    className="cc-card cc-hoverLift flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="cc-cardLabel text-sm text-muted-foreground font-body">
                        Email
                      </p>
                      <p className="cc-cardMain font-medium group-hover:text-primary transition-colors">
                        hello@lotuslife.bg
                      </p>
                    </div>
                  </a>

                  <div className="cc-studios space-y-4">
                    <div className="cc-studio flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-body">Pirin Hall</p>
                        <p className="font-medium">Nayden Gerov 34, Str., Bansko</p>
                      </div>
                    </div>
                    <div className="cc-studio flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-body">Rodopi Hall</p>
                        <p className="font-medium">Nayden Gerov 36, Str., Bansko</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cc-hours rounded-xl bg-secondary p-6">
                  <p className="font-display text-lg mb-2">Working Hours</p>
                  <div className="text-sm text-muted-foreground font-body space-y-1">
                    <p className="cc-hourRow">
                      Monday – Friday: 07:30 – 20:00
                    </p>
                    <p className="cc-hourRow">Saturday: 08:30 – 18:00</p>
                    <p className="cc-hourRow">Sunday: 09:30 – 19:00</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <form
                  onSubmit={handleSubmit}
                  className="cc-form rounded-xl border border-border bg-card p-8"
                >
                  <h2 className="cc-formTitle font-display text-3xl mb-6">
                    Send a Message
                  </h2>
                  <div className="space-y-5">
                    <div className="cc-field">
                      <label className="text-sm font-body text-muted-foreground block mb-2">
                        Name
                      </label>
                      <Input
                        className="cc-input"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="cc-field">
                      <label className="text-sm font-body text-muted-foreground block mb-2">
                        Email
                      </label>
                      <Input
                        className="cc-input"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="cc-field">
                      <label className="text-sm font-body text-muted-foreground block mb-2">
                        Message
                      </label>
                      <Textarea
                        className="cc-input"
                        value={formData.message}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        placeholder="How can we help you?"
                        rows={5}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="cc-submit w-full gradient-purple text-primary-foreground border-0 hover:opacity-90"
                    >
                      <Send className="w-4 h-4 mr-2" /> Send Message
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ContactPage;
