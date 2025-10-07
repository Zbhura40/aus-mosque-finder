import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Search, Star, CheckCircle, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SupermarketCard from '@/components/SupermarketCard';

interface Supermarket {
  id: string;
  place_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  chain: string | null;
  has_halal_section: boolean;
  confidence_score: number | null;
  reasoning: string | null;
  source: string | null;
  rating: number | null;
  user_ratings_total: number;
  last_checked: string;
}

const HalalSupermarkets = () => {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [filteredSupermarkets, setFilteredSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [halalOnly, setHalalOnly] = useState(true);
  const [minConfidence, setMinConfidence] = useState(0.7);
  const [selectedChain, setSelectedChain] = useState<string>('all');

  // Fetch supermarkets from Supabase
  useEffect(() => {
    fetchSupermarkets();
  }, []);

  const fetchSupermarkets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('supermarkets')
        .select('*')
        .eq('is_active', true)
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      setSupermarkets(data || []);
      setFilteredSupermarkets(data || []);
    } catch (error) {
      console.error('Error fetching supermarkets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...supermarkets];

    // Filter by halal only
    if (halalOnly) {
      filtered = filtered.filter(s => s.has_halal_section);
    }

    // Filter by confidence score
    filtered = filtered.filter(
      s => !s.confidence_score || s.confidence_score >= minConfidence
    );

    // Filter by chain
    if (selectedChain !== 'all') {
      filtered = filtered.filter(s => s.chain === selectedChain);
    }

    setFilteredSupermarkets(filtered);
  }, [supermarkets, halalOnly, minConfidence, selectedChain]);

  // Get unique chains for filter
  const chains = Array.from(new Set(supermarkets.map(s => s.chain).filter(Boolean)));

  // Get confidence level badge
  const getConfidenceBadge = (score: number | null) => {
    if (!score) return { text: 'Unverified', color: 'bg-gray-100 text-gray-600' };
    if (score >= 0.9) return { text: 'High Confidence', color: 'bg-green-100 text-green-700' };
    if (score >= 0.8) return { text: 'Good Confidence', color: 'bg-blue-100 text-blue-700' };
    if (score >= 0.7) return { text: 'Medium Confidence', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Low Confidence', color: 'bg-orange-100 text-orange-700' };
  };

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

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Halal Only Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="halal-only"
                checked={halalOnly}
                onChange={(e) => setHalalOnly(e.target.checked)}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <label htmlFor="halal-only" className="text-sm font-medium text-gray-700">
                Show halal sections only
              </label>
            </div>

            {/* Confidence Slider */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Min. Confidence: {(minConfidence * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            {/* Chain Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Supermarket Chain</label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Chains</option>
                {chains.map(chain => (
                  <option key={chain} value={chain || ''}>
                    {chain}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Showing {filteredSupermarkets.length} results</span>
            {halalOnly && (
              <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                Halal Only
              </span>
            )}
            {minConfidence > 0.7 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {(minConfidence * 100).toFixed(0)}%+ Confidence
              </span>
            )}
            {selectedChain !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                {selectedChain}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredSupermarkets.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No supermarkets found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later as we add more locations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSupermarkets.map((supermarket) => (
              <SupermarketCard
                key={supermarket.id}
                supermarket={supermarket}
                getConfidenceBadge={getConfidenceBadge}
              />
            ))}
          </div>
        )}
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
