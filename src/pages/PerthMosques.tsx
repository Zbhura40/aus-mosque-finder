import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone } from 'lucide-react';
import MosqueLocator from '@/components/MosqueLocator';

const PerthMosques = () => {
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
  }, []);

  const openDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Find Mosques in Perth | Quick Directory WA | No Ads
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Find mosque near me in Perth
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-6">
            <span>12+ mosques</span> • <span>Ad-free</span> • <span>Community built</span> • <span>100% free</span>
          </div>
          <Button size="lg" className="mb-8">Search Perth Mosques</Button>
        </header>

        {/* Mosque Directory Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-6 text-center">
            Perth Mosque Directory - Quick & Simple
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-4xl mx-auto">
            Perth's Muslim community is served by 12+ mosques across the metropolitan area. Our directory helps you quickly find the nearest mosque with accurate addresses, contact information, and directions. Whether you're looking for Friday prayers, visiting Perth, or new to the area, our ad-free directory makes finding your local mosque simple and fast.
          </p>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <MosqueLocator />
            </CardContent>
          </Card>
        </section>

        {/* Featured Mosques */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Featured Perth Mosques
          </h2>
          <div className="grid gap-4">
            {[
              { name: "Perth Mosque", address: "427 William St, Perth WA 6000", phone: "(08) 9328 4922" },
              { name: "Mirrabooka Mosque", address: "7 Camberwarra Dr, Mirrabooka WA 6061", phone: "(08) 9342 3244" },
              { name: "Langford Mosque", address: "24 Warton Rd, Canning Vale WA 6155", phone: "(08) 9455 4249" },
              { name: "Thornlie Mosque", address: "16 Thornlie Ave, Thornlie WA 6108", phone: "(08) 9459 8866" },
              { name: "Wanneroo Mosque", address: "23 Joondalup Dr, Wanneroo WA 6065", phone: "(08) 9405 1888" }
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
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        <a href={`tel:${mosque.phone}`} className="text-sm hover:text-primary">{mosque.phone}</a>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDirections(mosque.address)}
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

        {/* Perth Areas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Find Mosque Near Me in Perth Areas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">North Perth Mosques</h3>
                <p className="text-muted-foreground mb-3">Mirrabooka, Wanneroo, Joondalup</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Mirrabooka Islamic Centre</li>
                  <li>• Wanneroo Mosque</li>
                  <li>• Joondalup Prayer Centre</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">South Perth Islamic Centers</h3>
                <p className="text-muted-foreground mb-3">Canning Vale, Thornlie, Armadale</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Langford Mosque</li>
                  <li>• Thornlie Islamic Centre</li>
                  <li>• Armadale Prayer Room</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Perth CBD & West</h3>
                <p className="text-muted-foreground mb-3">Perth City, Fremantle areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Perth City Mosque</li>
                  <li>• Fremantle Islamic Centre</li>
                  <li>• West Perth Prayer Room</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">East Perth Prayer Facilities</h3>
                <p className="text-muted-foreground mb-3">Midland, Forrestfield areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Midland Islamic Centre</li>
                  <li>• Forrestfield Mosque</li>
                  <li>• Kalamunda Prayer Room</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Choose Our Directory */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Why Choose Our Perth Mosque Directory
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
            Frequently Asked Questions About Perth Mosques
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I find the nearest mosque in Perth?</h3>
                <p className="text-muted-foreground">Use our search feature to locate mosques within your preferred radius. Enter your suburb or postcode to see nearby options with addresses and contact details.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Are there Friday prayers available in Perth?</h3>
                <p className="text-muted-foreground">Yes, most Perth mosques offer Friday (Jummah) prayers. Contact the mosque directly for specific prayer times as they may vary.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I get directions to Perth mosques?</h3>
                <p className="text-muted-foreground">Each mosque listing includes a 'Get Directions' button that opens your preferred maps app with turn-by-turn directions.</p>
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
            <Link to="/mosques-melbourne">
              <Button variant="outline" size="sm">Melbourne Mosques</Button>
            </Link>
            <Link to="/mosques-brisbane">
              <Button variant="outline" size="sm">Brisbane Mosques</Button>
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

export default PerthMosques;