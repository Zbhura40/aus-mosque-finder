import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, ExternalLink, Star, Navigation, Filter, Clock, ChevronRight, Check, ParkingCircle, Accessibility, Droplets, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateBrisbaneCityPageSchema, injectJsonLdSchema } from '@/lib/json-ld-schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Mosque {
  id: string;
  name: string;
  address: string;
  phone_number?: string;
  website?: string;
  suburb?: string;
  google_rating?: number;
  google_review_count?: number;
  attributes?: string[];
  opening_hours?: any;
  photos?: any[];
  reviews?: any[];
  facilities?: string[];
  latitude?: number;
  longitude?: number;
}

const BrisbaneCity = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [filteredMosques, setFilteredMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuburb, setSelectedSuburb] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [expandedFacilities, setExpandedFacilities] = useState<Set<string>>(new Set());

  // Extract suburb from address (e.g., "123 St, Holland Park QLD 4121" -> "Holland Park")
  const extractSuburb = (address: string): string => {
    const match = address.match(/,\s*([^,]+)\s+QLD\s+\d{4}/);
    return match ? match[1].trim() : 'Unknown';
  };

  // Fetch mosques from database
  useEffect(() => {
    const fetchMosques = async () => {
      try {
        const { data, error } = await supabase
          .from('mosques_cache' as any)
          .select('*')
          .eq('state', 'QLD')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching mosques:', error);
        } else {
          const mosquesData = (data as any) || [];
          console.log('Fetched mosques:', mosquesData.length);
          setMosques(mosquesData);
          setFilteredMosques(mosquesData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMosques();
  }, []);

  // Get unique suburbs for filter dropdown
  const suburbs = useMemo(() => {
    const suburbSet = new Set<string>();
    mosques.forEach(mosque => {
      const suburb = extractSuburb(mosque.address);
      if (suburb !== 'Unknown') {
        suburbSet.add(suburb);
      }
    });
    return Array.from(suburbSet).sort();
  }, [mosques]);

  // Filter mosques by suburb
  useEffect(() => {
    if (selectedSuburb === 'all') {
      setFilteredMosques(mosques);
    } else {
      const filtered = mosques.filter(mosque =>
        extractSuburb(mosque.address) === selectedSuburb
      );
      setFilteredMosques(filtered);
    }
  }, [selectedSuburb, mosques]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle geolocation
  const handleFindNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setSortByDistance(true);

          // Sort mosques by distance
          const sorted = [...filteredMosques].sort((a, b) => {
            if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
            const distA = calculateDistance(userLoc.lat, userLoc.lng, a.latitude, a.longitude);
            const distB = calculateDistance(userLoc.lat, userLoc.lng, b.latitude, b.longitude);
            return distA - distB;
          });
          setFilteredMosques(sorted);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Calculate distance for display
  const getDistance = (mosque: Mosque): string | null => {
    if (!userLocation || !mosque.latitude || !mosque.longitude) return null;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      mosque.latitude,
      mosque.longitude
    );
    return distance < 1
      ? `${(distance * 1000).toFixed(0)}m away`
      : `${distance.toFixed(1)}km away`;
  };

  // Get today's opening hours
  const getTodayHours = (mosque: Mosque): string => {
    if (!mosque.opening_hours?.weekdayDescriptions) return 'Hours not available';

    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayIndex = today === 0 ? 6 : today - 1; // Convert to Monday = 0, Sunday = 6

    return mosque.opening_hours.weekdayDescriptions[dayIndex] || 'Hours not available';
  };

  // Check if mosque is open now
  const isOpenNow = (mosque: Mosque): boolean => {
    return mosque.opening_hours?.openNow || false;
  };

  // Get mosque photo URL
  const getPhotoUrl = (mosque: Mosque): string | null => {
    if (!mosque.photos || mosque.photos.length === 0) return null;

    const firstPhoto = mosque.photos[0];

    // Handle old format (has 'url' field directly)
    if (firstPhoto.url) {
      return firstPhoto.url;
    }

    // Handle new format (has 'name' field - need to construct URL)
    if (firstPhoto.name) {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const photoName = firstPhoto.name;
      return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=600&key=${apiKey}`;
    }

    return null;
  };

  // Get latest review
  const getLatestReview = (mosque: Mosque) => {
    if (!mosque.reviews || mosque.reviews.length === 0) return null;
    return mosque.reviews[0]; // Reviews are already sorted by most recent
  };

  // Toggle facilities expansion
  const toggleFacilities = (mosqueId: string) => {
    setExpandedFacilities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mosqueId)) {
        newSet.delete(mosqueId);
      } else {
        newSet.add(mosqueId);
      }
      return newSet;
    });
  };

  // Get facility icon
  const getFacilityIcon = (facilityName: string) => {
    const lowerName = facilityName.toLowerCase();
    if (lowerName.includes('parking')) return <ParkingCircle className="w-4 h-4 text-teal-600" />;
    if (lowerName.includes('wheelchair') || lowerName.includes('access')) return <Accessibility className="w-4 h-4 text-teal-600" />;
    if (lowerName.includes('wudu')) return <Droplets className="w-4 h-4 text-teal-600" />;
    if (lowerName.includes('women')) return <Users className="w-4 h-4 text-teal-600" />;
    return <Check className="w-4 h-4 text-teal-600" />;
  };

  // SEO Meta tags and Structured Data
  useEffect(() => {
    document.title = "Mosques Near Me in Brisbane | 41+ Prayer Locations | Find My Mosque";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content',
        "Find mosques near you in Brisbane with prayer times, maps, directions, and facilities. Discover 41+ Islamic centers, masjids, and prayer rooms across Brisbane and Queensland. Free directory, no ads."
      );
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/city/brisbane`);
    }

    // Inject structured data when mosques are loaded
    if (mosques.length > 0) {
      const cityUrl = `${window.location.origin}/city/brisbane`;
      const schema = generateBrisbaneCityPageSchema(mosques, cityUrl);
      injectJsonLdSchema(schema);
    }
  }, [mosques]);

  // Generate Google Maps URL centered on filtered mosques
  const generateMapUrl = (): string => {
    const baseUrl = 'https://www.google.com/maps/embed/v1/search';
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Get mosques to display on map (filtered by suburb)
    const mosquesToShow = filteredMosques.filter(m => m.latitude && m.longitude);

    if (mosquesToShow.length === 0) {
      // Fallback: show Brisbane mosques
      return `${baseUrl}?key=${apiKey}&q=mosques+in+Brisbane+QLD&zoom=10`;
    }

    // If suburb is selected, search for mosques in that suburb with better query
    if (selectedSuburb !== 'all') {
      // Calculate center point of filtered mosques
      const avgLat = mosquesToShow.reduce((sum, m) => sum + (m.latitude || 0), 0) / mosquesToShow.length;
      const avgLng = mosquesToShow.reduce((sum, m) => sum + (m.longitude || 0), 0) / mosquesToShow.length;

      // Use generic mosque search centered on the suburb's mosques
      const query = 'mosque';
      return `${baseUrl}?key=${apiKey}&q=${query}&center=${avgLat},${avgLng}&zoom=14`;
    }

    // Show all Brisbane mosques
    return `${baseUrl}?key=${apiKey}&q=mosques+in+Brisbane+QLD&zoom=10`;
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Hero Section */}
        <section className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Mosques Near Me in Brisbane
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Find mosques near you with prayer times, maps, directions, and facilities
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            <Button
              onClick={handleFindNearMe}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Find Mosques Near Me
            </Button>

            <Select value={selectedSuburb} onValueChange={setSelectedSuburb}>
              <SelectTrigger className="w-[240px] bg-white border-gray-300 z-50 relative">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by Suburb" />
              </SelectTrigger>
              <SelectContent className="z-50 max-h-[300px] overflow-y-auto bg-white border border-gray-200 shadow-lg">
                <SelectItem value="all">All Suburbs ({mosques.length})</SelectItem>
                {suburbs.map(suburb => (
                  <SelectItem key={suburb} value={suburb}>
                    {suburb}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Google Maps Section */}
        <section className="mb-8">
          <div className="w-full h-[400px] rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
            <iframe
              key={selectedSuburb}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={generateMapUrl()}
            />
          </div>
        </section>

        {/* Mosques in Brisbane Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
            Mosques in Brisbane
          </h2>

          {loading ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600">Loading mosques...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Showing {filteredMosques.length} {filteredMosques.length === 1 ? 'mosque' : 'mosques'}
                {selectedSuburb !== 'all' && ` in ${selectedSuburb}`}
                {sortByDistance && ' (sorted by distance)'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMosques.map((mosque, index) => {
                  const distance = getDistance(mosque);
                  const suburb = extractSuburb(mosque.address);
                  const photoUrl = getPhotoUrl(mosque);

                  return (
                    <Card key={mosque.id} className="rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                      <CardContent className="p-0">
                        {/* Mosque Photo - Always render container for consistent alignment */}
                        <div className="w-full h-48 overflow-hidden bg-gray-100">
                          {photoUrl && (
                            <img
                              src={photoUrl}
                              alt={mosque.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Hide image if it fails to load
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                        </div>

                        <div className="p-6 space-y-4">
                          {/* Mosque Number & Name */}
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <span className="inline-block bg-teal-100 text-teal-800 text-sm font-bold px-3 py-1 rounded-full">
                                #{index + 1}
                              </span>
                              {distance && (
                                <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-1 rounded-full">
                                  {distance}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900 leading-tight">
                              {mosque.name}
                            </h3>
                          </div>

                          {/* Rating */}
                          {mosque.google_rating && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="ml-1 text-sm font-semibold text-gray-900">
                                  {mosque.google_rating}
                                </span>
                              </div>
                              {mosque.google_review_count && (
                                <span className="text-sm text-gray-500">
                                  ({mosque.google_review_count} reviews)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Address */}
                          <div className="flex items-start text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-teal-600" />
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">{suburb}</p>
                              <p className="text-gray-600">{mosque.address}</p>
                            </div>
                          </div>

                          {/* Phone */}
                          {mosque.phone_number && (
                            <div className="flex items-center text-gray-700">
                              <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-teal-600" />
                              <a
                                href={`tel:${mosque.phone_number}`}
                                className="text-sm hover:text-teal-600 transition-colors"
                              >
                                {mosque.phone_number}
                              </a>
                            </div>
                          )}

                          {/* Website */}
                          {mosque.website && (
                            <div className="flex items-center text-gray-700">
                              <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0 text-teal-600" />
                              <a
                                href={mosque.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm hover:text-teal-600 transition-colors truncate"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}

                          {/* Opening Hours */}
                          <div className="flex items-start text-gray-700 pt-2 border-t border-gray-100">
                            <Clock className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-teal-600" />
                            <div className="text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">Today:</span>
                                {isOpenNow(mosque) && (
                                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    Open Now
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600">
                                {getTodayHours(mosque).split(': ')[1] || getTodayHours(mosque)}
                              </p>
                            </div>
                          </div>

                          {/* Latest Review */}
                          {(() => {
                            const latestReview = getLatestReview(mosque);
                            if (!latestReview) return null;

                            return (
                              <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-start gap-2 mb-2">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {latestReview.authorAttribution?.displayName || 'Anonymous'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {latestReview.relativePublishTimeDescription}
                                      </span>
                                    </div>
                                    <div className="max-h-16 overflow-y-auto text-sm text-gray-600 leading-relaxed scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                      {latestReview.text?.text || latestReview.originalText?.text || 'No review text'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Facilities Section */}
                          {mosque.facilities && mosque.facilities.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                              {/* Collapsible Header */}
                              <button
                                onClick={() => toggleFacilities(mosque.id)}
                                className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded transition-colors"
                              >
                                <span className="text-base font-semibold text-gray-900">
                                  Facilities
                                </span>
                                <ChevronRight
                                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                    expandedFacilities.has(mosque.id) ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>

                              {/* Expanded Facilities List */}
                              {expandedFacilities.has(mosque.id) && (
                                <div className="pb-2 space-y-2">
                                  {mosque.facilities.map((facility, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      {getFacilityIcon(facility)}
                                      <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                      <span className="text-sm text-gray-700">{facility}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Get Directions Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mosque.address)}`;
                              window.open(mapsUrl, '_blank');
                            }}
                            className="w-full text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg border-0"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Get Directions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Educational Content */}
        <section className="mb-12 bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            How to find the nearest mosque in Brisbane
          </h2>
          <div className="prose prose-gray max-w-none">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Etiquette tips</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>When visiting a mosque, dress modestly covering shoulders and knees</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>Remove your shoes before entering the prayer area</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>Perform wudu (ablution) if needed - facilities are usually available</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>Keep mobile phones on silent during prayer times</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-600 mr-2">•</span>
                <span>Most mosques have separate prayer areas for men and women</span>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12 bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What should I do when visiting a mosque in Brisbane?
              </h3>
              <p className="text-gray-700">
                Remove your shoes before entering, dress modestly, and maintain silence during prayers.
                Most mosques welcome visitors and are happy to answer questions outside of prayer times.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are Brisbane mosques open 24/7?
              </h3>
              <p className="text-gray-700">
                Opening hours vary by mosque. Many are open for the five daily prayers, while some remain
                open throughout the day. Check individual mosque details or call ahead to confirm.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can non-Muslims visit mosques in Brisbane?
              </h3>
              <p className="text-gray-700">
                Yes, most mosques in Brisbane welcome visitors of all faiths. It's best to visit outside
                of prayer times or contact the mosque in advance to arrange a guided tour.
              </p>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="mb-8 bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">
            Explore Other Locations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link to="/city/sydney" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">
                Sydney
              </Button>
            </Link>
            <Link to="/city/melbourne" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">
                Melbourne
              </Button>
            </Link>
            <Link to="/city/perth" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">
                Perth
              </Button>
            </Link>
            <Link to="/city/adelaide" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">
                Adelaide
              </Button>
            </Link>
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">
                All Australia
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default BrisbaneCity;
