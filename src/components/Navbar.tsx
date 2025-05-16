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
    // Check if we're on the home page
    const isHomePage = window.location.pathname === "/";

    if (isHomePage) {
      // If on home page, just navigate to the section
      onNavigate(sectionId);
    } else {
      // If not on home page, navigate to home page with section hash
      window.location.href = `/#${sectionId}`;
    }

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
        <a href="/" className="text-white font-bold text-xl md:text-2xl">
          PayNomad Capital
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
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
            href="/newsignup"
            className="text-white bg-[#0077be] hover:bg-[#0066a6] px-4 py-2 rounded transition-colors duration-200 font-medium"
          >
            REGISTER
          </a>
          <a
            href="https://ebank.paynomadcapital.com/login"
            className="text-[#0077be] border border-[#0077be] px-4 py-2 rounded transition-colors duration-200 font-medium hover:bg-[#0077be] hover:text-white"
          >
            SIGN IN
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
              href="/newsignup"
              className="text-white bg-[#0077be] hover:bg-[#0066a6] py-2 px-4 rounded text-center font-medium"
            >
              REGISTER
            </a>
            <a
              href="https://ebank.paynomadcapital.com/login"
              className="text-[#0077be] border border-[#0077be] py-2 px-4 rounded text-center font-medium hover:bg-[#0077be] hover:text-white"
            >
              SIGN IN
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
