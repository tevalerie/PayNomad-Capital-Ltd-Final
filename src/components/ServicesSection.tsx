import React from "react";
import ServiceCard from "./ServiceCard";
import { motion } from "framer-motion";
import { Bitcoin, RefreshCw, Globe, DollarSign } from "lucide-react";

interface ServicesProps {
  title?: string;
  subtitle?: string;
  services?: {
    title: string;
    description: string;
    icon: React.ReactNode;
    ctaText?: string;
  }[];
}

const ServicesSection = ({
  title = "Our Services",
  subtitle = "Discover our comprehensive range of financial services designed to meet your unique needs.",
  services = [
    {
      title: "Cryptocurrency",
      description:
        "Secure cryptocurrency & digital asset exchange with tailored investment solution options, expert guidance and market insights.",
      icon: <Bitcoin className="h-8 w-8" />,
      ctaText: "Explore Crypto",
    },
    {
      title: "Currency Exchange",
      description:
        "Competitive rates for all major currencies with fast, secure transactions and personalized service.",
      icon: <RefreshCw className="h-8 w-8" />,
      ctaText: "View Exchange Rates",
    },
    {
      title: "Remittance Services",
      description:
        "Move your money where it matters. Efficient international money transfers with competitive fees and excellent exchange rates.",
      icon: <Globe className="h-8 w-8" />,
      ctaText: "Send Money Now",
    },
    {
      title: "Money Services",
      description:
        "Comprehensive financial solutions with multi currency accounts and multiple payment options through our fast, proven, global payments infrastructure.",
      icon: <DollarSign className="h-8 w-8" />,
      ctaText: "Discover Solutions",
    },
  ],
}: ServicesProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section
      id="services"
      className="py-16 px-4 md:px-8 lg:px-16 bg-[#f8f9fa] shadow-inner"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center p-6 md:p-8 rounded-xl bg-[#f0f2f5] shadow-sm"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants}>
              <ServiceCard
                title={service.title}
                description={service.description}
                icon={service.icon}
                ctaText={service.ctaText}
                onClick={() => {
                  const contactSection = document.getElementById("contact");
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
