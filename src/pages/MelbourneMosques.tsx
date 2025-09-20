import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MosqueLocator from '@/components/MosqueLocator';

const MelbourneMosques = () => {
  useEffect(() => {
    // Update SEO tags for Melbourne page
    document.title = "Find Mosques in Melbourne VIC | Free Mosque Directory | No Ads";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', "Quickly find mosques in Melbourne VIC with addresses and contact details. Use our search radius to locate the nearest masjid. Ad-free, community-built directory.");
    }

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${window.location.origin}/mosques-melbourne`);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Find Mosques in Melbourne | Quick Mosque Directory VIC | No Ads
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find mosques near you in Melbourne using our search radius feature. Get directions quickly with no ads or fuss.
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-primary mb-6 text-center">
            Melbourne Mosque Directory - Quick and Simple
          </h2>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <MosqueLocator />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Featured Melbourne Mosques</h3>
                <p className="text-muted-foreground mb-4">
                  Use our search to discover mosques across Melbourne with full contact details and addresses.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Find Mosque Near Me in Melbourne</h3>
                <p className="text-muted-foreground mb-4">
                  Enter your location and set your preferred search radius to find the closest masjid.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Get Directions to Melbourne Mosques</h3>
                <p className="text-muted-foreground mb-4">
                  Click any mosque for detailed information and instant directions via Google Maps.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            How to Use Our Melbourne Mosque Finder
          </h2>
          <Card>
            <CardContent className="p-6">
              <ol className="list-decimal list-inside space-y-3 text-lg">
                <li>Set your preferred search radius (within 3km, 10km, or 25km)</li>
                <li>Select your location method by using your current location or entering a postcode</li>
                <li>Click on Find Mosques</li>
                <li>Click on any Mosque to get directions and more information</li>
              </ol>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">
            About Our Mosque Directory
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">We try to keep it simple</h3>
                  <p className="text-muted-foreground">
                    No ads, no fuss - just find your mosque quickly with our community-built directory.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Completely Free</h3>
                  <p className="text-muted-foreground">
                    Our mosque directory is ad-free, community-built, and completely free to use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center mb-8">
          <div className="space-y-4 mb-8">
            <Link to="/faq">
              <Button variant="outline" size="lg" className="mr-4">
                FAQ & Help
              </Button>
            </Link>
            <Link to="/imam-profiles">
              <Button variant="outline" size="lg">
                Find an Imam
              </Button>
            </Link>
          </div>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Use Our Search to Find Mosques Near You
              </h3>
              <p className="text-lg text-muted-foreground">
                Get directions quickly and easily to any mosque in Melbourne. Our search radius feature helps you find exactly what you're looking for.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default MelbourneMosques;