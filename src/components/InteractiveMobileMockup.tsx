import { useState, useEffect } from 'react';
import { ChevronRight, MousePointer2 } from 'lucide-react';

type AnimationType = 'search' | 'queensland' | 'imams';

interface CursorPosition {
  x: number;
  y: number;
  visible: boolean;
}

const InteractiveMobileMockup = () => {
  const [activeAnimation, setActiveAnimation] = useState<AnimationType>('search');
  const [animationStep, setAnimationStep] = useState(0);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0, visible: false });

  // Auto-cycle through animations and steps
  useEffect(() => {
    setAnimationStep(0);
    const interval = setInterval(() => {
      setAnimationStep((prev) => {
        // For search tutorial: 4 steps (0, 1, 2, 3)
        if (activeAnimation === 'search') {
          if (prev >= 3) {
            // After completing search tutorial, move to Queensland
            setActiveAnimation('queensland');
            return 0;
          }
          return prev + 1;
        }
        // For Queensland page: 4 steps (0, 1, 2, 3)
        else if (activeAnimation === 'queensland') {
          if (prev >= 3) {
            // After completing Queensland, move to Imams
            setActiveAnimation('imams');
            return 0;
          }
          return prev + 1;
        }
        // For Imams page: 4 steps (0, 1, 2, 3)
        else if (activeAnimation === 'imams') {
          if (prev >= 3) {
            // After completing Imams, go back to Search
            setActiveAnimation('search');
            return 0;
          }
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [activeAnimation]);

  // Update cursor position based on animation step
  useEffect(() => {
    if (activeAnimation === 'search') {
      switch (animationStep) {
        case 1:
          // Step 1: Move to and click "10km" button
          setCursorPosition({ x: 140, y: 165, visible: true });
          break;
        case 2:
          // Step 2: Move to and click "Use Current Location" button
          setCursorPosition({ x: 140, y: 230, visible: true });
          break;
        case 3:
          // Step 3: Move to and click "Find Mosques" button
          setCursorPosition({ x: 140, y: 295, visible: true });
          break;
        default:
          // Step 0: Hide cursor
          setCursorPosition({ x: 0, y: 0, visible: false });
      }
    } else {
      setCursorPosition({ x: 0, y: 0, visible: false });
    }
  }, [animationStep, activeAnimation]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mobile Phone Frame */}
      <div className="relative" style={{ width: '280px', height: '560px' }}>
        {/* Phone Outer Frame - Thinner border */}
        <div className="absolute inset-0 bg-gray-900 rounded-[40px] shadow-2xl p-2">
          {/* Phone Screen */}
          <div className="relative w-full h-full bg-white rounded-[32px] overflow-hidden">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-white z-10 flex items-center justify-between px-6">
              <span className="text-xs font-medium text-gray-900">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 bg-gray-900 rounded-sm"></div>
              </div>
            </div>

            {/* Animation Content */}
            <div className="absolute top-6 left-0 right-0 bottom-0 overflow-hidden bg-gray-50">
              {/* Search Tutorial Animation */}
              {activeAnimation === 'search' && (
                <div className="w-full h-full p-4 flex flex-col animate-fadeIn">
                  {/* Step Indicators */}
                  <div className="mb-4 space-y-2">
                    <div className={`transition-all duration-500 ${animationStep === 1 ? 'opacity-100 scale-105' : 'opacity-30 scale-100'}`}>
                      <div className={`text-xs font-medium px-3 py-2 rounded-lg ${
                        animationStep === 1 ? 'text-white bg-teal-600 shadow-md' : 'text-teal-700 bg-teal-50'
                      }`}>
                        Step 1: Select Search Radius
                      </div>
                    </div>
                    <div className={`transition-all duration-500 ${animationStep === 2 ? 'opacity-100 scale-105' : 'opacity-30 scale-100'}`}>
                      <div className={`text-xs font-medium px-3 py-2 rounded-lg ${
                        animationStep === 2 ? 'text-white bg-teal-600 shadow-md' : 'text-teal-700 bg-teal-50'
                      }`}>
                        Step 2: Choose Location Method
                      </div>
                    </div>
                    <div className={`transition-all duration-500 ${animationStep === 3 ? 'opacity-100 scale-105' : 'opacity-30 scale-100'}`}>
                      <div className={`text-xs font-medium px-3 py-2 rounded-lg ${
                        animationStep === 3 ? 'text-white bg-teal-600 shadow-md' : 'text-teal-700 bg-teal-50'
                      }`}>
                        Step 3: Click Find Mosques
                      </div>
                    </div>
                  </div>

                  {/* Search Interface Mockup */}
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 p-3 space-y-3">
                    {/* Radius Buttons */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-medium text-gray-700">Search Radius</div>
                      <div className="flex gap-1.5">
                        <div className="flex-1 text-[9px] py-1.5 rounded border text-center bg-white border-gray-300 text-gray-700">
                          3km
                        </div>
                        <div className={`flex-1 text-[9px] py-1.5 rounded border text-center transition-all duration-500 ${
                          animationStep === 1 ? 'bg-teal-600 text-white border-teal-600 scale-105 shadow-md' : 'bg-white border-gray-300 text-gray-700'
                        }`}>
                          10km
                        </div>
                        <div className="flex-1 text-[9px] py-1.5 rounded border text-center bg-white border-gray-300 text-gray-700">
                          25-50km
                        </div>
                      </div>
                    </div>

                    {/* Location Buttons */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-medium text-gray-700">Location Method</div>
                      <div className={`text-[9px] py-2 rounded border text-center transition-all duration-500 ${
                        animationStep === 2 ? 'bg-gray-900 text-white border-gray-900 scale-105 shadow-md' : 'bg-white border-gray-300 text-gray-700'
                      }`}>
                        Use Current Location
                      </div>
                    </div>

                    {/* Find Mosques Button */}
                    <div className={`text-[10px] py-2.5 rounded text-center font-medium transition-all duration-500 ${
                      animationStep === 3 ? 'bg-teal-600 text-white scale-105 shadow-md' : 'bg-gray-300 text-gray-500'
                    }`}>
                      Find Mosques
                    </div>
                  </div>

                </div>
              )}

              {/* Animated Cursor - Visible for all search steps */}
              {cursorPosition.visible && (
                <div
                  className="absolute pointer-events-none z-50 transition-all duration-700 ease-in-out"
                  style={{
                    left: `${cursorPosition.x}px`,
                    top: `${cursorPosition.y}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <MousePointer2
                    className="w-7 h-7 text-gray-900 drop-shadow-lg"
                    fill="white"
                    strokeWidth={2}
                  />
                  {/* Click effect indicator */}
                  <div className="absolute top-0 left-0 w-7 h-7 rounded-full bg-teal-400 opacity-30 animate-ping"></div>
                </div>
              )}

              {/* Queensland Page Animation */}
              {activeAnimation === 'queensland' && (
                <div className="w-full h-full relative animate-fadeIn">
                  <div
                    className="absolute w-full transition-all duration-1000 ease-in-out"
                    style={{
                      transform: `translateY(-${animationStep * 150}px)`
                    }}
                  >
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 p-3">
                      <h1 className="text-sm font-serif font-medium text-gray-900">Queensland Masjid Directory</h1>
                    </div>

                    {/* Filter Buttons */}
                    <div className="bg-white p-3 space-y-2">
                      <div className="flex gap-2 overflow-x-auto">
                        {['All', 'West', 'North', 'South', 'CBD'].map((region) => (
                          <div key={region} className="text-[9px] px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 whitespace-nowrap">
                            {region}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mosque Cards */}
                    <div className="bg-gray-50 p-3 space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-1">
                          <div className="text-[11px] font-medium text-gray-900">Mosque Name {i}</div>
                          <div className="text-[8px] text-gray-600">123 Street Address, Brisbane QLD</div>
                          <div className="flex items-center gap-1">
                            <div className="text-[8px] text-amber-600">★ 4.5</div>
                            <div className="text-[8px] text-green-600">• Open</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="bg-white border-t border-gray-200 p-4 text-center">
                      <div className="text-[10px] text-gray-600">Find My Mosque Australia</div>
                    </div>
                  </div>

                  {/* Scroll Indicator */}
                  <div className="absolute bottom-4 right-4 bg-teal-600 text-white rounded-full p-1.5 shadow-lg animate-bounce">
                    <ChevronRight className="w-3 h-3 transform rotate-90" />
                  </div>
                </div>
              )}

              {/* Imams Page Animation */}
              {activeAnimation === 'imams' && (
                <div className="w-full h-full relative animate-fadeIn">
                  <div
                    className="absolute w-full transition-all duration-1000 ease-in-out"
                    style={{
                      transform: `translateY(-${animationStep * 150}px)`
                    }}
                  >
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 p-3">
                      <h1 className="text-sm font-serif font-medium text-gray-900">Find an Imam Near You</h1>
                    </div>

                    {/* Imam Cards */}
                    <div className="bg-gray-50 p-3 space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-gray-200 p-2.5 space-y-1.5">
                          <div className="flex items-start gap-2">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-medium text-xs">
                              I{i}
                            </div>
                            <div className="flex-1">
                              <div className="text-[11px] font-medium text-gray-900">Imam Name {i}</div>
                              <div className="text-[8px] text-gray-600">Specialization Area</div>
                              <div className="text-[8px] text-teal-600">Sydney, NSW</div>
                            </div>
                          </div>
                          <div className="text-[8px] py-1 px-2 bg-teal-50 text-teal-700 rounded text-center">
                            Contact
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="bg-white border-t border-gray-200 p-4 text-center">
                      <div className="text-[10px] text-gray-600">Find My Mosque Australia</div>
                    </div>
                  </div>

                  {/* Scroll Indicator */}
                  <div className="absolute bottom-4 right-4 bg-teal-600 text-white rounded-full p-1.5 shadow-lg animate-bounce">
                    <ChevronRight className="w-3 h-3 transform rotate-90" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-3xl"></div>
        </div>
      </div>

      {/* Circular Toggle Buttons - Positioned below phone */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setActiveAnimation('search')}
          className={`w-3 h-3 rounded-full transition-all duration-500 ease-in-out ${
            activeAnimation === 'search'
              ? 'bg-teal-600 scale-125 shadow-lg'
              : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
          }`}
          aria-label="Search Tutorial"
          title="Search Tutorial"
        />
        <button
          onClick={() => setActiveAnimation('queensland')}
          className={`w-3 h-3 rounded-full transition-all duration-500 ease-in-out ${
            activeAnimation === 'queensland'
              ? 'bg-teal-600 scale-125 shadow-lg'
              : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
          }`}
          aria-label="Queensland Page"
          title="Queensland Page"
        />
        <button
          onClick={() => setActiveAnimation('imams')}
          className={`w-3 h-3 rounded-full transition-all duration-500 ease-in-out ${
            activeAnimation === 'imams'
              ? 'bg-teal-600 scale-125 shadow-lg'
              : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
          }`}
          aria-label="Imams Page"
          title="Imams Page"
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default InteractiveMobileMockup;
