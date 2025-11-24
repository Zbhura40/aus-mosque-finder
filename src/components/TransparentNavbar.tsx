import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, MessageSquare, User, MapPin, ChevronDown, Home, Menu, X, Star } from "lucide-react";

const TransparentNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false);
  const [isFeaturedMenuOpen, setIsFeaturedMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCityMenuOpen, setIsMobileCityMenuOpen] = useState(false);
  const [isMobileFeaturedMenuOpen, setIsMobileFeaturedMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const featuredDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileCityButtonRef = useRef<HTMLDivElement>(null);
  const mobileFeaturedButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCityMenuOpen(false);
      }
      if (featuredDropdownRef.current && !featuredDropdownRef.current.contains(event.target as Node)) {
        setIsFeaturedMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (mobileCityButtonRef.current && !mobileCityButtonRef.current.contains(event.target as Node)) {
        setIsMobileCityMenuOpen(false);
      }
      if (mobileFeaturedButtonRef.current && !mobileFeaturedButtonRef.current.contains(event.target as Node)) {
        setIsMobileFeaturedMenuOpen(false);
      }
    };

    if (isCityMenuOpen || isFeaturedMenuOpen || isMobileMenuOpen || isMobileCityMenuOpen || isMobileFeaturedMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCityMenuOpen, isFeaturedMenuOpen, isMobileMenuOpen, isMobileCityMenuOpen, isMobileFeaturedMenuOpen]);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        // Scrolling up or near top - show navbar
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide navbar
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const cities = [
    { name: "Sydney", path: "/city/sydney" },
    { name: "Melbourne", path: "/city/melbourne" },
    { name: "Brisbane", path: "/city/brisbane" },
    { name: "Perth", path: "/city/perth" },
    { name: "Adelaide", path: "/city/adelaide" },
  ];

  const featuredMosques = [
    { name: "Holland Park Mosque", path: "/featured/holland-park-mosque" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 py-3 md:py-4 bg-white shadow-md transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      {/* Desktop Layout */}
      <div className="hidden md:flex justify-between items-center gap-6 px-4 max-w-7xl mx-auto">
        {/* Site Name - Left Side */}
        <div className="flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="text-xl md:text-2xl font-light text-gray-900 hover:text-teal-600 transition-colors"
          >
            <span className="font-bold">findmymosque</span>.org
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-6">
        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all duration-300 ease-out"
          aria-label="Home"
        >
          <Home className="w-5 h-5 text-gray-900 group-hover:text-teal-600 transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors duration-300 relative">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>

        {/* Browse by City Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
            className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all duration-300 ease-out"
            aria-label="Browse Mosques by City"
          >
            <MapPin className="w-5 h-5 text-gray-900 group-hover:text-teal-600 transition-colors duration-300" />
            <span className="font-body text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors duration-300 relative">
              Browse by City
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-300 ease-out group-hover:w-full"></span>
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-900 group-hover:text-teal-600 transition-all duration-300 ${isCityMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isCityMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {cities.map((city, index) => (
                <button
                  key={city.path}
                  onClick={() => {
                    navigate(city.path);
                    setIsCityMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-4 py-3 text-gray-900 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200 ${
                    index !== cities.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <span className="font-body text-sm font-medium">{city.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Featured Mosques Dropdown */}
        <div className="relative" ref={featuredDropdownRef}>
          <button
            onClick={() => setIsFeaturedMenuOpen(!isFeaturedMenuOpen)}
            className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all duration-300 ease-out"
            aria-label="Featured Mosques"
          >
            <Star className="w-5 h-5 text-gray-900 group-hover:text-teal-600 transition-colors duration-300" />
            <span className="font-body text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors duration-300 relative">
              Featured Mosques
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-300 ease-out group-hover:w-full"></span>
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-900 group-hover:text-teal-600 transition-all duration-300 ${isFeaturedMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isFeaturedMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              {featuredMosques.map((mosque, index) => (
                <button
                  key={mosque.path}
                  onClick={() => {
                    navigate(mosque.path);
                    setIsFeaturedMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-4 py-3 text-gray-900 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200 ${
                    index !== featuredMosques.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <span className="font-body text-sm font-medium">{mosque.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Imam Profiles Button */}
        <button
          onClick={() => navigate("/imam-profiles")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all duration-300 ease-out"
          aria-label="Imam Profiles"
        >
          <User className="w-5 h-5 text-gray-900 group-hover:text-teal-600 transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors duration-300 relative">
            Imams
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>

        {/* FAQ Button */}
        <button
          onClick={() => navigate("/faq")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all duration-300 ease-out"
          aria-label="Frequently Asked Questions"
        >
          <HelpCircle className="w-5 h-5 text-gray-900 group-hover:text-teal-600 transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors duration-300 relative">
            FAQ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>

        {/* Feedback Button */}
        <button
          onClick={() => navigate("/feedback")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all duration-300 ease-out"
          aria-label="Submit Feedback"
        >
          <MessageSquare className="w-5 h-5 text-gray-900 group-hover:text-teal-600 transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-gray-900 group-hover:text-teal-600 transition-colors duration-300 relative">
            Feedback
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-4">
        {/* Site Name */}
        <div className="flex-shrink-0 mb-2">
          <button
            onClick={() => navigate("/")}
            className="text-xl font-light text-gray-900 hover:text-teal-600 transition-colors"
          >
            <span className="font-bold">findmymosque</span>.org
          </button>
        </div>

        {/* Mobile Controls Row */}
        <div className="flex justify-between items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>

          {/* Mobile "Browse by City" Button */}
          <div ref={mobileCityButtonRef} className="relative">
            <button
              onClick={() => {
                console.log('Button clicked! Current state:', isMobileCityMenuOpen);
                setIsMobileCityMenuOpen(!isMobileCityMenuOpen);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-all duration-300"
              aria-label="Browse by City"
            >
              <MapPin className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Browse by City</span>
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${isMobileCityMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu below button */}
            {isMobileCityMenuOpen && (
              <div
                className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border-4 border-teal-800 overflow-hidden"
                style={{zIndex: 999999}}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-teal-600 text-white px-6 py-3 font-serif font-medium text-lg">
                  Select a City
                </div>
                <div className="overflow-y-auto max-h-[60vh]">
                  {cities.map((city, index) => (
                    <a
                      key={city.path}
                      href={city.path}
                      onClick={() => {
                        setIsMobileCityMenuOpen(false);
                      }}
                      className={`block w-full text-left px-6 py-4 text-gray-900 hover:bg-teal-600 hover:text-white transition-colors font-medium text-base ${
                        index !== cities.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      {city.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
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

            <div ref={mobileFeaturedButtonRef} className="relative">
              <button
                onClick={() => {
                  setIsMobileFeaturedMenuOpen(!isMobileFeaturedMenuOpen);
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-architectural-shadow hover:bg-islamic-green/10 transition-colors border-b border-golden-beige/30"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-islamic-green" />
                  <span className="font-body text-sm font-medium">Featured Mosques</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-architectural-shadow transition-transform ${isMobileFeaturedMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Featured Mosques Dropdown */}
              {isMobileFeaturedMenuOpen && (
                <div className="bg-golden-beige/10 border-b border-golden-beige/30">
                  {featuredMosques.map((mosque) => (
                    <button
                      key={mosque.path}
                      onClick={() => {
                        navigate(mosque.path);
                        setIsMobileFeaturedMenuOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-8 py-3 text-architectural-shadow hover:bg-islamic-green/10 transition-colors"
                    >
                      <span className="font-body text-sm">{mosque.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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