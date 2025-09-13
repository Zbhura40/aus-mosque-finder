import React from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, MessageSquare, User } from "lucide-react";

const TransparentNavbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-transparent">
      <div className="flex justify-end items-center gap-6 max-w-7xl mx-auto">
        {/* FAQ Button */}
        <button
          onClick={() => navigate("/faq")}
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-burnt-ochre/20 transition-all duration-300 ease-out"
          aria-label="Frequently Asked Questions"
        >
          <HelpCircle className="w-5 h-5 text-warm-ivory/80 group-hover:text-burnt-ochre transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-warm-ivory/80 group-hover:text-burnt-ochre transition-colors duration-300 relative">
            FAQ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-burnt-ochre transition-all duration-300 ease-out group-hover:w-full"></span>
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
          className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-olive-green/20 transition-all duration-300 ease-out"
          aria-label="Submit Feedback"
        >
          <MessageSquare className="w-5 h-5 text-warm-ivory/80 group-hover:text-olive-green transition-colors duration-300" />
          <span className="font-body text-sm font-medium text-warm-ivory/80 group-hover:text-olive-green transition-colors duration-300 relative">
            Feedback
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-olive-green transition-all duration-300 ease-out group-hover:w-full"></span>
          </span>
        </button>
      </div>
    </nav>
  );
};

export default TransparentNavbar;