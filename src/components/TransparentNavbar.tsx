import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, MessageSquare, User, MapPin, ChevronDown, Home } from "lucide-react";

const TransparentNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityMenuOpen(false);
      }
    };

    if (isCityMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCityMenuOpen]);

  const cities = [
    { name: "New South Wales", path: "/mosques-sydney" },
    { name: "Victoria", path: "/mosques-melbourne" },
    { name: "Queensland", path: "/mosques-brisbane" },
    { name: "Western Australia", path: "/mosques-perth" },
    { name: "South Australia", path: "/mosques-adelaide" },
    { name: "Tasmania", path: "/mosques-tasmania" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm">
      <div className="flex justify-end items-center gap-6 max-w-7xl mx-auto">
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
    </nav>
  );
};

export default TransparentNavbar;