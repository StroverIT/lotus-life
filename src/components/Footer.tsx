import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Instagram, Facebook, Clock } from "lucide-react";

const LotusIcon = () => (
  <svg viewBox="0 0 80 80" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M40 15 C40 15, 30 30, 30 45 C30 55, 35 60, 40 60 C45 60, 50 55, 50 45 C50 30, 40 15, 40 15Z" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M25 25 C25 25, 20 40, 25 50 C28 55, 35 55, 40 50" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M55 25 C55 25, 60 40, 55 50 C52 55, 45 55, 40 50" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M15 35 C15 35, 15 48, 25 52 C30 54, 38 50, 40 45" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
    <path 
      d="M65 35 C65 35, 65 48, 55 52 C50 54, 42 50, 40 45" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none"
    />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-charcoal text-cream">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <LotusIcon />
              <span className="font-display text-2xl">Lotus Life</span>
            </div>
            <p className="text-cream/70 text-sm leading-relaxed mb-4">
              breathe • move • create
            </p>
            <p className="text-cream/60 text-sm">
              Your sanctuary for holistic wellness in the heart of Bansko, Bulgaria.
            </p>
          </motion.div>

          {/* Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <h4 className="font-display text-lg mb-4">Our Studios</h4>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-1">Pirin Hall</p>
                <p className="text-cream/60 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Nayden Gerov 34, Str.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Rodopi Hall</p>
                <p className="text-cream/60 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Nayden Gerov 36, Str.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h4 className="font-display text-lg mb-4">Contact</h4>
            <div className="space-y-3">
              <a
                href="tel:+359883317785"
                className="text-cream/80 text-sm flex items-center gap-2 hover:text-cream transition-colors"
              >
                <Phone className="w-4 h-4" />
                +359 883 317 785
              </a>
              <p className="text-cream/60 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pre-booking required
              </p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h4 className="font-display text-lg mb-4">Quick Links</h4>
            <div className="space-y-2">
              <a
                href="#schedule"
                className="block text-cream/70 text-sm hover:text-cream transition-colors"
              >
                Schedule
              </a>
              <a
                href="#pricing"
                className="block text-cream/70 text-sm hover:text-cream transition-colors"
              >
                Memberships
              </a>
              <a
                href="#about"
                className="block text-cream/70 text-sm hover:text-cream transition-colors"
              >
                About Us
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cream/10 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-cream/50 text-sm">
            © {currentYear} Lotus Life. All rights reserved.
          </p>
          <p className="text-cream/50 text-sm">
            Bansko, Bulgaria
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
