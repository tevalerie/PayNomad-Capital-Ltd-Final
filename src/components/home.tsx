import React, { useRef } from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import InsightsSection from "./InsightsSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";

const Home: React.FC = () => {
  console.log("Home component rendering");

  // Simple refs for section navigation
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

  // Log component availability
  console.log("Component availability check:", {
    Navbar: !!Navbar,
    HeroSection: !!HeroSection,
    AboutSection: !!AboutSection,
    ServicesSection: !!ServicesSection,
    InsightsSection: !!InsightsSection,
    ContactSection: !!ContactSection,
    Footer: !!Footer,
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={scrollToSection} />

      <HeroSection
        companyName="PayNomad Capital"
        tagline="Empowering Your Finances"
      />

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
