import React, { useRef } from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import InsightsSection from "./InsightsSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import { motion } from "framer-motion";

const Home: React.FC = () => {
  const aboutRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (sectionId: string) => {
    const sectionMap: Record<string, React.RefObject<HTMLDivElement>> = {
      about: aboutRef,
      services: servicesRef,
      insights: insightsRef,
      contact: contactRef,
    };

    const ref = sectionMap[sectionId];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={scrollToSection} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <HeroSection
          companyName="PayNomad Capital"
          tagline="Empowering Your Finances"
        />
      </motion.div>

      <div ref={aboutRef}>
        <AboutSection />
      </div>

      <div ref={servicesRef}>
        <ServicesSection />
      </div>

      <div ref={insightsRef}>
        <InsightsSection />
      </div>

      <div ref={contactRef}>
        <ContactSection backgroundColor="#faf4eb" />
      </div>

      <Footer />
    </div>
  );
};

export default Home;
