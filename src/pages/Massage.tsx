"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Check, ArrowRight, type LucideIcon } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MassageBookingDialog, {
  type MassageBookingDialogHandle,
  type MassageBookingDraftData,
} from "@/components/MassageBookingDialog";
import { MODAL_IDS } from "@/constants/modalIds";
import { usePendingModal } from "@/context/PendingModalContext";
import { usePageFirstVisit } from "@/context/PageAnimationContext";
import { useMassageAnimations } from "@/hooks/useMassageAnimations";
import type { Massage } from "@/types/catalog";
import { DEFAULT_MASSAGE_ICON, MASSAGE_ICON_MAP } from "@/lib/massageIconMap";

const CATALOG_STALE_MS = 2 * 60 * 1000; // 2 minutes

const MassagePage = () => {
  const [selectedMassage, setSelectedMassage] = useState<Massage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  const { data: massagesRaw = [] } = useQuery({
    queryKey: ["massages"],
    queryFn: async () => {
      const res = await fetch("/api/massages");
      const json = await res.json();
      return Array.isArray(json) ? (json as Massage[]) : [];
    },
    staleTime: CATALOG_STALE_MS,
  });

  const massages = useMemo(
    () =>
      massagesRaw.map((m) => ({
        ...m,
        icon: MASSAGE_ICON_MAP[m.iconKey] ?? DEFAULT_MASSAGE_ICON,
      })),
    [massagesRaw]
  ) as Array<Massage & { icon: LucideIcon }>;

  const shouldAnimate = usePageFirstVisit("massage");
  const scope = useMassageAnimations(shouldAnimate);
  const pathname = usePathname();
  const { getStoredModalData, clearPendingModal } = usePendingModal();
  const openMassageModalRef = useRef<MassageBookingDialogHandle>(null);

  useEffect(() => {
    const stored = getStoredModalData();
    if (stored?.modalId !== MODAL_IDS.MASSAGE_BOOKING) return;
    const data = stored.data as MassageBookingDraftData | undefined;
    if (data?.massageId && massages.length === 0) return;
    if (data?.massageId && massages.length) {
      setSelectedMassage(massages.find((m) => m.id === data.massageId) ?? null);
    }
    const draft = data ?? {};
    setTimeout(() => {
      openMassageModalRef.current?.openTheModal();
      openMassageModalRef.current?.setData(draft);
      clearPendingModal();
    }, 0);
  }, [pathname, getStoredModalData, clearPendingModal, massages]);

  useEffect(() => {
    const t = setTimeout(() => setContentLoaded(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleBook = (massage: Massage) => {
    setSelectedMassage(massage);
    setDialogOpen(true);
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
                "url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="mm-nav relative z-10 container mx-auto px-4 text-center">
            <h1 className="mm-title font-display text-5xl md:text-7xl font-light text-primary-foreground mb-4">
              Massage Therapy
            </h1>
            <p className="mm-subtitle text-accent text-lg font-body max-w-xl mx-auto">
              Healing touch guided by ancient wisdom. Six therapeutic treatments designed to
              restore your body and spirit.
            </p>
            <Button
              className="mm-bookNowTop mt-6 gradient-purple text-primary-foreground border-0 hover:opacity-90"
              onClick={() =>
                document
                  .querySelector(".mm-grid")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Book Now
            </Button>
          </div>
        </section>

        {/* Treatments */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {!contentLoaded || massages.length === 0 ? (
              <>
                <Skeleton className="h-10 w-48 mx-auto mb-4" />
                <Skeleton className="h-4 w-96 mx-auto mb-14" />
                <div className="mm-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
                <div className="mm-membersBanner text-center mt-12">
                  <Skeleton className="h-4 w-72 mx-auto mb-4" />
                  <Skeleton className="h-4 w-40 mx-auto" />
                </div>
              </>
            ) : (
              <>
                <h2 className="mm-sectionTitle font-display text-4xl text-center mb-4">
                  Our Treatments
                </h2>
                <p className="mm-sectionIntro text-center text-muted-foreground font-body mb-14 max-w-lg mx-auto">
                  Each session is tailored to your needs. All treatments use organic, locally-sourced
                  mountain botanicals.
                </p>

                <div className="mm-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {massages.map((massage) => (
                    <div
                      key={massage.id}
                      className="mm-card mm-hoverLift group rounded-xl border border-border bg-card p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center">
                          <massage.icon className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="mm-price text-right">
                          <span className="text-xs text-muted-foreground font-body block">from</span>
                          <span className="mm-priceNum text-xl font-display font-semibold text-primary">
                            {massage.price30}
                          </span>
                        </div>
                      </div>

                      <h3 className="mm-cardTitle font-display text-2xl mb-3">
                        {massage.name}
                      </h3>
                      <p className="mm-cardDesc text-muted-foreground text-sm font-body mb-5 flex-1">
                        {massage.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {massage.benefits.map((b) => (
                          <span
                            key={b}
                            className="mm-benefit flex items-center gap-1 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full font-body"
                          >
                            <Check className="w-3 h-3" /> {b}
                          </span>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleBook(massage)}
                        className="mm-cardCta w-full gradient-purple text-primary-foreground border-0 hover:opacity-90"
                      >
                        Book Now
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mm-membersBanner text-center mt-12">
                  <p className="text-muted-foreground font-body text-sm mb-4">
                    Members enjoy up to 20% off all massage treatments
                  </p>
                  <Link
                    href="/memberships"
                    className="mm-membersCta inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all font-body text-sm"
                  >
                    View Memberships <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        <MassageBookingDialog
          ref={openMassageModalRef}
          massage={selectedMassage}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </Layout>
  );
};

export default MassagePage;
