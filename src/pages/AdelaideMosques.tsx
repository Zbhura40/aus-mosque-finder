import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, ExternalLink, CheckCircle2 } from 'lucide-react';
import { generateCityPageSchema, injectJsonLdSchema } from '@/lib/json-ld-schema';
import { supabase } from '@/integrations/supabase/client';

interface Mosque {
  id: string;
  name: string;
  address: string;
  phone_number?: string;
  website?: string;
  suburb?: string;
  google_rating?: number;
  attributes?: string[];
  opening_hours?: any;
}

const AdelaideMosques = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch mosques from database
  useEffect(() => {
    const fetchMosques = async () => {
      try {
        const { data, error } = await supabase
          .from('mosques_cache' as any)
          .select('*')
          .eq('state', 'SA')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching mosques:', error);
        } else {
          setMosques((data as any) || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMosques();
  }, []);

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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading mosques...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-lg font-medium text-gray-900">
                  {mosques.length} Mosques in South Australia
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mosques.map((mosque) => (
                  <Card key={mosque.id} className="rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 bg-white">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <h3 className="text-lg font-serif font-medium text-gray-900">{mosque.name}</h3>

                        <div className="space-y-2">
                          <div className="flex items-start text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-teal-600" />
                            <span className="text-sm leading-relaxed">{mosque.address}</span>
                          </div>
                          {mosque.phone_number && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-teal-600" />
                              <a href={`tel:${mosque.phone_number}`} className="text-sm hover:text-teal-600 transition-colors">{mosque.phone_number}</a>
                            </div>
                          )}

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
                        {mosque.attributes && Array.isArray(mosque.attributes) && mosque.attributes.length > 0 && (
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
            </>
          )}
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
