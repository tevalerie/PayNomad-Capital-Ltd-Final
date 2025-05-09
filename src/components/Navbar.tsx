import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onNavigate?: (section: string) => void;
}

const Navbar = ({ onNavigate = () => {} }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "About Us", id: "about" },
    { label: "Services", id: "services" },
    { label: "Insights", id: "insights" },
    { label: "Contact", id: "contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (sectionId: string) => {
    onNavigate(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-[#2c3e50]",
        isScrolled ? "py-3 shadow-lg" : "py-5",
      )}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a
          href="https://paynomadcapitalltd.com"
          className="text-white font-bold text-xl md:text-2xl"
        >
          PayNomad Capital
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className="text-white hover:text-[#0077be] transition-colors duration-200 font-medium"
            >
              {item.label}
            </button>
          ))}
          <a
            href="/register"
            className="text-[#6B96C3] border border-[#6B96C3] hover:bg-[#6B96C3] hover:text-white transition-colors duration-200 rounded-md px-6 py-2 font-medium"
          >
            REGISTER
          </a>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-[#3a506b]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#2c3e50] shadow-lg">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="text-white hover:text-[#0077be] transition-colors duration-200 font-medium text-left py-2 border-b border-[#3a506b]"
              >
                {item.label}
              </button>
            ))}
            <a
              href="/register"
              className="text-[#6B96C3] hover:text-[#0077be] transition-colors duration-200 font-medium text-left py-2 border-b border-[#3a506b] last:border-0"
            >
              REGISTER
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
