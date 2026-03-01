"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Schedule from "@/components/Schedule";
import Events from "@/components/Events";
import Pricing from "@/components/Pricing";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Schedule />
      <Events />
      <Pricing />
      <About />
      <Footer />
    </div>
  );
}
