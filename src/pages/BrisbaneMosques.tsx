import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, ExternalLink } from 'lucide-react';
import MosqueLocator from '@/components/MosqueLocator';

const BrisbaneMosques = () => {
  useEffect(() => {
    document.title = "Find Mosques in Brisbane QLD | Quick Directory | No Ads | Free";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Find mosques in Brisbane QLD with addresses, phone numbers, and directions. Use our search radius to locate the nearest masjid. Ad-free, community-built, 100% free.");
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/mosques-brisbane`);
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
            Find Mosques in Brisbane | Quick Directory QLD | No Ads
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Find mosque near me in Brisbane
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground mb-6">
            <span>15+ mosques</span> • <span>Ad-free</span> • <span>Community built</span> • <span>100% free</span>
          </div>
        </header>

        {/* Mosque Directory Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-6 text-center">
            Brisbane Mosque Directory - Quick & Simple
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-4xl mx-auto">
            Brisbane's growing Muslim community is served by 15+ mosques across the greater Brisbane area. Our directory helps you quickly find the nearest mosque with accurate addresses, contact information, and directions. Whether you're looking for Friday prayers, visiting Brisbane, or new to the area, our ad-free directory makes finding your local mosque simple and fast.
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
                <Button variant="default" className="w-full">Brisbane</Button>
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
            Featured Brisbane Mosques
          </h2>
          <div className="grid gap-4">
            {[
              { name: "Islamic Council of Queensland", address: "83 Kuraby Rd, Kuraby QLD 4112", phone: "(07) 3341 4122", website: "https://www.icq.org.au/" },
              { name: "Holland Park Mosque", address: "1 Tay St, Holland Park QLD 4121", phone: "(07) 3847 4499", website: "https://www.facebook.com/HollandParkMosque/" },
              { name: "Algester Mosque", address: "180 Algester Rd, Algester QLD 4115", phone: "(07) 3274 8233", website: "https://www.facebook.com/AlgesterMosque/" },
              { name: "Darra Mosque", address: "114 Monier Rd, Darra QLD 4076", phone: "(07) 3375 1792", website: "https://www.facebook.com/DarraMosque/" },
              { name: "Zillmere Mosque", address: "48 Zillmere Rd, Zillmere QLD 4034", phone: "(07) 3263 8288", website: "https://www.facebook.com/ZillmereMosque/" },
              { name: "Inala Islamic Centre", address: "15 Wirraway Parade, Inala QLD 4077", phone: "(07) 3372 1400", website: "https://www.facebook.com/InalaIslamicCentre/" },
              { name: "Goodna Mosque", address: "161 Queen St, Goodna QLD 4300", phone: "(07) 3818 0288", website: "https://www.facebook.com/GoodnaMosque/" },
              { name: "Logan Islamic Centre", address: "62 Wembley Rd, Logan Central QLD 4114", phone: "(07) 3808 4411", website: "https://www.facebook.com/LoganIslamicCentre/" },
              { name: "Carindale Islamic Centre", address: "1157 Creek Rd, Carindale QLD 4152", phone: "(07) 3843 4500", website: "https://www.facebook.com/CarindaleIslamicCentre/" },
              { name: "Redcliffe Islamic Centre", address: "75 Oxley Ave, Woody Point QLD 4019", phone: "(07) 3284 6655", website: "https://www.facebook.com/RedcliffeIslamicCentre/" }
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

        {/* Brisbane Areas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Find Mosque Near Me in Brisbane Areas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">South Brisbane Mosques</h3>
                <p className="text-muted-foreground mb-3">Holland Park, Kuraby, Algester</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Holland Park Mosque</li>
                  <li>• Islamic Council of Queensland</li>
                  <li>• Algester Islamic Centre</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">North Brisbane Islamic Centers</h3>
                <p className="text-muted-foreground mb-3">Zillmere, Inala areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Zillmere Mosque</li>
                  <li>• Inala Islamic Centre</li>
                  <li>• North Brisbane Prayer Centre</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">West Brisbane Prayer Facilities</h3>
                <p className="text-muted-foreground mb-3">Darra, Goodna areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Darra Mosque</li>
                  <li>• Goodna Islamic Centre</li>
                  <li>• Ipswich Prayer Room</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Brisbane CBD & East</h3>
                <p className="text-muted-foreground mb-3">City, Carindale areas</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Brisbane City Mosque</li>
                  <li>• Carindale Islamic Centre</li>
                  <li>• Mt Gravatt Prayer Room</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Choose Our Directory */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            Why Choose Our Brisbane Mosque Directory
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
            Frequently Asked Questions About Brisbane Mosques
          </h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I find the nearest mosque in Brisbane?</h3>
                <p className="text-muted-foreground">Use our search feature in the home page to locate mosques within your preferred radius. Enter your suburb or postcode to see nearby options with addresses and contact details. Alternatively, we have curated a short list of mosques in each city for quick reading.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Are there Friday prayers available in Brisbane?</h3>
                <p className="text-muted-foreground">Yes, most Brisbane mosques offer Friday (Jummah) prayers. Contact the mosque directly for specific prayer times as they may vary.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do I get directions to Brisbane mosques?</h3>
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

export default BrisbaneMosques;