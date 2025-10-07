import React from 'react';
import { MapPin, Phone, ExternalLink, Star, CheckCircle, Calendar } from 'lucide-react';

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

interface SupermarketCardProps {
  supermarket: Supermarket;
  getConfidenceBadge: (score: number | null) => {
    text: string;
    color: string;
  };
}

const SupermarketCard: React.FC<SupermarketCardProps> = ({
  supermarket,
  getConfidenceBadge,
}) => {
  const confidenceBadge = getConfidenceBadge(supermarket.confidence_score);

  const handleGetDirections = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      supermarket.address
    )}`;
    window.open(mapsUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      {/* Header with Chain Logo/Name */}
      {supermarket.chain && (
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2">
          <div className="text-white font-semibold text-sm">{supermarket.chain}</div>
        </div>
      )}

      <div className="p-5">
        {/* Store Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {supermarket.name}
        </h3>

        {/* Halal Section Badge */}
        {supermarket.has_halal_section && (
          <div className="mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Halal Section Available</span>
            </div>
          </div>
        )}

        {/* Confidence Badge */}
        {supermarket.confidence_score && (
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${confidenceBadge.color}`}>
              {confidenceBadge.text} ({(supermarket.confidence_score * 100).toFixed(0)}%)
            </span>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">{supermarket.address}</p>
        </div>

        {/* Google Rating */}
        {supermarket.rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">
                {supermarket.rating.toFixed(1)}
              </span>
            </div>
            {supermarket.user_ratings_total > 0 && (
              <span className="text-xs text-gray-500">
                ({supermarket.user_ratings_total} reviews)
              </span>
            )}
          </div>
        )}

        {/* AI Reasoning (if available) */}
        {supermarket.reasoning && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 italic line-clamp-3">
              "{supermarket.reasoning}"
            </p>
          </div>
        )}

        {/* Source */}
        {supermarket.source && (
          <div className="mb-3">
            <p className="text-xs text-gray-500">
              Source: <span className="font-medium">{supermarket.source}</span>
            </p>
          </div>
        )}

        {/* Last Verified */}
        <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last verified: {formatDate(supermarket.last_checked)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleGetDirections}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            <MapPin className="w-4 h-4" />
            <span>Get Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupermarketCard;
