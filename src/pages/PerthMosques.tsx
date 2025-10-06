import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, ExternalLink, Star, Clock, CheckCircle2 } from 'lucide-react';
import MosqueLocator from '@/components/MosqueLocator';
import { generateCityPageSchema, injectJsonLdSchema } from '@/lib/json-ld-schema';
import mosquesData from '@/data/mosques-data.json';

const PerthMosques = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Find Mosques in Perth WA | Quick Directory | No Ads | Free";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Find mosques in Perth WA with addresses, phone numbers, and directions. Use our search radius to locate the nearest masjid. Ad-free, community-built, 100% free.");
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/mosques-perth`);
    }

    // Inject JSON-LD structured data
    const cityUrl = `${window.location.origin}/mosques-perth`;
    const schema = generateCityPageSchema('Perth', cityUrl);
    injectJsonLdSchema(schema);
  }, []);

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const perthMosques = [
    {
      name: "Perth Mosque",
      address: "427 William St, Perth WA 6000",
      phone: "(08) 9328 8535",
      website: "https://perthmosque.org/",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wheelchair accessible", "Parking available", "Historical landmark"]
    },
    {
      name: "Islamic Centre of WA",
      address: "238 Guildford Rd, Maylands WA 6051",
      phone: "(08) 9271 3332",
      website: "https://www.icentrewa.com.au/",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wheelchair accessible", "Women's prayer area", "Community programs"]
    },
    {
      name: "Masjid Al Taqwa Mirrabooka",
      address: "135 Boyare Ave, Mirrabooka WA 6061",
      phone: "(08) 9248 8559",
      website: "https://altaqwa.org.au/",
      region: "North Perth",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Women's prayer area", "Wudu facilities", "Islamic education"]
    },
    {
      name: "Al Majid Mosque Padbury",
      address: "64 Walter Padbury Blvd, Padbury WA 6025",
      phone: "(04) 3412 2237",
      website: "",
      region: "North Perth",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Parking available", "Wudu facilities"]
    },
    {
      name: "Canning Suleymaniye Mosque",
      address: "239 Welshpool Rd, Queens Park WA 6107",
      phone: "(08) 9451 8699",
      website: "http://canningmosque.com/",
      region: "South Perth",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Women's prayer area", "Cultural programs", "Turkish community"]
    },
    {
      name: "Masjid Ibrahim",
      address: "1526 Leslie St, Southern River WA 6110",
      phone: "(04) 1278 5919",
      website: "https://www.masjidibrahim.com.au/",
      region: "South Perth",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wheelchair accessible", "Parking available", "Women's prayer area"]
    },
    {
      name: "Rivervale Islamic Centre",
      address: "9 Rowe Ave, Rivervale WA 6103",
      phone: "(08) 9362 2210",
      website: "",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Parking available", "Community center"]
    },
    {
      name: "Thornlie Mosque - Australian Islamic College",
      address: "26 Clancy Way, Thornlie WA 6108",
      phone: "(08) 9452 3531",
      website: "https://www.thornliemasjid.com/",
      region: "South Perth",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Islamic school", "Women's prayer area", "Parking available"]
    },
    {
      name: "High Wycombe Mosque - Madrasa Talimuddin Darul-Iman",
      address: "126 Sultana Rd W, High Wycombe WA 6057",
      phone: "(08) 9452 2892",
      website: "",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Islamic education", "Wudu facilities"]
    },
    {
      name: "Canning Vale Musalla",
      address: "Cnr Eucalyptus Blvd & Waratah Blvd, Canning Vale WA 6155",
      phone: "(04) 0260 3845",
      website: "",
      region: "South Perth",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Friday prayers", "Women's prayer area", "Community centre"]
    },
    {
      name: "Fremantle Mosque",
      address: "10 Blamey Pl, O'Connor WA 6163",
      phone: "(04) 2992 6629",
      website: "https://fremantlemosque.au/",
      region: "Fremantle Area",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wheelchair accessible", "Parking available", "Janazah facilities"]
    },
    {
      name: "Ar-Rukun Mosque Rockingham",
      address: "4 Attwood Way, Rockingham WA 6168",
      phone: "(08) 9527 8633",
      website: "https://www.ar-rukunmosque.org.au/",
      region: "Fremantle Area",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Women's prayer area", "Wudu facilities", "Community programs"]
    },
    {
      name: "Perth City Musallah",
      address: "Suite 3, 101 Murray St, Perth WA 6000",
      phone: "(08) 6249 6826",
      website: "https://www.perthcitymusallah.org.au/",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["CBD location", "Business district"]
    },
    {
      name: "Perth Ummah Centre",
      address: "56 Whitlock Rd, Queens Park WA 6107",
      phone: "(04) 4457 7484",
      website: "https://www.icentrewa.com.au/",
      region: "South Perth",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Women's prayer area", "Community programs"]
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12 bg-white rounded-2xl p-8 border border-gray-200">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-2">
            Western Australia Masjid Directory
          </h1>
        </header>

        {/* Masjids in WA */}
        <section className="mb-12 bg-white rounded-2xl p-8 border border-gray-200">
          {/* Region Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedRegion === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion(null)}
              className={`text-sm rounded-lg ${
                selectedRegion === null
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              All Regions
            </Button>
            <Button
              variant={selectedRegion === "North Perth" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("North Perth")}
              className={`text-sm rounded-lg ${
                selectedRegion === "North Perth"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              North Perth
            </Button>
            <Button
              variant={selectedRegion === "South Perth" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("South Perth")}
              className={`text-sm rounded-lg ${
                selectedRegion === "South Perth"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              South Perth
            </Button>
            <Button
              variant={selectedRegion === "CBD & Eastern Suburbs" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("CBD & Eastern Suburbs")}
              className={`text-sm rounded-lg ${
                selectedRegion === "CBD & Eastern Suburbs"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              CBD & Eastern Suburbs
            </Button>
            <Button
              variant={selectedRegion === "Fremantle Area" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("Fremantle Area")}
              className={`text-sm rounded-lg ${
                selectedRegion === "Fremantle Area"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              Fremantle Area
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {perthMosques.filter(mosque => selectedRegion === null || mosque.region === selectedRegion).map((mosque, index) => (
              <Card key={index} className="rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <h3 className="text-lg font-serif font-medium text-gray-900">{mosque.name}</h3>

                    <div className="space-y-2">
                      <div className="flex items-start text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-teal-600" />
                        <span className="text-sm leading-relaxed">{mosque.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-teal-600" />
                        <a href={`tel:${mosque.phone}`} className="text-sm hover:text-teal-600 transition-colors">{mosque.phone}</a>
                      </div>

                      {mosque.website && (
                        <div className="flex items-center text-gray-600">
                          <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0 text-teal-600" />
                          <a
                            href={mosque.website}
                            target="_parent"
                            rel="noopener noreferrer"
                            className="text-sm hover:text-teal-600 transition-colors truncate"
                            onClick={(e) => {
                              e.preventDefault();
                              try {
                                if (window.parent && window.parent !== window) {
                                  window.parent.open(mosque.website, '_blank');
                                } else {
                                  window.open(mosque.website, '_blank');
                                }
                              } catch (error) {
                                window.location.href = mosque.website;
                              }
                            }}
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Attributes */}
                    {mosque.attributes && mosque.attributes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {mosque.attributes.slice(0, 3).map((attr: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            {attr}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mosque.address)}`;
                        try {
                          if (window.parent && window.parent !== window) {
                            window.parent.open(mapsUrl, '_blank');
                          } else {
                            window.open(mapsUrl, '_blank');
                          }
                        } catch (error) {
                          window.location.href = mapsUrl;
                        }
                      }}
                      className="w-full text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg border-0"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why Choose Our Directory */}
        <section className="mb-12 bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">
            Why Choose Our Western Australia Directory
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Quick search with location radius</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Get directions instantly via Google Maps</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Contact details and basic facility info</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">Mobile-friendly for on-the-go searches</span>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="mb-8 bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6 text-center">
            Find mosques interstate
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <Link to="/mosques-melbourne" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">Victoria</Button>
            </Link>
            <Link to="/mosques-brisbane" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">Queensland</Button>
            </Link>
            <Link to="/mosques-adelaide" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">South Australia</Button>
            </Link>
            <Link to="/mosques-sydney" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">New South Wales</Button>
            </Link>
            <Link to="/mosques-tasmania" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">Tasmania</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Link to="/" className="w-full">
              <Button variant="outline" size="sm" className="w-full">Back to Main Directory</Button>
            </Link>
            <Link to="/faq" className="w-full">
              <Button variant="outline" size="sm" className="w-full">FAQ</Button>
            </Link>
            <Link to="/imam-profiles" className="w-full">
              <Button variant="outline" size="sm" className="w-full">Find an Imam</Button>
            </Link>
          </div>
        </section>

        {/* Footer with Logo */}
        <footer className="mt-16 mb-8">
          <div className="flex flex-col items-center justify-center gap-4 py-8 border-t">
            <img
              src="/masjid-nawabi-logo.png"
              alt="Masjid Nawabi Logo"
              className="h-24 w-24 rounded-full object-cover"
            />
            <p className="text-lg font-semibold text-primary">Find My Mosque Australia</p>
            <p className="text-sm text-muted-foreground">Made for quick and simple searching</p>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default PerthMosques;
