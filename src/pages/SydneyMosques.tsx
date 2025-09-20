import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone } from 'lucide-react';
import MosqueLocator from '@/components/MosqueLocator';

const SydneyMosques = () => {
  useEffect(() => {
    document.title = "Find Mosques in Sydney NSW | Quick Directory | No Ads | Free";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Find mosques in Sydney NSW with addresses, phone numbers, and directions. Use our search radius to locate the nearest masjid. Ad-free, community-built, 100% free.");
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/mosques-sydney`);
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
            Find Mosques in Sydney | Quick Directory NSW | No Ads
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Find mosque near me in Sydney
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-6">
            <span>25+ mosques</span> • <span>Ad-free</span> • <span>Community built</span> • <span>100% free</span>
          </div>
          <Button size="lg" className="mb-8">Search Sydney Mosques</Button>
        </header>

        {/* Mosque Directory Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-6 text-center">
            Sydney Mosque Directory - Quick & Simple
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-4xl mx-auto">
            Sydney is home to Australia's largest Muslim community with 25+ mosques serving the greater Sydney area. Our directory helps you quickly find the nearest mosque with accurate addresses, contact information, and directions. Whether you're looking for Friday prayers, visiting Sydney, or new to the area, our ad-free directory makes finding your local mosque simple and fast.
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
            Featured Sydney Mosques
          </h2>
          <div className="grid gap-4">
            {[
              { name: "Lakemba Mosque", address: "71-75 Wangee Rd, Lakemba NSW 2195", phone: "(02) 9750 1988" },
              { name: "Auburn Gallipoli Mosque", address: "122 Auburn Rd, Auburn NSW 2144", phone: "(02) 9649 6727" },
              { name: "Parramatta Mosque", address: "150 Marsden St, Parramatta NSW 2150", phone: "(02) 9630 9948" },
              { name: "Al Noor Mosque", address: "1 Haldon St, Lakemba NSW 2195", phone: "(02) 9740 0416" },
              { name: "Bankstown Mosque", address: "45 Restwell St, Bankstown NSW 2200", phone: "(02) 9708 3833" },
              { name: "Liverpool Mosque", address: "165 Bow St, Liverpool NSW 2170", phone: "(02) 9602 8277" },
              { name: "Blacktown Mosque", address: "35 Flushcombe Rd, Blacktown NSW 2148", phone: "(02) 9622 9544" },
              { name: "Fairfield Mosque", address: "2 Kenyon St, Fairfield NSW 2165", phone: "(02) 9724 4103" }
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

        {/* Sydney Areas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Find Mosque Near Me in Sydney Areas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Western Sydney Mosques</h3>
                <p className="text-muted-foreground mb-3">Auburn, Bankstown, Liverpool, Parramatta areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Auburn Gallipoli Mosque</li>
                  <li>• Bankstown Mosque & Community Centre</li>
                  <li>• Liverpool Islamic Centre</li>
                  <li>• Parramatta Masjid</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">South Sydney Islamic Centers</h3>
                <p className="text-muted-foreground mb-3">Lakemba, Hurstville, Rockdale areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lakemba Mosque</li>
                  <li>• Al Noor Mosque</li>
                  <li>• Hurstville Islamic Centre</li>
                  <li>• Rockdale Prayer Centre</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">North Sydney Prayer Facilities</h3>
                <p className="text-muted-foreground mb-3">Dee Why, Manly, North Sydney areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dee Why Islamic Centre</li>
                  <li>• North Sydney Prayer Room</li>
                  <li>• Northern Beaches Masjid</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Sydney CBD & Eastern Suburbs</h3>
                <p className="text-muted-foreground mb-3">City, Bondi, Maroubra areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Sydney City Mosque</li>
                  <li>• Bondi Islamic Centre</li>
                  <li>• Maroubra Prayer Facility</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Choose Our Directory */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Why Choose Our Sydney Mosque Directory
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

        {/* Popular Searches */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Popular Mosque Searches in Sydney
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  "Mosque near Lakemba",
                  "Friday prayer Sydney CBD",
                  "Auburn mosque contact",
                  "Islamic center Parramatta",
                  "Sydney masjid directory",
                  "Prayer facilities Bankstown"
                ].map((search, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                    "{search}"
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Frequently Asked Questions About Sydney Mosques
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I find the nearest mosque in Sydney?</h3>
                <p className="text-muted-foreground">Use our search feature to locate mosques within your preferred radius. Enter your suburb or postcode to see nearby options with addresses and contact details.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Are there Friday prayers available in Sydney?</h3>
                <p className="text-muted-foreground">Yes, most Sydney mosques offer Friday (Jummah) prayers. Contact the mosque directly for specific prayer times as they may vary.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I get directions to Sydney mosques?</h3>
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
            <Link to="/mosques-melbourne">
              <Button variant="outline" size="sm">Melbourne Mosques</Button>
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

export default SydneyMosques;