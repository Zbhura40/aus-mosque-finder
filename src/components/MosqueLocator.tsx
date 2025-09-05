import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Navigation, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import mosqueHero from "@/assets/mosque-hero.png";

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
}

const MosqueLocator = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    radius: '',
    locationType: null,
    postcode: ''
  });
  const [postcodeDisplay, setPostcodeDisplay] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

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

  const isSearchDisabled = !searchParams.radius || !searchParams.locationType || 
    (searchParams.locationType === 'postcode' && !searchParams.postcode);

  return (
    <div className="min-h-screen bg-background elegant-texture">
      {/* Hero Section */}
      <div className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 elegant-texture opacity-30"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="font-elegant text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Find Mosques Near You
              </h1>
              <p className="font-body text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                Discover nearby mosques across Australia with precise location search
                and detailed information to help you find your place of worship.
              </p>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl transform rotate-3"></div>
                <img 
                  src={mosqueHero} 
                  alt="Beautiful mosque illustration" 
                  className="relative w-full h-auto rounded-2xl shadow-2xl border-4 border-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <Card className="card-gradient shadow-2xl border border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-6 relative">
            <CardTitle className="font-elegant text-3xl font-semibold text-islamic-navy flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-islamic-green/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-islamic-green" />
              </div>
              Search for Mosques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Radius Selection */}
            <div className="space-y-6">
              <h3 className="font-elegant text-xl font-semibold text-islamic-navy">Search Radius</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {radiusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={searchParams.radius === option.value ? "default" : "outline"}
                    className={`h-16 font-body text-lg font-medium transition-all duration-300 rounded-xl ${
                      searchParams.radius === option.value 
                        ? "bg-islamic-green hover:bg-islamic-green-dark text-white shadow-lg scale-105 border-islamic-green" 
                        : "hover:bg-islamic-green/10 hover:border-islamic-green hover:text-islamic-green border-2 border-muted"
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
              <h3 className="font-elegant text-xl font-semibold text-islamic-navy">Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Current Location */}
                <Button
                  variant={searchParams.locationType === 'current' ? "default" : "outline"}
                  className={`h-18 font-body text-lg font-medium transition-all duration-300 rounded-xl ${
                    searchParams.locationType === 'current'
                      ? "bg-islamic-navy hover:bg-islamic-navy-light text-white shadow-lg border-islamic-navy" 
                      : "hover:bg-islamic-navy/10 hover:border-islamic-navy hover:text-islamic-navy border-2 border-muted"
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
                        ? "bg-islamic-navy hover:bg-islamic-navy-light text-white shadow-lg border-islamic-navy" 
                        : "hover:bg-islamic-navy/10 hover:border-islamic-navy hover:text-islamic-navy border-2 border-muted"
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
                        className="h-14 font-body text-lg rounded-xl border-2 border-muted focus:border-islamic-green"
                      />
                      {postcodeDisplay && (
                        <p className="font-body text-sm text-islamic-green font-medium flex items-center gap-2">
                          <span className="w-2 h-2 bg-islamic-green rounded-full"></span>
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
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="font-elegant text-4xl font-bold text-center mb-12 text-islamic-navy">
            Search Results
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
              {mosques.map((mosque) => (
                <Card key={mosque.id} className="hover:shadow-xl transition-all duration-300 border-l-6 border-l-islamic-green rounded-2xl overflow-hidden elegant-texture">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="bg-islamic-green/15 p-3 rounded-2xl">
                            <MapPin className="w-6 h-6 text-islamic-green" />
                          </div>
                          <div>
                            <h3 className="font-elegant text-2xl font-semibold text-islamic-navy mb-2">
                              {mosque.name}
                            </h3>
                            <p className="font-body text-lg text-muted-foreground mb-3 leading-relaxed">{mosque.address}</p>
                            <div className="flex items-center gap-6 font-body text-base">
                              <span className="font-medium text-islamic-green bg-islamic-green/10 px-3 py-1 rounded-full">
                                {mosque.distance}
                              </span>
                              {mosque.rating && (
                                <span className="flex items-center gap-2 text-amber-600">
                                  ⭐ <span className="font-medium">{mosque.rating}</span>
                                </span>
                              )}
                              {mosque.isOpen !== undefined && (
                                <span className={`flex items-center gap-2 font-medium ${
                                  mosque.isOpen ? 'text-islamic-green' : 'text-red-500'
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
                        <Button variant="outline" size="lg" className="font-body border-2 border-islamic-navy text-islamic-navy hover:bg-islamic-navy/10 rounded-xl">
                          Directions
                        </Button>
                        <Button variant="default" size="lg" className="font-body bg-islamic-green hover:bg-islamic-green-dark rounded-xl">
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
              <div className="bg-islamic-green/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <MapPin className="w-12 h-12 text-islamic-green" />
              </div>
              <h3 className="font-elegant text-2xl font-semibold mb-4 text-islamic-navy">No mosques found</h3>
              <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                No mosques were found within the selected radius. Try expanding your search radius or checking your location.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MosqueLocator;