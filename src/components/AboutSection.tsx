import React from "react";
import { motion } from "framer-motion";
import { Award, Shield, Lightbulb, Users } from "lucide-react";

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  values?: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
  }>;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  title = "About PayNomad Capital Ltd.",
  subtitle = "Our Mission",
  description = "PayNomad Capital Ltd. is a premier financial services provider specializing in innovative solutions for the modern global citizen. With decades of combined experience, our team of financial experts is dedicated to delivering exceptional service and personalized strategies to meet your unique financial needs.",
  values = [
    {
      title: "Excellence",
      description:
        "We strive for excellence in every aspect of our service, ensuring the highest standards of quality and professionalism.",
      icon: <Award className="w-8 h-8 text-[#faf4eb]" />,
    },
    {
      title: "Integrity",
      description:
        "We operate with unwavering integrity, maintaining transparency and ethical practices in all our dealings.",
      icon: <Shield className="w-8 h-8 text-[#faf4eb]" />,
    },
    {
      title: "Innovation",
      description:
        "We embrace innovation, constantly seeking new solutions to enhance our services and meet evolving financial needs.",
      icon: <Lightbulb className="w-8 h-8 text-[#faf4eb]" />,
    },
    {
      title: "Client-Centric",
      description:
        "We place our clients at the center of everything we do, tailoring our services to meet their specific requirements and goals.",
      icon: <Users className="w-8 h-8 text-[#faf4eb]" />,
    },
  ],
}) => {
  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-4xl font-bold tracking-tight text-[#2c3e50] mb-4">
            {title}
          </h2>
          <h3 className="text-xl font-medium text-[#0077be] mb-4">
            {subtitle}
          </h3>
          <div className="w-24 h-1 bg-[#0077be] mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-[#0077be]/10 p-8 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 group"
            >
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#0077be] text-[#faf4eb]">
                  {value.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#2c3e50] mb-3 text-center">
                {value.title}
              </h3>
              <p className="text-gray-600 text-center">{value.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-32 p-8 bg-gradient-to-r from-[#2c3e50] to-[#0077be] rounded-lg text-white text-center"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Expertise
          </h3>
          <p className="max-w-2xl mx-auto">
            With over 20 years of experience in the financial industry, our team
            brings unparalleled knowledge and insight to every client
            relationship. We combine traditional financial wisdom with
            innovative approaches to deliver exceptional results.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
