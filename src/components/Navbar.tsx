import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Leaf, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import lotusLogo from "@/assets/lotus-life-logo.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Yoga", to: "/yoga" },
  { label: "Massage", to: "/massage" },
  { label: "Memberships", to: "/memberships" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleBookChoice = (path: string) => {
    setBookOpen(false);
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-purple">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={lotusLogo} alt="Lotus Life logo" className="w-8 h-8" />
              <span className="font-display text-2xl md:text-3xl font-semibold text-gradient-purple">
                Lotus Life
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    location.pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <a href="tel:+359883317785" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +359 883 317 785
              </a>
              <Link to="/my-account" className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all">
                <User className="w-5 h-5" />
              </Link>
              <Button className="gradient-purple text-primary-foreground border-0 hover:opacity-90" onClick={() => setBookOpen(true)}>
                Book Now
              </Button>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-purple border-t border-border overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === link.to
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 pt-2 border-t border-border">
                  <a href="tel:+359883317785" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    +359 883 317 785
                  </a>
                  <Button className="w-full mt-2 gradient-purple text-primary-foreground border-0" onClick={() => setBookOpen(true)}>
                    Book Now
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Book Now modal */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Book Now</DialogTitle>
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
              <p className="text-muted-foreground text-xs font-body">Classes, workshops & events</p>
            </button>
            <button
              onClick={() => handleBookChoice("/massage")}
              className="group rounded-xl border border-border bg-card p-6 text-center hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
            >
              <div className="w-14 h-14 rounded-full gradient-purple flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl mb-1">Massage</h3>
              <p className="text-muted-foreground text-xs font-body">Therapies & treatments</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
