import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Schedule from "@/components/Schedule";
import Pricing from "@/components/Pricing";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Schedule />
      <Pricing />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
