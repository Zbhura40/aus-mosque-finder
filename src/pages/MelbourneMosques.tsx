import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, ExternalLink } from 'lucide-react';
import MosqueLocator from '@/components/MosqueLocator';
import { generateCityPageSchema, injectJsonLdSchema } from '@/lib/json-ld-schema';

const MelbourneMosques = () => {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Find Mosques in Melbourne | Quick Directory VIC | No Ads
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Find mosque near me in Melbourne
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-6">
            <span>20+ mosques</span> • <span>Ad-free</span> • <span>Community built</span> • <span>100% free</span>
          </div>
        </header>

        {/* Mosque Directory Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-6 text-center">
            Melbourne Mosque Directory - Quick & Simple
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-4xl mx-auto">
            Melbourne hosts a diverse Muslim community with 20+ mosques serving the greater Melbourne area. Our directory helps you quickly find the nearest mosque with accurate addresses, contact information, and directions. Whether you're looking for Friday prayers, visiting Melbourne, or new to the area, our ad-free directory makes finding your local mosque simple and fast.
          </p>
          
          {/* Search Featured Masjids By City */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
              Search Featured Masjids By City
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Link to="/mosques-sydney">
                <Button variant="outline" className="w-full">Sydney</Button>
              </Link>
              <Link to="/mosques-melbourne">
                <Button variant="default" className="w-full">Melbourne</Button>
              </Link>
              <Link to="/mosques-brisbane">
                <Button variant="outline" className="w-full">Brisbane</Button>
              </Link>
              <Link to="/mosques-perth">
                <Button variant="outline" className="w-full">Perth</Button>
              </Link>
              <Link to="/mosques-adelaide">
                <Button variant="outline" className="w-full">Adelaide</Button>
              </Link>
            </div>
          </section>
        </section>

        {/* Featured Mosques */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Featured Melbourne Mosques
          </h2>
          <div className="grid gap-4">
            {[
              { name: "Preston Mosque", address: "546 Bell St, Preston VIC 3072", phone: "(03) 9484 3330", website: "https://www.facebook.com/PrestonMosqueVic/" },
              { name: "Newport Mosque", address: "56 Mason St, Newport VIC 3015", phone: "(03) 9391 8613", website: "https://www.facebook.com/NewportMosque/" },
              { name: "Hoppers Crossing Mosque", address: "143 Hogans Rd, Hoppers Crossing VIC 3029", phone: "(03) 9749 7668", website: "https://www.facebook.com/HoppersCrossingMosque/" },
              { name: "Dandenong Mosque", address: "2 Princes Hwy, Dandenong VIC 3175", phone: "(03) 9794 0445", website: "https://www.facebook.com/DandenongMosque/" },
              { name: "Coburg Islamic Centre", address: "829 Sydney Rd, Coburg VIC 3058", phone: "(03) 9354 1842", website: "https://www.facebook.com/CoburgIslamicCentre/" },
              { name: "Box Hill Mosque", address: "45 Middleborough Rd, Box Hill VIC 3128", phone: "(03) 9890 2235", website: "https://www.facebook.com/BoxHillMosque/" }
            ].map((mosque, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{mosque.name}</h3>
                      <div className="flex items-center text-muted-foreground mb-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{mosque.address}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground mb-1">
                        <Phone className="w-4 h-4 mr-2" />
                        <a href={`tel:${mosque.phone}`} className="text-sm hover:text-primary">{mosque.phone}</a>
                      </div>
                      {mosque.website && (
                        <div className="flex items-center text-muted-foreground">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          <a 
                            href={mosque.website} 
                            target="_parent" 
                            rel="noopener noreferrer" 
                            className="text-sm hover:text-primary"
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
                      className="shrink-0"
                    >
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Melbourne Areas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Find Mosque Near Me in Melbourne Areas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">North Melbourne Mosques</h3>
                <p className="text-muted-foreground mb-3">Preston, Coburg, Broadmeadows</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Preston Islamic Centre</li>
                  <li>• Coburg Mosque</li>
                  <li>• Broadmeadows Islamic Centre</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">West Melbourne Islamic Centers</h3>
                <p className="text-muted-foreground mb-3">Newport, Hoppers Crossing, Werribee</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Newport Mosque</li>
                  <li>• Hoppers Crossing Mosque</li>
                  <li>• Werribee Islamic Centre</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">South Melbourne Prayer Facilities</h3>
                <p className="text-muted-foreground mb-3">Dandenong, Clayton, Noble Park</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dandenong Islamic Centre</li>
                  <li>• Clayton Mosque</li>
                  <li>• Noble Park Prayer Centre</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">East Melbourne Mosques</h3>
                <p className="text-muted-foreground mb-3">Box Hill, Doncaster areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Box Hill Mosque</li>
                  <li>• Doncaster Islamic Centre</li>
                  <li>• Ringwood Prayer Room</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Choose Our Directory */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Why Choose Our Melbourne Mosque Directory
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✅</span>
                    <span>Quick search with location radius</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✅</span>
                    <span>Get directions instantly via Google Maps</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✅</span>
                    <span>Contact details and basic facility info</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✅</span>
                    <span>Mobile-friendly for on-the-go searches</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Frequently Asked Questions About Melbourne Mosques
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I find the nearest mosque in Melbourne?</h3>
                <p className="text-muted-foreground">Use our search feature in the home page to locate mosques within your preferred radius. Enter your suburb or postcode to see nearby options with addresses and contact details. Alternatively, we have curated a short list of mosques in each city for quick reading.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Are there Friday prayers available in Melbourne?</h3>
                <p className="text-muted-foreground">Yes, most Melbourne mosques offer Friday (Jummah) prayers. Contact the mosque directly for specific prayer times as they may vary.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I get directions to Melbourne mosques?</h3>
                <p className="text-muted-foreground">Each mosque listing includes a 'Get Directions' button that opens your preferred maps app with turn-by-turn directions.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Why do you not publish prayer times?</h3>
                <p className="text-muted-foreground">This is a feature we are looking at developing in the future. We don't publish this currently.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Internal Links */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Find mosques in other Australian cities:
          </h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <Link to="/mosques-sydney">
              <Button variant="outline" size="sm">Sydney Mosques</Button>
            </Link>
            <Link to="/mosques-brisbane">
              <Button variant="outline" size="sm">Brisbane Mosques</Button>
            </Link>
            <Link to="/mosques-perth">
              <Button variant="outline" size="sm">Perth Mosques</Button>
            </Link>
            <Link to="/mosques-adelaide">
              <Button variant="outline" size="sm">Adelaide Mosques</Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">Back to Main Directory</Button>
            </Link>
            <Link to="/faq">
              <Button variant="outline" size="sm">FAQ</Button>
            </Link>
            <Link to="/imam-profiles">
              <Button variant="outline" size="sm">Find an Imam</Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MelbourneMosques;