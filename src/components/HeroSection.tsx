import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface HeroSectionProps {
  companyName?: string;
  tagline?: string;
  onScrollDown?: () => void;
}

const HeroSection = ({
  companyName = "PayNomad Capital",
  tagline = "Empowering Your Finances",
  onScrollDown = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  },
}: HeroSectionProps) => {
  const [gradientPosition, setGradientPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[800px] bg-[#2c3e50] overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `linear-gradient(135deg, #2c3e50 ${gradientPosition}%, #0077be ${gradientPosition + 40}%, #2c3e50 ${gradientPosition + 80}%)`,
          backgroundSize: "400% 400%",
          transition: "background-position 0.5s ease",
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
            {companyName}
          </h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="max-w-2xl mx-auto mb-8 text-xl font-bold md:text-3xl text-blue-100">
              {tagline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#services"
              className="px-8 py-3 text-lg font-medium text-white transition-colors rounded-md bg-[#0077be] hover:bg-[#005d93] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 w-full sm:w-auto"
            >
              Our Services
            </a>
            <a
              href="#contact"
              className="px-8 py-3 text-lg font-medium text-[#0077be] bg-white transition-colors rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 w-full sm:w-auto border border-gray-300"
            >
              Contact Us
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Down arrow */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
        onClick={onScrollDown}
      >
        <ChevronDown size={36} className="text-white" />
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#2c3e50] to-transparent" />

      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500 opacity-10 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-blue-300 opacity-10 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default HeroSection;
