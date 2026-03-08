"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Leaf, Heart, User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LotusLogo from "./svg/LotusLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { staggerChildren } from "@/lib/animations";
import { useBookNowPulse } from "@/hooks/useBookNowPulse";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Yoga", to: "/yoga" },
  { label: "Massage", to: "/massage" },
  { label: "Memberships", to: "/memberships" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

/** Only animate navbar on first load; skip on client-side navigation (Layout remounts per page). */
let hasNavbarAnimated = false;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useBookNowPulse();

  useEffect(() => {
    if (hasNavbarAnimated) return;
    hasNavbarAnimated = true;
    staggerChildren(
      shellRef.current,
      {
        y: 10,
        duration: 0.4,
        stagger: 0.05,
      },
      prefersReducedMotion,
    );
  }, [prefersReducedMotion]);

  useEffect(() => {
    const menu = menuRef.current;

    if (prefersReducedMotion) {
      setIsMenuVisible(isOpen);
      return;
    }

    if (!menu) return;

    gsap.killTweensOf(menu);

    if (isOpen) {
      gsap.fromTo(
        menu,
        { height: 0, opacity: 0, y: -8 },
        {
          height: "auto",
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(menu, {
        height: 0,
        opacity: 0,
        y: -8,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setIsMenuVisible(false);
        },
      });
    }
  }, [isOpen, prefersReducedMotion]);

  const toggleMobileMenu = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsMenuVisible(true);
      setIsOpen(true);
    }
  };

  const handleBookChoice = (path: string) => {
    setBookOpen(false);
    setIsOpen(false);
    router.push(path);
  };

  const user = session?.user as (typeof session)["user"] & { role?: "USER" | "ADMIN"; guest?: boolean } | undefined;
  const isLoading = status === "loading";
  const isLoggedIn = !!user;

  const isAdmin = isLoggedIn && user?.role === "ADMIN";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <nav className="ll-nav fixed top-0 left-0 right-0 z-50 glass-purple">
        <div className="container mx-auto px-4">
          <div ref={shellRef} className="flex items-center justify-between h-16 md:h-20 gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <LotusLogo className="w-24 h-36" />
              <span className="font-display text-2xl md:text-3xl font-semibold text-gradient-purple -ml-5">
                Lotus Life
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {!isLoading && (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  )}

                  {!isLoggedIn ? (
                    <Link href="/login">
                      <Button variant="outline">Login</Button>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/my-account"
                        className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all"
                        aria-label="My account"
                      >
                        <User className="w-5 h-5" />
                      </Link>
                      <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                        <LogOut className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                </>
              )}

              <Button
                className="ll-bookNow gradient-purple text-primary-foreground border-0 hover:opacity-90"
                onClick={() => setBookOpen(true)}
              >
                Book Now
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
            onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuVisible && (
          <div
            ref={menuRef}
            className="lg:hidden bg-white border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-border">
                {!isLoading && (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    {!isLoggedIn ? (
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Login
                      </Link>
                    ) : (
                      <div className="flex gap-2 px-4 py-2">
                        <Link href="/my-account" onClick={() => setIsOpen(false)} className="flex-1">
                          <Button variant="outline" className="w-full">
                            My account
                          </Button>
                        </Link>
                        <Button variant="outline" onClick={handleLogout} className="shrink-0">
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
                <Button
                  className="ll-bookNow w-full mt-2 gradient-purple text-primary-foreground border-0"
                  onClick={() => setBookOpen(true)}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Book Now modal */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Book Now
            </DialogTitle>
            <DialogDescription className="font-body">
              What would you like to book?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => handleBookChoice("/yoga")}
              className="group rounded-xl border border-border bg-card p-6 text-center hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className="w-14 h-14 rounded-full gradient-purple flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-1">Yoga</h3>
              <p className="text-muted-foreground text-xs font-body">
                Classes, workshops & events
              </p>
            </button>
            <button
              onClick={() => handleBookChoice("/massage")}
              className="group rounded-xl border border-border bg-card p-6 text-center hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className="w-14 h-14 rounded-full gradient-purple flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-1">Massage</h3>
              <p className="text-muted-foreground text-xs font-body">
                Therapies & treatments
              </p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
