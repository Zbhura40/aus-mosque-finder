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

  const handlePostcodeChange = (value: string) => {
    setSearchParams(prev => ({ ...prev, postcode: value }));
    
    // Simulate postcode to location name conversion
    // In real implementation, this would use Google Geocoding API
    if (value.length >= 4) {
      const mockLocations: Record<string, string> = {
        '4103': 'South Brisbane, QLD',
        '2000': 'Sydney CBD, NSW',
        '3000': 'Melbourne CBD, VIC',
        '6000': 'Perth CBD, WA',
        '5000': 'Adelaide CBD, SA'
      };
      setPostcodeDisplay(mockLocations[value] || `Postcode ${value}`);
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

    // Simulate API call - replace with actual Google Places API integration
    setTimeout(() => {
      const mockMosques: Mosque[] = [
        {
          id: '1',
          name: 'Islamic Centre of Brisbane',
          address: '123 Islamic Way, South Brisbane QLD 4103',
          distance: '2.3km',
          rating: 4.8,
          isOpen: true,
        },
        {
          id: '2',
          name: 'Al-Noor Mosque',
          address: '456 Crescent Street, West End QLD 4101',
          distance: '3.7km',
          rating: 4.6,
          isOpen: true,
        },
        {
          id: '3',
          name: 'Masjid As-Salam',
          address: '789 Prayer Avenue, Woolloongabba QLD 4102',
          distance: '4.1km',
          rating: 4.9,
          isOpen: false,
        },
      ];

      setMosques(mockMosques);
      setIsSearching(false);
      toast({
        title: "Search complete",
        description: `Found ${mockMosques.length} mosques within ${searchParams.radius}km`,
      });
    }, 1500);
  };

  const isSearchDisabled = !searchParams.radius || !searchParams.locationType || 
    (searchParams.locationType === 'postcode' && !searchParams.postcode);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 mosque-pattern"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Find Mosques Near You
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Discover nearby mosques across Australia with precise location search
                and detailed information to help you find your place of worship.
              </p>
            </div>
            <div className="flex-1 max-w-md">
              <img 
                src={mosqueHero} 
                alt="Beautiful mosque illustration" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <Card className="card-gradient shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <MapPin className="w-6 h-6 text-sacred-green" />
              Search for Mosques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Radius Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Search Radius</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {radiusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={searchParams.radius === option.value ? "default" : "outline"}
                    className={`h-14 text-lg font-medium transition-all duration-200 ${
                      searchParams.radius === option.value 
                        ? "bg-sacred-green hover:bg-sacred-green-dark text-white shadow-lg scale-105" 
                        : "hover:bg-sacred-green/10 hover:border-sacred-green hover:text-sacred-green"
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
              <h3 className="text-lg font-semibold text-foreground">Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Current Location */}
                <Button
                  variant={searchParams.locationType === 'current' ? "default" : "outline"}
                  className={`h-16 text-lg font-medium transition-all duration-200 ${
                    searchParams.locationType === 'current'
                      ? "bg-gold hover:bg-gold-dark text-white shadow-lg" 
                      : "hover:bg-gold/10 hover:border-gold hover:text-gold"
                  }`}
                  onClick={handleCurrentLocation}
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Use Current Location
                </Button>

                {/* Postcode */}
                <div className="space-y-2">
                  <Button
                    variant={searchParams.locationType === 'postcode' ? "default" : "outline"}
                    className={`w-full h-16 text-lg font-medium transition-all duration-200 ${
                      searchParams.locationType === 'postcode'
                        ? "bg-gold hover:bg-gold-dark text-white shadow-lg" 
                        : "hover:bg-gold/10 hover:border-gold hover:text-gold"
                    }`}
                    onClick={() => handleLocationTypeSelect('postcode')}
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Enter Postcode
                  </Button>
                  
                  {searchParams.locationType === 'postcode' && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter postcode (e.g., 4103)"
                        value={searchParams.postcode}
                        onChange={(e) => handlePostcodeChange(e.target.value)}
                        className="h-12 text-lg"
                      />
                      {postcodeDisplay && (
                        <p className="text-sm text-muted-foreground font-medium">
                          📍 {postcodeDisplay}
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
              className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary-soft transition-all duration-200 disabled:opacity-50"
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
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            Search Results
            {!isSearching && mosques.length > 0 && (
              <span className="text-lg font-normal text-muted-foreground ml-2">
                ({mosques.length} mosques found)
              </span>
            )}
          </h2>
          
          {isSearching ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sacred-green"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8">
              {mosques.map((mosque) => (
                <Card key={mosque.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-sacred-green">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="bg-sacred-green/10 p-2 rounded-full">
                            <MapPin className="w-5 h-5 text-sacred-green" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                              {mosque.name}
                            </h3>
                            <p className="text-muted-foreground mb-2">{mosque.address}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium text-primary">{mosque.distance}</span>
                              {mosque.rating && (
                                <span className="flex items-center gap-1">
                                  ⭐ {mosque.rating}
                                </span>
                              )}
                              {mosque.isOpen !== undefined && (
                                <span className={`flex items-center gap-1 ${
                                  mosque.isOpen ? 'text-sacred-green' : 'text-red-500'
                                }`}>
                                  <Clock className="w-4 h-4" />
                                  {mosque.isOpen ? 'Open' : 'Closed'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Directions
                        </Button>
                        <Button variant="default" size="sm" className="bg-sacred-green hover:bg-sacred-green-dark">
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
              <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No mosques found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
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