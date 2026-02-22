import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-studio.jpg";
import logoImage from "@/assets/lotus-life-logo.svg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Lotus Life yoga studio interior" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-warm-white/70 via-warm-white/50 to-warm-white/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.img 
              src={logoImage} 
              alt="Lotus Life logo" 
              className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Curved Text - Embrace Your Inner Harmony */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-charcoal-light text-lg tracking-[0.3em] uppercase mb-4 font-body"
          >
            Embrace Your Inner Harmony
          </motion.p>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display text-6xl md:text-8xl font-light text-charcoal mb-6"
          >
            Lotus Life
          </motion.h1>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-8 text-charcoal-light text-lg tracking-widest font-light mb-8"
          >
            <span>breathe</span>
            <span className="w-1 h-1 rounded-full bg-sage" />
            <span>move</span>
            <span className="w-1 h-1 rounded-full bg-sage" />
            <span>create</span>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex items-center gap-2 text-charcoal-light mb-10"
          >
            <MapPin className="w-4 h-4" />
            <span className="font-body">Bansko, Bulgaria</span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button variant="hero" size="xl" asChild>
              <a href="#schedule">View Schedule</a>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="#pricing">Memberships</a>
            </Button>
          </motion.div>
        </motion.div>

        {/* Studio Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-20 grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
        >
          <div className="bg-cream/80 backdrop-blur-sm rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-xl text-charcoal mb-2">Pirin Hall</h3>
            <p className="text-charcoal-light text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nayden Gerov 34, Str.
            </p>
          </div>
          <div className="bg-cream/80 backdrop-blur-sm rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-xl text-charcoal mb-2">Rodopi Hall</h3>
            <p className="text-charcoal-light text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Nayden Gerov 36, Str.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-sage/50 rounded-full flex justify-center p-2"
        >
          <div className="w-1 h-2 bg-sage rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
