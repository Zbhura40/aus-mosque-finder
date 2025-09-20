import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, ExternalLink } from 'lucide-react';
import MosqueLocator from '@/components/MosqueLocator';

const AdelaideMosques = () => {
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
            Find Mosques in Adelaide | Quick Directory SA | No Ads
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Find mosque near me in Adelaide
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-6">
            <span>10+ mosques</span> • <span>Ad-free</span> • <span>Community built</span> • <span>100% free</span>
          </div>
        </header>

        {/* Mosque Directory Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-6 text-center">
            Adelaide Mosque Directory - Quick & Simple
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-4xl mx-auto">
            Adelaide's Muslim community is supported by 10+ mosques throughout the metropolitan area. Our directory helps you quickly find the nearest mosque with accurate addresses, contact information, and directions. Whether you're looking for Friday prayers, visiting Adelaide, or new to the area, our ad-free directory makes finding your local mosque simple and fast.
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
                <Button variant="outline" className="w-full">Melbourne</Button>
              </Link>
              <Link to="/mosques-brisbane">
                <Button variant="outline" className="w-full">Brisbane</Button>
              </Link>
              <Link to="/mosques-perth">
                <Button variant="outline" className="w-full">Perth</Button>
              </Link>
              <Link to="/mosques-adelaide">
                <Button variant="default" className="w-full">Adelaide</Button>
              </Link>
            </div>
          </section>
        </section>

        {/* Featured Mosques */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Featured Adelaide Mosques
          </h2>
          <div className="grid gap-4">
            {[
              { name: "Islamic Society of South Australia", address: "45 Hartley Rd, Flinders Park SA 5025", phone: "(08) 8443 5804", website: "https://www.issa.org.au/" },
              { name: "Adelaide City Mosque", address: "32 Little Gilbert St, Adelaide SA 5000", phone: "(08) 8231 7006", website: "https://www.facebook.com/AdelaideCityMosque/" },
              { name: "Rostrevor Mosque", address: "24 Seventh Ave, Royston Park SA 5070", phone: "(08) 8337 3253", website: "https://www.facebook.com/RostrevorMosque/" },
              { name: "Woodville Mosque", address: "123 Woodville Rd, Woodville SA 5011", phone: "(08) 8445 9851", website: "https://www.facebook.com/WoodvilleMosque/" },
              { name: "Parafield Gardens Mosque", address: "23 Shepherdson Rd, Parafield Gardens SA 5107", phone: "(08) 8258 6606", website: "https://www.facebook.com/ParafieldGardensMosque/" },
              { name: "Salisbury Islamic Centre", address: "27 Glen Rd, Salisbury SA 5108", phone: "(08) 8281 9722", website: "https://www.facebook.com/SalisburyIslamicCentre/" },
              { name: "Marion Islamic Centre", address: "1268 South Rd, Clovelly Park SA 5042", phone: "(08) 8374 1400", website: "https://www.facebook.com/MarionIslamicCentre/" },
              { name: "Morphett Vale Mosque", address: "168 Main South Rd, Morphett Vale SA 5162", phone: "(08) 8382 6633", website: "https://www.facebook.com/MorphettValeMosque/" },
              { name: "Port Adelaide Prayer Room", address: "16 Commercial Rd, Port Adelaide SA 5015", phone: "(08) 8447 2299", website: "https://www.facebook.com/PortAdelaidePrayerRoom/" }
            ].map((mosque: { name: string; address: string; phone: string; website?: string }, index) => (
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
                          <a href={mosque.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">Visit Website</a>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mosque.address)}`, '_blank')}
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

        {/* Adelaide Areas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Find Mosque Near Me in Adelaide Areas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">North Adelaide Mosques</h3>
                <p className="text-muted-foreground mb-3">Rostrevor, Parafield, Salisbury</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Rostrevor Islamic Centre</li>
                  <li>• Parafield Gardens Mosque</li>
                  <li>• Salisbury Prayer Centre</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">West Adelaide Islamic Centers</h3>
                <p className="text-muted-foreground mb-3">Flinders Park, Woodville, Port Adelaide</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Islamic Society of SA</li>
                  <li>• Woodville Mosque</li>
                  <li>• Port Adelaide Prayer Room</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Adelaide CBD & East</h3>
                <p className="text-muted-foreground mb-3">Adelaide City, Burnside areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Adelaide City Mosque</li>
                  <li>• Burnside Islamic Centre</li>
                  <li>• Norwood Prayer Room</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">South Adelaide Prayer Facilities</h3>
                <p className="text-muted-foreground mb-3">Marion, Morphett Vale areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Marion Islamic Centre</li>
                  <li>• Morphett Vale Mosque</li>
                  <li>• Noarlunga Prayer Room</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Choose Our Directory */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Why Choose Our Adelaide Mosque Directory
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
            Frequently Asked Questions About Adelaide Mosques
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I find the nearest mosque in Adelaide?</h3>
                <p className="text-muted-foreground">Use our search feature in the home page to locate mosques within your preferred radius. Enter your suburb or postcode to see nearby options with addresses and contact details. Alternatively, we have curated a short list of mosques in each city for quick reading.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Are there Friday prayers available in Adelaide?</h3>
                <p className="text-muted-foreground">Yes, most Adelaide mosques offer Friday (Jummah) prayers. Contact the mosque directly for specific prayer times as they may vary.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I get directions to Adelaide mosques?</h3>
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
            <Link to="/mosques-melbourne">
              <Button variant="outline" size="sm">Melbourne Mosques</Button>
            </Link>
            <Link to="/mosques-brisbane">
              <Button variant="outline" size="sm">Brisbane Mosques</Button>
            </Link>
            <Link to="/mosques-perth">
              <Button variant="outline" size="sm">Perth Mosques</Button>
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

export default AdelaideMosques;