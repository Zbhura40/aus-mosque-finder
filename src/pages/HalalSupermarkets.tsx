import React from 'react';
import { MapPin, Star, CheckCircle, Store, Clock, Sparkles } from 'lucide-react';

const HalalSupermarkets = () => {
  // Coming Soon - No data yet
  const supermarkets = [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Store className="w-10 h-10 text-teal-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Halal-Friendly Supermarkets
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover supermarkets with dedicated halal sections near you.
              AI-verified with confidence ratings.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-teal-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">
                {supermarkets.filter(s => s.has_halal_section).length}
              </div>
              <div className="text-sm text-gray-600">Halal Sections Found</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {supermarkets.length}
              </div>
              <div className="text-sm text-gray-600">Total Supermarkets</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {supermarkets.filter(s => s.confidence_score && s.confidence_score >= 0.9).length}
              </div>
              <div className="text-sm text-gray-600">High Confidence</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 rounded-2xl border-2 border-teal-200 p-8 md:p-12 shadow-lg">
          <div className="text-center max-w-3xl mx-auto">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Store className="w-20 h-20 text-teal-600" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Clock className="w-4 h-4" />
              Coming Soon
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              We're building Australia's most accurate directory of supermarkets with halal sections.
              Using AI technology to analyze thousands of reviews and verify halal availability.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Verified</h3>
                <p className="text-sm text-gray-600">
                  Claude AI analyzes reviews to confirm halal section availability
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Confidence Scoring</h3>
                <p className="text-sm text-gray-600">
                  Every listing includes a confidence rating (0-100%)
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Australia-Wide</h3>
                <p className="text-sm text-gray-600">
                  Covering Coles, Woolworths, IGA, ALDI & more across all states
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              About Our Halal Supermarket Directory
            </h3>
            <p className="text-gray-600 max-w-3xl mx-auto mb-4">
              We use AI technology to analyze reviews, websites, and social media to identify
              supermarkets with dedicated halal sections. Each listing includes a confidence
              score based on the reliability of our data sources.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>AI-Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Confidence Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Location Accurate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalalSupermarkets;
