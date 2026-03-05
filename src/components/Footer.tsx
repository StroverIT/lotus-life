import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import LotusLogo from "./svg/LotusLogo";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <LotusLogo className="w-24 h-36" color="#fff" />
              <h3 className="font-display text-3xl font-semibold">Lotus Life</h3>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              breathe · move · create
            </p>
            <p className="text-primary-foreground/50 text-sm mt-4">
              Wellness studio in the heart of Bansko, Bulgaria.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Explore</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "Yoga Schedule", to: "/yoga" },
                { label: "Massage Therapies", to: "/massage" },
                { label: "Memberships", to: "/memberships" },
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/60">
              <a href="tel:+359883317785" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                +359 883 317 785
              </a>
              <a href="mailto:hello@lotuslife.bg" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                hello@lotuslife.bg
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Bansko, Bulgaria</span>
              </div>
            </div>
          </div>

          {/* Halls */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Our Studios</h4>
            <div className="flex flex-col gap-4 text-sm text-primary-foreground/60">
              <div>
                <p className="text-primary-foreground/80 font-medium">Pirin Hall</p>
                <p>Nayden Gerov 34, Str., Bansko</p>
              </div>
              <div>
                <p className="text-primary-foreground/80 font-medium">Rodopi Hall</p>
                <p>Nayden Gerov 36, Str., Bansko</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-accent/30 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary-foreground/10 hover:bg-accent/30 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Lotus Life. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
