"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Phone, User, LogIn, Shield } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!navRef.current) return;
      gsap.from(navRef.current, {
        y: -100,
        duration: 0.6,
        ease: "power2.out",
      });
    },
    []
  );

  useGSAP(
    () => {
      const menu = mobileMenuRef.current;
      if (!menu) return;
      if (isMobileMenuOpen) {
        gsap.to(menu, {
          opacity: 1,
          height: "auto",
          duration: 0.3,
          ease: "power2.out",
          overflow: "hidden",
        });
      } else {
        gsap.to(menu, {
          opacity: 0,
          height: 0,
          duration: 0.25,
          ease: "power2.in",
          overflow: "hidden",
        });
      }
    },
    { dependencies: [isMobileMenuOpen] }
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#schedule", label: "Schedule" },
    { href: "#pricing", label: "Memberships" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-warm-white/95 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <a href="#" className="flex items-center gap-2 text-charcoal">
            <Image src="/lotus-life-logo.svg" alt="Lotus Life logo" width={48} height={48} className="object-contain drop-shadow-md" />
            <span className="font-display text-xl font-medium">Lotus Life</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-charcoal-light hover:text-sage transition-colors font-body text-sm"
              >
                {link.label}
              </a>
            ))}
            {status !== "loading" && (
              session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="font-body text-charcoal hover:bg-sage-light">
                      <User className="w-4 h-4" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-body">
                    <DropdownMenuItem asChild>
                      <Link href="/panel">Panel</Link>
                    </DropdownMenuItem>
                    {(session.user as { role?: string }).role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => signOut()}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="sage-ghost" size="sm" asChild>
                  <Link href="/auth/signin" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </Link>
                </Button>
              )
            )}
            <Button variant="sage" size="sm" asChild>
              <a href="tel:+359883317785" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Book Now
              </a>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-charcoal p-2"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        className="md:hidden bg-warm-white border-t border-border"
        style={{ height: 0, opacity: 0 }}
      >
        <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-charcoal hover:text-sage transition-colors font-body py-2"
            >
              {link.label}
            </a>
          ))}
          {status !== "loading" && (
            session ? (
              <>
                <Link
                  href="/panel"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-charcoal hover:text-sage transition-colors font-body py-2 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Account
                </Link>
                {(session.user as { role?: string }).role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-charcoal hover:text-sage transition-colors font-body py-2 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                  className="text-charcoal hover:text-sage transition-colors font-body py-2 text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Button variant="sage-ghost" asChild className="mt-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
              </Button>
            )
          )}
          <Button variant="sage" asChild className="mt-2">
            <a href="tel:+359883317785" className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Book Now
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
