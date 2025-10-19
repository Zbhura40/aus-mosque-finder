import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, MessageSquare, User, MapPin, ChevronDown, Home, Menu, X, Store } from "lucide-react";

const TransparentNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isCityMenuOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCityMenuOpen, isMobileMenuOpen]);

  const cities = [
    { name: "New South Wales", path: "/mosques-sydney" },
    { name: "Victoria", path: "/mosques-melbourne" },
    { name: "Queensland", path: "/mosques-brisbane" },
    { name: "Western Australia", path: "/mosques-perth" },
    { name: "South Australia", path: "/mosques-adelaide" },
    { name: "Tasmania", path: "/mosques-tasmania" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm">
      <div className="flex justify-between md:justify-end items-center gap-3 md:gap-6 max-w-7xl mx-auto">
        {/* Mobile Menu Button - Only visible on mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-transparent hover:bg-islamic-green/20 transition-all"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-warm-ivory" />
          ) : (
            <Menu className="w-6 h-6 text-warm-ivory" />
          )}
        </button>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-islamic-green/20 transition-all duration-300 ease-out"
          aria-label="Home"
        >
          <Home className="w-5 h-5 text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300 relative">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-green transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>

        {/* Browse by State Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
            className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-islamic-green/20 transition-all duration-300 ease-out"
            aria-label="Browse Mosques by State"
          >
            <MapPin className="w-5 h-5 text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300" />
            <span className="font-body text-sm font-medium text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300 relative">
              Browse by State
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-green transition-all duration-300 ease-out group-hover:w-full"></span>
            </span>
            <ChevronDown className={`w-4 h-4 text-warm-ivory/80 group-hover:text-islamic-green transition-all duration-300 ${isCityMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isCityMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-warm-ivory/95 backdrop-blur-md rounded-lg shadow-2xl border border-golden-beige/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {cities.map((city, index) => (
                <button
                  key={city.path}
                  onClick={() => {
                    navigate(city.path);
                    setIsCityMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-4 py-3 text-architectural-shadow hover:bg-golden-amber/20 transition-colors duration-200 ${
                    index !== cities.length - 1 ? 'border-b border-golden-beige/30' : ''
                  }`}
                >
                  <span className="font-body text-sm font-medium">{city.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Halal Supermarkets Button */}
        <button
          onClick={() => navigate("/halal-supermarkets")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-islamic-green/20 transition-all duration-300 ease-out"
          aria-label="Halal Supermarkets"
        >
          <Store className="w-5 h-5 text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300 relative">
            Halal Markets
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-green transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>

        {/* FAQ Button */}
        <button
          onClick={() => navigate("/faq")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-islamic-green/20 transition-all duration-300 ease-out"
          aria-label="Frequently Asked Questions"
        >
          <HelpCircle className="w-5 h-5 text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300 relative">
            FAQ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-green transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>

        {/* Imam Profiles Button */}
        <button
          onClick={() => navigate("/imam-profiles")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-islamic-green/20 transition-all duration-300 ease-out"
          aria-label="Imam Profiles"
        >
          <User className="w-5 h-5 text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300 relative">
            Imams
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-green transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>

        {/* Feedback Button */}
        <button
          onClick={() => navigate("/feedback")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-islamic-green/20 transition-all duration-300 ease-out"
          aria-label="Submit Feedback"
        >
          <MessageSquare className="w-5 h-5 text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-warm-ivory/80 group-hover:text-islamic-green transition-colors duration-300 relative">
            Feedback
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-islamic-green transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden absolute top-full left-0 right-0 mt-2 mx-4 bg-warm-ivory/95 backdrop-blur-md rounded-lg shadow-2xl border border-golden-beige/40 overflow-hidden"
          >
            <button
              onClick={() => {
                navigate("/");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-architectural-shadow hover:bg-islamic-green/10 transition-colors border-b border-golden-beige/30"
            >
              <Home className="w-5 h-5 text-islamic-green" />
              <span className="font-body text-sm font-medium">Home</span>
            </button>

            {/* Browse by State in Mobile Menu */}
            <div className="border-b border-golden-beige/30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCityMenuOpen(!isCityMenuOpen);
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-architectural-shadow hover:bg-islamic-green/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-islamic-green" />
                  <span className="font-body text-sm font-medium">Browse by State</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCityMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCityMenuOpen && (
                <div className="bg-gray-50">
                  {cities.map((city) => (
                    <button
                      key={city.path}
                      onClick={() => {
                        setIsCityMenuOpen(false);
                        setIsMobileMenuOpen(false);
                        setTimeout(() => navigate(city.path), 0);
                      }}
                      className="block w-full text-left px-4 py-2.5 pl-12 text-architectural-shadow hover:bg-islamic-green/10 transition-colors text-sm"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                navigate("/halal-supermarkets");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-architectural-shadow hover:bg-islamic-green/10 transition-colors border-b border-golden-beige/30"
            >
              <Store className="w-5 h-5 text-islamic-green" />
              <span className="font-body text-sm font-medium">Halal Markets</span>
            </button>

            <button
              onClick={() => {
                navigate("/faq");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-architectural-shadow hover:bg-islamic-green/10 transition-colors border-b border-golden-beige/30"
            >
              <HelpCircle className="w-5 h-5 text-islamic-green" />
              <span className="font-body text-sm font-medium">FAQ</span>
            </button>

            <button
              onClick={() => {
                navigate("/imam-profiles");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-architectural-shadow hover:bg-islamic-green/10 transition-colors border-b border-golden-beige/30"
            >
              <User className="w-5 h-5 text-islamic-green" />
              <span className="font-body text-sm font-medium">Imam Profiles</span>
            </button>

            <button
              onClick={() => {
                navigate("/feedback");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-architectural-shadow hover:bg-islamic-green/10 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-islamic-green" />
              <span className="font-body text-sm font-medium">Feedback</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TransparentNavbar;