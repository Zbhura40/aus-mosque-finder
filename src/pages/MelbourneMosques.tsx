import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, ExternalLink, Star, Clock, CheckCircle2 } from 'lucide-react';
import MosqueLocator from '@/components/MosqueLocator';
import { generateCityPageSchema, injectJsonLdSchema } from '@/lib/json-ld-schema';
import mosquesData from '@/data/mosques-data.json';

const MelbourneMosques = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  useEffect(() => {
    document.title = "Find Mosques in Melbourne VIC | Quick Directory | No Ads | Free";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Find mosques in Melbourne VIC with addresses, phone numbers, and directions. Use our search radius to locate the nearest masjid. Ad-free, community-built, 100% free.");
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/mosques-melbourne`);
    }

    // Inject JSON-LD structured data
    const cityUrl = `${window.location.origin}/mosques-melbourne`;
    const schema = generateCityPageSchema('Melbourne', cityUrl);
    injectJsonLdSchema(schema);
  }, []);

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const melbourneMosques = [
    // North Melbourne
    {
      name: "Preston Mosque (Islamic Society of Victoria)",
      address: "90 Cramer Street, Preston VIC 3072",
      phone: "(03) 9470 2424",
      website: "https://isv.org.au",
      region: "North Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wheelchair accessible", "Parking available", "Wudu facilities"]
    },
    {
      name: "Coburg Islamic Centre (Fatih Mosque)",
      address: "31 Nicholson Street, Coburg VIC 3058",
      phone: "(03) 9386 5324",
      website: "https://cic.org.au",
      region: "North Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wudu facilities", "Women's prayer area"]
    },
    {
      name: "Brunswick Mosque (ICMG)",
      address: "660 Sydney Road, Brunswick VIC 3056",
      phone: "(03) 9385 8423",
      website: "https://icmgbrunswick.com.au",
      region: "North Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Turkish community", "Islamic education"]
    },
    {
      name: "Albanian Mosque Carlton North",
      address: "765 Drummond Street, Carlton North VIC 3054",
      phone: "(03) 9347 6505",
      website: "https://www.aais.org.au",
      region: "North Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Albanian community", "Women's prayer area"]
    },
    {
      name: "Fitzroy Turkish Islamic Society",
      address: "144 Palmer Street, Fitzroy VIC 3065",
      phone: "(03) 9417 5760",
      website: "",
      region: "North Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Turkish community"]
    },
    {
      name: "Craigieburn Mosque (ICMG)",
      address: "1550 Mickleham Road, Mickleham VIC 3064",
      phone: "(03) 9385 8423",
      website: "https://www.icmg.org.au/branches/craigieburn",
      region: "North Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Turkish community", "Parking available"]
    },
    // West Melbourne
    {
      name: "Australian Islamic Centre Newport",
      address: "23-31 Blenheim Road, Newport VIC 3015",
      phone: "(03) 9000 0177",
      website: "https://australianislamiccentre.org",
      region: "West Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wheelchair accessible", "Women's prayer area", "Community programs"]
    },
    {
      name: "Sunshine Mosque",
      address: "618 Ballarat Road, Sunshine VIC 3022",
      phone: "(03) 9363 8245",
      website: "https://www.sunshinemosque.com.au",
      region: "West Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Parking available", "Wudu facilities"]
    },
    {
      name: "Deer Park Mosque",
      address: "285 Station Road, Deer Park VIC 3023",
      phone: "(03) 9310 8811",
      website: "https://www.deerparkmasjid.com",
      region: "West Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Parking available", "Islamic education"]
    },
    {
      name: "Werribee Islamic Centre",
      address: "70 Wootten Road, Tarneit VIC 3029",
      phone: "(03) 9748 2864",
      website: "https://www.wicentre.org.au",
      region: "West Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wheelchair accessible", "Women's prayer area", "Community programs"]
    },
    {
      name: "Al-Taqwa Mosque",
      address: "201 Sayers Road, Truganina VIC 3029",
      phone: "(03) 9269 5000",
      website: "https://al-taqwa.vic.edu.au",
      region: "West Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Islamic school", "Women's prayer area", "Parking available"]
    },
    {
      name: "Melbourne Grand Mosque (MGM)",
      address: "70 Wootten Road, Tarneit VIC 3029",
      phone: "(03) 8087 2323",
      website: "https://mgm.org.au",
      region: "West Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Large capacity", "Community programs", "Parking available"]
    },
    // South Melbourne
    {
      name: "Emir Sultan Mosque Dandenong",
      address: "139 Cleeland Street, Dandenong VIC 3175",
      phone: "(04) 2374 1717",
      website: "https://www.emirsultanmosque.com",
      region: "South Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Turkish community", "Women's prayer area"]
    },
    {
      name: "Noble Park Mosque",
      address: "18 Leonard Avenue, Noble Park VIC 3174",
      phone: "(03) 9546 8089",
      website: "",
      region: "South Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Parking available"]
    },
    {
      name: "Keysborough Turkish Islamic Centre",
      address: "396 Greens Road, Keysborough VIC 3173",
      phone: "(03) 9709 0100",
      website: "",
      region: "South Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Turkish community", "Women's prayer area"]
    },
    {
      name: "Huntingdale Mosque (ABIC)",
      address: "320-326 Huntingdale Road, Huntingdale VIC 3166",
      phone: "(03) 9543 8037",
      website: "https://www.abicmelbourne.com.au",
      region: "South Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Wheelchair accessible", "Parking available", "Islamic school"]
    },
    {
      name: "Springvale Mosque",
      address: "68 Garnsworthy Street, Springvale VIC 3171",
      phone: "(03) 9546 8089",
      website: "",
      region: "South Melbourne",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Community programs"]
    },
    // CBD & Eastern Suburbs
    {
      name: "Islamic Council of Victoria (ICV)",
      address: "66-68 Jeffcott Street, West Melbourne VIC 3003",
      phone: "(03) 9328 2067",
      website: "https://icv.org.au",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["Main Islamic Council", "Community programs", "Administrative centre"]
    },
    {
      name: "Melbourne Madinah",
      address: "359 Exhibition Street, Melbourne VIC 3000",
      phone: "1300 623 462",
      website: "http://www.madinahnext.org",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      currentlyOpen: null,
      openingHours: [],
      attributes: ["CBD location", "Wheelchair accessible"]
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12 bg-white rounded-2xl p-8 border border-gray-200">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-2">
            Victoria Masjid Directory
          </h1>
        </header>

        {/* Masjids Section */}
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
              variant={selectedRegion === "West Melbourne" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("West Melbourne")}
              className={`text-sm rounded-lg ${
                selectedRegion === "West Melbourne"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              West
            </Button>
            <Button
              variant={selectedRegion === "North Melbourne" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("North Melbourne")}
              className={`text-sm rounded-lg ${
                selectedRegion === "North Melbourne"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              North
            </Button>
            <Button
              variant={selectedRegion === "South Melbourne" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("South Melbourne")}
              className={`text-sm rounded-lg ${
                selectedRegion === "South Melbourne"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              South
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {melbourneMosques.filter(mosque => selectedRegion === null || mosque.region === selectedRegion).map((mosque, index) => (
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
            Why Choose Our Victoria Directory
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
            <Link to="/mosques-sydney" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">New South Wales</Button>
            </Link>
            <Link to="/mosques-brisbane" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">Queensland</Button>
            </Link>
            <Link to="/mosques-adelaide" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">South Australia</Button>
            </Link>
            <Link to="/mosques-perth" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">Western Australia</Button>
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

export default MelbourneMosques;