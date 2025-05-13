import React from "react";
import HeroSection from "./HeroSection";
import Navbar from "./Navbar";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import InsightsSection from "./InsightsSection";
import ContactSection from "./ContactSection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <InsightsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
