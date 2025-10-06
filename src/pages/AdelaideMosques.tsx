import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, ExternalLink, Star, Clock, CheckCircle2 } from 'lucide-react';
import MosqueLocator from '@/components/MosqueLocator';
import { generateCityPageSchema, injectJsonLdSchema } from '@/lib/json-ld-schema';
import mosquesData from '@/data/mosques-data.json';

const AdelaideMosques = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  useEffect(() => {
    document.title = "Find Mosques in Adelaide SA | Quick Directory | No Ads | Free";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Find mosques in Adelaide SA with addresses, phone numbers, and directions. Use our search radius to locate the nearest masjid. Ad-free, community-built, 100% free.");
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/mosques-adelaide`);
    }

    // Inject JSON-LD structured data
    const cityUrl = `${window.location.origin}/mosques-adelaide`;
    const schema = generateCityPageSchema('Adelaide', cityUrl);
    injectJsonLdSchema(schema);
  }, []);

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const adelaideMosques = [
    {
      name: "Adelaide City Mosque",
      address: "20-28 Little Gilbert Street, Adelaide SA 5000",
      phone: "(08) 8231 6443",
      website: "https://adelaidecitymosque.org.au/",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Historic", "Oldest mosque in Australia", "Wheelchair accessible"]
    },
    {
      name: "Masjid Omar Ibn ul-Khattab (Marion Mosque)",
      address: "658 Marion Road, Park Holme SA 5043",
      phone: "(08) 8374 2280",
      website: "https://islamicsocietysa.org.au/",
      region: "South Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Islamic Society HQ", "Wheelchair accessible"]
    },
    {
      name: "Masjid Al-Khalil (Islamic Arabic Centre)",
      address: "596 Torrens Road, Woodville North SA 5012",
      phone: "(08) 8268 1944",
      website: "",
      region: "Western Suburbs",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Arabic Centre", "Funeral Services", "Islamic Education"]
    },
    {
      name: "Masjid Abu Bakr As-Siddiq (Wandana Masjid)",
      address: "52-56 Wandana Avenue, Gilles Plains SA 5086",
      phone: "(08) 8396 0791",
      website: "",
      region: "North Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Parking available"]
    },
    {
      name: "Mahmood Mosque",
      address: "6-8 Toogood Avenue, Beverley SA 5009",
      phone: "(08) 7225 1459",
      website: "https://www.mahmoodmosque.org.au/",
      region: "Western Suburbs",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Ahmadiyya Muslim Community", "Largest mosque in Adelaide"]
    },
    {
      name: "Parafield Gardens Masjid (ICMG)",
      address: "92 Shepherdson Road, Parafield Gardens SA 5107",
      phone: "(08) 8182 5151",
      website: "https://www.icmg.org.au/branches/adelaide/",
      region: "North Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Turkish Mosque", "Sunday School"]
    },
    {
      name: "Adelaide Turkish Islamic and Cultural Centre",
      address: "714 Main North Road, Dry Creek SA 5094",
      phone: "(08) 8281 4639",
      website: "",
      region: "North Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Turkish Community", "Cultural Centre"]
    },
    {
      name: "Bosniaks Masjid",
      address: "1 Frederick Road, Royal Park SA 5014",
      phone: "0403 298 687",
      website: "https://bosniaksmasjidadelaide.com/",
      region: "Western Suburbs",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Bosnian Community"]
    },
    {
      name: "Maryam Masjid",
      address: "26 Clarke Street, Wayville SA 5034",
      phone: "",
      website: "https://maryammasjid.org.au/",
      region: "CBD & Eastern Suburbs",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Women's Mosque", "Near CBD"]
    },
    {
      name: "Noor Mosque (Ahmadiyya Muslim Association)",
      address: "28-30 Hillier Road, Morphett Vale SA 5162",
      phone: "(08) 7288 3354",
      website: "https://www.ahmadiyya.org.au/",
      region: "South Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Ahmadiyya Muslim Community"]
    },
    {
      name: "Islamic Information Centre of SA (IICSA)",
      address: "1/53 Henley Beach Road, Mile End SA 5031",
      phone: "(08) 7226 6268",
      website: "https://iicsa.com.au/",
      region: "Western Suburbs",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Islamic Centre", "Arabic School", "Youth Programs"]
    },
    {
      name: "Elizabeth Grove Masjid",
      address: "139-141 Hogarth Road, Elizabeth Grove SA 5112",
      phone: "(08) 8374 2280",
      website: "https://islamicsocietysa.org.au/",
      region: "North Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Islamic Society of SA"]
    },
    {
      name: "Murray Bridge Masjid",
      address: "85 Old Swanport Road, Murray Bridge SA 5253",
      phone: "(08) 8374 2280",
      website: "https://islamicsocietysa.org.au/",
      region: "North Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Islamic Society of SA", "Regional"]
    },
    {
      name: "Mount Gambier Masjid",
      address: "9A Cedar Street, Mount Gambier SA 5290",
      phone: "(08) 8374 2280",
      website: "https://islamicsocietysa.org.au/",
      region: "South Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Islamic Society of SA", "Regional"]
    },
    {
      name: "Renmark Masjid",
      address: "230 Fourteenth Street, Renmark SA 5341",
      phone: "(08) 8586 1229",
      website: "",
      region: "North Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Regional"]
    },
    {
      name: "Whyalla Islamic Centre & Masjid",
      address: "5 Morris Crescent, Whyalla Norrie SA 5608",
      phone: "",
      website: "",
      region: "North Adelaide",
      rating: null,
      verified: false,
      openingHours: [],
      currentlyOpen: null,
      attributes: ["Regional"]
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12 bg-white rounded-2xl p-8 border border-gray-200">
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-2">
            South Australia Masjid Directory
          </h1>
        </header>

        {/* Masjids in SA */}
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
              variant={selectedRegion === "North Adelaide" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("North Adelaide")}
              className={`text-sm rounded-lg ${
                selectedRegion === "North Adelaide"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              North Adelaide
            </Button>
            <Button
              variant={selectedRegion === "South Adelaide" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("South Adelaide")}
              className={`text-sm rounded-lg ${
                selectedRegion === "South Adelaide"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              South Adelaide
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
              variant={selectedRegion === "Western Suburbs" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion("Western Suburbs")}
              className={`text-sm rounded-lg ${
                selectedRegion === "Western Suburbs"
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              Western Suburbs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adelaideMosques.filter(mosque => selectedRegion === null || mosque.region === selectedRegion).map((mosque, index) => (
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
            Why Choose Our South Australia Directory
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
            <Link to="/mosques-sydney" className="w-full" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Button variant="outline" size="sm" className="w-full text-sm border-gray-300 hover:bg-gray-50 rounded-lg">New South Wales</Button>
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

export default AdelaideMosques;