import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Navigation, Clock, MessageSquare, User, ExternalLink, Phone, Globe, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// Hero image will be loaded via CSS background for better performance
import DirectionsModal from "./DirectionsModal";
import MosqueDetailsModal from "./MosqueDetailsModal";
import { generateLandingPageSchema } from "@/lib/json-ld-schema";
import { useJsonLdSchema } from "@/hooks/useJsonLdSchema";
import { useSEO } from "@/hooks/useSEO";
import { searchMosques } from "@/services/mosqueService";

interface SearchParams {
  radius: string;
  locationType: 'current' | 'postcode' | null;
  postcode: string;
}

interface SuburbSuggestion {
  description: string;
  place_id: string;
  main_text?: string;
  secondary_text?: string;
}

interface Mosque {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating?: number;
  isOpen?: boolean;
  phone?: string;
  website?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

const MosqueLocator = () => {
  const navigate = useNavigate();
  
  // SEO and JSON-LD for landing page
  useSEO('landing');
  const landingPageSchema = generateLandingPageSchema();
  useJsonLdSchema(landingPageSchema);
  
  const [searchParams, setSearchParams] = useState<SearchParams>({
    radius: '',
    locationType: null,
    postcode: ''
  });
  const [postcodeDisplay, setPostcodeDisplay] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [suburbSuggestions, setSuburbSuggestions] = useState<SuburbSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidLocation, setIsValidLocation] = useState(true);
  const [directionsModal, setDirectionsModal] = useState<{
    isOpen: boolean;
    mosque: Mosque | null;
  }>({ isOpen: false, mosque: null });
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    mosque: Mosque | null;
  }>({ isOpen: false, mosque: null });
  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const radiusOptions = [
    { value: '3', label: '3km' },
    { value: '10', label: '10km' },
    { value: '25', label: '25-50km' }
  ];

  const handleRadiusSelect = (radius: string) => {
    setSearchParams(prev => ({ ...prev, radius }));
  };

  const handleLocationTypeSelect = (type: 'current' | 'postcode') => {
    setSearchParams(prev => ({ 
      ...prev, 
      locationType: type,
      postcode: type === 'current' ? '' : prev.postcode
    }));
    
    if (type === 'current') {
      setPostcodeDisplay('');
    }
  };

  const handlePostcodeChange = async (value: string) => {
    setSearchParams(prev => ({ ...prev, postcode: value }));
    setIsValidLocation(true);  // Reset validation on input change
    setUserCoordinates(null);  // Clear stored coordinates when user types manually

    // Show suggestions if input is at least 2 characters
    if (value.length >= 2) {
      try {
        const { supabase } = await import("@/integrations/supabase/client");

        // Call Google Places Autocomplete API for Australian suburbs
        const { data, error } = await supabase.functions.invoke('autocomplete-suburb', {
          body: { input: value, country: 'au' }
        });

        if (!error && data && data.predictions) {
          setSuburbSuggestions(data.predictions);
          setShowSuggestions(data.predictions.length > 0);
        } else {
          setSuburbSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        setSuburbSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuburbSuggestions([]);
      setShowSuggestions(false);
    }

    // Get location name from postcode using Google Geocoding API
    if (value.length >= 4) {
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke('geocode-postcode', {
          body: { postcode: value }
        });

        if (error) throw error;

        if (data && data.locationName) {
          setPostcodeDisplay(data.locationName);
        } else {
          setPostcodeDisplay(`Postcode ${value}`);
        }
      } catch (error) {
        console.error('Error geocoding postcode:', error);
        setPostcodeDisplay(`Postcode ${value}`);
      }
    } else {
      setPostcodeDisplay('');
    }
  };

  const handleSuburbSelect = async (suggestion: SuburbSuggestion) => {
    // Hide dropdown
    setShowSuggestions(false);

    // Update input with selected suburb (use full description which includes state)
    setSearchParams(prev => ({ ...prev, postcode: suggestion.description }));
    setIsValidLocation(true);

    // Clear suggestions
    setSuburbSuggestions([]);

    // Get location details from place_id and store coordinates
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.functions.invoke('geocode-place', {
        body: { place_id: suggestion.place_id }
      });

      if (!error && data) {
        setPostcodeDisplay(suggestion.description);
        // Store the coordinates for this location
        if (data.latitude && data.longitude) {
          // We'll use these coordinates when searching
          setUserCoordinates({
            latitude: data.latitude,
            longitude: data.longitude
          });
        }
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      setPostcodeDisplay(suggestion.description);
    }
  };

  const handleCurrentLocation = () => {
    handleLocationTypeSelect('current');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Location detected",
            description: "Using your current location for search",
          });
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Unable to access your location. Please use postcode instead.",
          });
        }
      );
    }
  };

  const handleSearch = async () => {
    if (!searchParams.radius || !searchParams.locationType) {
      toast({
        variant: "destructive",
        title: "Missing selection",
        description: "Please select both radius and location type to search.",
      });
      return;
    }

    if (searchParams.locationType === 'postcode' && !searchParams.postcode) {
      toast({
        variant: "destructive",
        title: "Missing postcode",
        description: "Please enter a postcode to search.",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      let latitude: number;
      let longitude: number;

      if (searchParams.locationType === 'current') {
        // Get current location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        setUserCoordinates({ latitude, longitude });
      } else {
        // Check if we already have coordinates from suburb selection
        if (userCoordinates && userCoordinates.latitude && userCoordinates.longitude) {
          latitude = userCoordinates.latitude;
          longitude = userCoordinates.longitude;
        } else {
          // Geocode postcode/suburb to get coordinates
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-postcode', {
            body: { postcode: searchParams.postcode }
          });

          if (geocodeError) throw geocodeError;
          if (!geocodeData || !geocodeData.latitude || !geocodeData.longitude) {
            throw new Error('Unable to find location for this postcode or suburb');
          }

          latitude = geocodeData.latitude;
          longitude = geocodeData.longitude;
        }
      }

      // Convert radius to meters (Google Places API uses meters)
      let radiusInMeters: number;
      switch (searchParams.radius) {
        case '3':
          radiusInMeters = 3000;
          break;
        case '10':
          radiusInMeters = 10000;
          break;
        case '25':
          radiusInMeters = 50000; // 25-50km range, using 50km
          break;
        default:
          radiusInMeters = 10000;
      }

      // Search for mosques using the service layer
      // This automatically decides whether to use cache or Google API
      const searchResult = await searchMosques({
        latitude,
        longitude,
        radius: radiusInMeters
      });

      const foundMosques = searchResult.mosques || [];
      setMosques(foundMosques);

      // Show where the data came from and how fast it was
      const sourceLabel = searchResult.source === 'cache' ? '⚡ Cache' : '🌐 Google';
      const speedLabel = searchResult.searchTime < 1000 ? 'Lightning fast' : 'Complete';

      toast({
        title: `${speedLabel} search ${sourceLabel}`,
        description: `Found ${foundMosques.length} mosques within ${searchParams.radius}km (${searchResult.searchTime}ms)`,
      });

    } catch (error: any) {
      console.error('Search error:', error);
      setMosques([]);
      
      let errorMessage = 'An error occurred while searching for mosques.';
      if (error.message?.includes('location')) {
        errorMessage = 'Unable to determine your location. Please check your location settings or try using a postcode.';
      } else if (error.message?.includes('postcode')) {
        errorMessage = 'Unable to find the specified postcode. Please check and try again.';
      }
      
      toast({
        variant: "destructive",
        title: "Search failed",
        description: errorMessage,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDirections = (mosque: Mosque) => {
    setDirectionsModal({ isOpen: true, mosque });
  };

  const closeDirectionsModal = () => {
    setDirectionsModal({ isOpen: false, mosque: null });
  };

  const handleDetails = (mosque: Mosque) => {
    setDetailsModal({ isOpen: true, mosque });
  };

  const closeDetailsModal = () => {
    setDetailsModal({ isOpen: false, mosque: null });
  };

  const isSearchDisabled = !searchParams.radius || !searchParams.locationType || 
    (searchParams.locationType === 'postcode' && !searchParams.postcode);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="bg-white pt-20">
        {/* Search Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden max-w-4xl mx-auto">
            <CardHeader className="text-center pb-6 border-b border-gray-100">
              <h2 className="text-3xl font-serif font-medium text-gray-900 flex items-center justify-center gap-3">
                <MapPin className="w-7 h-7 text-teal-600" />
                Find any Mosque in Australia
              </h2>
            </CardHeader>
          <CardContent className="space-y-8 p-8">
            {/* Radius Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-medium text-gray-900">Search Radius</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {radiusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={searchParams.radius === option.value ? "default" : "outline"}
                    className={`h-12 text-sm font-medium transition-all duration-200 rounded-lg ${
                      searchParams.radius === option.value
                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md border-teal-600"
                        : "hover:bg-gray-50 hover:border-teal-600 border border-gray-300 text-gray-700"
                    }`}
                    onClick={() => handleRadiusSelect(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

              {/* Location Type Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-medium text-gray-900">Choose Your Location Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Location */}
                <Button
                  variant={searchParams.locationType === 'current' ? "default" : "outline"}
                  className={`h-12 text-sm font-medium transition-all duration-200 rounded-lg ${
                    searchParams.locationType === 'current'
                      ? "bg-gray-900 hover:bg-gray-800 text-white shadow-md border-gray-900"
                      : "hover:bg-gray-50 hover:border-gray-900 border border-gray-300 text-gray-700"
                  }`}
                  onClick={handleCurrentLocation}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Use Current Location
                </Button>

                {/* Postcode or Suburb */}
                <div className="space-y-3">
                  <Button
                    variant={searchParams.locationType === 'postcode' ? "default" : "outline"}
                    className={`w-full h-12 text-sm font-medium transition-all duration-200 rounded-lg ${
                      searchParams.locationType === 'postcode'
                        ? "bg-gray-900 hover:bg-gray-800 text-white shadow-md border-gray-900"
                        : "hover:bg-gray-50 hover:border-gray-900 border border-gray-300 text-gray-700"
                    }`}
                    onClick={() => handleLocationTypeSelect('postcode')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Enter Postcode or Suburb
                  </Button>

                  {searchParams.locationType === 'postcode' && (
                    <div className="space-y-2 relative">
                      <Input
                        placeholder="Enter any postcode or suburb"
                        value={searchParams.postcode}
                        onChange={(e) => handlePostcodeChange(e.target.value)}
                        className={`h-11 text-sm rounded-lg border focus:ring-1 ${
                          !isValidLocation
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-teal-600 focus:ring-teal-600'
                        }`}
                      />

                      {/* Suburb Suggestions Dropdown */}
                      {showSuggestions && suburbSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {suburbSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.place_id}
                              onClick={() => handleSuburbSelect(suggestion)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                            >
                              {suggestion.description}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={isSearchDisabled || isSearching}
              className="w-full h-12 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find Mosques
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        </section>

        {/* Results Section */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-16 bg-white">
            <h2 className="text-3xl font-serif font-medium text-center mb-2 text-gray-900">
              Nearby Mosques & Islamic Centers
            </h2>
            {!isSearching && mosques.length > 0 && (
              <p className="text-sm text-gray-600 text-center mb-12">
                {mosques.length} {mosques.length === 1 ? 'mosque' : 'mosques'} found
              </p>
            )}

          {isSearching ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="grid gap-6 max-w-4xl mx-auto">
              {mosques.map((mosque) => (
                  <Card key={mosque.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="bg-teal-50 p-3 rounded-lg">
                              <MapPin className="w-5 h-5 text-teal-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">
                                {mosque.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{mosque.address}</p>
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                                  {mosque.distance}
                                </span>
                                {mosque.rating && (
                                  <span className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-amber-900">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="font-medium">{mosque.rating}</span>
                                  </span>
                                )}
                                {mosque.isOpen !== undefined && (
                                  <span className={`flex items-center gap-1.5 font-medium px-3 py-1 rounded-full ${
                                    mosque.isOpen ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                                  }`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {mosque.isOpen ? 'Open' : 'Closed'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 md:flex-col md:w-32">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 md:w-full text-xs border border-gray-300 hover:bg-gray-50 rounded-lg"
                            onClick={() => handleDirections(mosque)}
                          >
                            <Navigation className="w-3.5 h-3.5 mr-1.5" />
                            Directions
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 md:w-full text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                            onClick={() => handleDetails(mosque)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {!isSearching && mosques.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-teal-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-2xl font-serif font-medium mb-3 text-gray-900">No mosques found</h3>
              <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                No mosques were found within the selected radius. Try expanding your search radius or checking your location.
              </p>
            </div>
          )}
          </section>
        )}
      </main>

      {/* Modals */}
      {directionsModal.mosque && (
        <DirectionsModal
          isOpen={directionsModal.isOpen}
          onClose={closeDirectionsModal}
          mosque={directionsModal.mosque}
          userLocation={userCoordinates}
          userPostcode={searchParams.locationType === 'postcode' ? searchParams.postcode : undefined}
        />
      )}

      {/* Details Modal */}
      <MosqueDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={closeDetailsModal}
        mosque={detailsModal.mosque}
      />
    </div>
  );
};

export default MosqueLocator;