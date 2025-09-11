import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Navigation, Clock, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import mosqueHero from "@/assets/mosque-hero.png";
import DirectionsModal from "./DirectionsModal";
import MosqueDetailsModal from "./MosqueDetailsModal";
import { generateLandingPageSchema } from "@/lib/json-ld-schema";
import { useJsonLdSchema } from "@/hooks/useJsonLdSchema";
import { useSEO } from "@/hooks/useSEO";

interface SearchParams {
  radius: string;
  locationType: 'current' | 'postcode' | null;
  postcode: string;
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
        // Geocode postcode to get coordinates
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-postcode', {
          body: { postcode: searchParams.postcode }
        });
        
        if (geocodeError) throw geocodeError;
        if (!geocodeData || !geocodeData.latitude || !geocodeData.longitude) {
          throw new Error('Unable to find location for this postcode');
        }
        
        latitude = geocodeData.latitude;
        longitude = geocodeData.longitude;
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

      // Search for mosques using Google Places API
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: searchData, error: searchError } = await supabase.functions.invoke('search-mosques', {
        body: {
          latitude,
          longitude,
          radius: radiusInMeters
        }
      });

      if (searchError) throw searchError;

      const foundMosques = searchData?.mosques || [];
      setMosques(foundMosques);
      
      toast({
        title: "Search complete",
        description: `Found ${foundMosques.length} mosques within ${searchParams.radius}km`,
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
    <div className="min-h-screen bg-background elegant-texture">
      {/* Hero Section with Stunning Background */}
      <header className="relative hero-with-mosque overflow-hidden min-h-screen flex items-center">
        <div className="relative container mx-auto px-4 py-20 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-elegant text-6xl lg:text-8xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
              Find My Mosque Australia
            </h1>
            <p className="font-body text-2xl lg:text-3xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              A new, free platform created for the community to easily find mosques across Australia
            </p>
            
            {/* User Feedback Button - Removed */}
          </div>
        </div>
        
        {/* Elegant scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Trust Building Section */}
        <section className="container mx-auto px-4 py-16 relative z-20">
          <Card className="bg-warm-ivory/95 border-2 border-golden-beige/60 shadow-xl rounded-3xl overflow-hidden backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free to Use */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-islamic-green/20 flex items-center justify-center border-2 border-islamic-green/40">
                    <span className="text-2xl">🆓</span>
                  </div>
                  <h3 className="font-elegant text-xl font-semibold text-architectural-shadow">100% Free</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">This platform is completely free to use, with zero ads of any kind.</p>
                </div>

                {/* Built by Muslims */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-golden-amber/20 flex items-center justify-center border-2 border-golden-amber/60">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="font-elegant text-xl font-semibold text-architectural-shadow">Community Built</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">Designed and managed by Muslims, with your best interests at heart.</p>
                </div>

                {/* No Ads Ever */}
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-rose-dome/20 flex items-center justify-center border-2 border-rose-dome/40">
                    <span className="text-2xl">🚫</span>
                  </div>
                  <h3 className="font-elegant text-xl font-semibold text-architectural-shadow">No Ads Ever</h3>
                  <p className="font-body text-muted-foreground leading-relaxed">Absolutely no advertisements—ever. Just a clean, focused experience.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Search Section */}
        <section className="container mx-auto px-4 relative z-20">
          <Card className="bg-warm-ivory border-2 border-golden-beige/60 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="text-center pb-6 relative bg-warm-ivory border-b border-golden-beige/40">
              <h2 className="font-elegant text-4xl font-semibold text-archway-black flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-burnt-ochre/20 flex items-center justify-center border-2 border-burnt-ochre/40">
                  <MapPin className="w-6 h-6 text-burnt-ochre" />
                </div>
                Search for Mosques Near You
              </h2>
            </CardHeader>
          <CardContent className="space-y-8">
            {/* Radius Selection */}
            <div className="space-y-6">
              <h3 className="font-elegant text-2xl font-semibold text-architectural-shadow mb-4">Search Radius</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {radiusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={searchParams.radius === option.value ? "default" : "outline"}
                    className={`h-16 font-body text-lg font-medium transition-all duration-300 rounded-xl ${
                      searchParams.radius === option.value 
                        ? "bg-golden-amber hover:bg-golden-amber/80 text-architectural-shadow shadow-lg scale-105 border-golden-amber" 
                        : "hover:bg-golden-amber/10 hover:border-golden-amber hover:text-architectural-shadow border-2 border-muted"
                    }`}
                    onClick={() => handleRadiusSelect(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

              {/* Location Type Selection */}
              <div className="space-y-6">
                <h3 className="font-elegant text-2xl font-semibold text-architectural-shadow mb-4">Choose Your Location Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Current Location */}
                <Button
                  variant={searchParams.locationType === 'current' ? "default" : "outline"}
                  className={`h-18 font-body text-lg font-medium transition-all duration-300 rounded-xl ${
                    searchParams.locationType === 'current'
                      ? "bg-architectural-shadow hover:bg-architectural-shadow/80 text-white shadow-lg border-architectural-shadow" 
                      : "hover:bg-architectural-shadow/10 hover:border-architectural-shadow hover:text-architectural-shadow border-2 border-muted"
                  }`}
                  onClick={handleCurrentLocation}
                >
                  <Navigation className="w-5 h-5 mr-3" />
                  Use Current Location
                </Button>

                {/* Postcode */}
                <div className="space-y-3">
                  <Button
                    variant={searchParams.locationType === 'postcode' ? "default" : "outline"}
                    className={`w-full h-18 font-body text-lg font-medium transition-all duration-300 rounded-xl ${
                      searchParams.locationType === 'postcode'
                        ? "bg-architectural-shadow hover:bg-architectural-shadow/80 text-white shadow-lg border-architectural-shadow" 
                        : "hover:bg-architectural-shadow/10 hover:border-architectural-shadow hover:text-architectural-shadow border-2 border-muted"
                    }`}
                    onClick={() => handleLocationTypeSelect('postcode')}
                  >
                    <MapPin className="w-5 h-5 mr-3" />
                    Enter Postcode
                  </Button>
                  
                  {searchParams.locationType === 'postcode' && (
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter postcode (e.g., 4103)"
                        value={searchParams.postcode}
                        onChange={(e) => handlePostcodeChange(e.target.value)}
                        className="h-14 font-body text-lg rounded-xl border-2 border-muted focus:border-golden-amber"
                      />
                      {postcodeDisplay && (
                        <p className="font-body text-sm text-golden-amber font-medium flex items-center gap-2">
                          <span className="w-2 h-2 bg-golden-amber rounded-full"></span>
                          {postcodeDisplay}
                        </p>
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
              className="w-full h-18 font-elegant text-xl font-semibold bg-islamic-green hover:bg-islamic-green-dark text-white shadow-lg transition-all duration-300 disabled:opacity-50 rounded-xl"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-6 h-6 mr-3" />
                  Find Mosques
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        </section>

        {/* Results Section */}
        {hasSearched && (
          <section className="container mx-auto px-4 py-16">
            <h2 className="font-elegant text-4xl font-bold text-center mb-12 text-islamic-navy">
              Nearby Mosques & Islamic Centers
            {!isSearching && mosques.length > 0 && (
              <span className="font-body text-xl font-normal text-muted-foreground ml-3 block mt-2">
                ({mosques.length} mosques found)
              </span>
            )}
          </h2>
          
          {isSearching ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-islamic-green"></div>
            </div>
          ) : (
            <div className="grid gap-8">
              {mosques.map((mosque, index) => {
                // Create attractive color variations using the mosque photo palette
                const cardColors = [
                  {
                    bg: "bg-rose-dome/30",
                    border: "border-l-rose-dome/60", 
                    iconBg: "bg-golden-amber/20",
                    iconColor: "text-architectural-shadow",
                    title: "text-architectural-shadow",
                    distanceBg: "bg-architectural-shadow/10",
                    distanceText: "text-architectural-shadow",
                    directionsBorder: "border-architectural-shadow",
                    directionsText: "text-architectural-shadow",
                    directionsHover: "hover:bg-architectural-shadow/10",
                    detailsBg: "bg-golden-amber",
                    detailsHover: "hover:bg-golden-amber/80"
                  },
                  {
                    bg: "bg-marble-warm/40",
                    border: "border-l-golden-amber",
                    iconBg: "bg-rose-dome/25",
                    iconColor: "text-architectural-shadow",
                    title: "text-architectural-shadow",
                    distanceBg: "bg-golden-amber/15",
                    distanceText: "text-architectural-shadow",
                    directionsBorder: "border-rose-dome",
                    directionsText: "text-rose-dome",
                    directionsHover: "hover:bg-rose-dome/10",
                    detailsBg: "bg-architectural-shadow",
                    detailsHover: "hover:bg-architectural-shadow/80"
                  },
                  {
                    bg: "bg-sky-gray/25",
                    border: "border-l-architectural-shadow",
                    iconBg: "bg-marble-warm/30",
                    iconColor: "text-golden-amber",
                    title: "text-architectural-shadow",
                    distanceBg: "bg-rose-dome/15",
                    distanceText: "text-architectural-shadow",
                    directionsBorder: "border-golden-amber",
                    directionsText: "text-golden-amber",
                    directionsHover: "hover:bg-golden-amber/10",
                    detailsBg: "bg-rose-dome",
                    detailsHover: "hover:bg-rose-dome/80"
                  }
                ];
                
                const cardStyle = cardColors[index % cardColors.length];
                
                return (
                  <Card key={mosque.id} className={`hover:shadow-xl transition-all duration-300 border-l-6 ${cardStyle.border} ${cardStyle.bg} border-2 border-golden-beige/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-lg`}>
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className={`${cardStyle.iconBg} p-3 rounded-2xl shadow-sm`}>
                              <MapPin className={`w-6 h-6 ${cardStyle.iconColor}`} />
                            </div>
                            <div>
                              <h3 className={`font-elegant text-2xl font-semibold ${cardStyle.title} mb-2`}>
                                {mosque.name}
                              </h3>
                              <p className="font-body text-lg text-slate-blue mb-3 leading-relaxed">{mosque.address}</p>
                              <div className="flex items-center gap-6 font-body text-base">
                                <span className={`font-medium ${cardStyle.distanceText} ${cardStyle.distanceBg} px-4 py-2 rounded-full shadow-sm`}>
                                  {mosque.distance}
                                </span>
                                {mosque.rating && (
                                  <span className="flex items-center gap-2 bg-burnt-ochre/20 px-3 py-1 rounded-full text-archway-black">
                                    ⭐ <span className="font-medium">{mosque.rating}</span>
                                  </span>
                                )}
                                {mosque.isOpen !== undefined && (
                                  <span className={`flex items-center gap-2 font-medium px-3 py-1 rounded-full ${
                                    mosque.isOpen ? 'text-islamic-green bg-islamic-green/15' : 'text-red-600 bg-red-100'
                                  }`}>
                                    <Clock className="w-4 h-4" />
                                    {mosque.isOpen ? 'Open' : 'Closed'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            size="lg" 
                            className={`font-body border-2 ${cardStyle.directionsBorder} ${cardStyle.directionsText} ${cardStyle.directionsHover} rounded-xl shadow-sm`}
                            onClick={() => handleDirections(mosque)}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Directions
                          </Button>
                          <Button 
                            variant="default" 
                            size="lg" 
                            className={`font-body ${cardStyle.detailsBg} ${cardStyle.detailsHover} text-white rounded-xl shadow-sm`}
                            onClick={() => handleDetails(mosque)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!isSearching && mosques.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-islamic-green/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <MapPin className="w-12 h-12 text-islamic-green" />
              </div>
              <h3 className="font-elegant text-2xl font-semibold mb-4 text-islamic-navy">No mosques found</h3>
              <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
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