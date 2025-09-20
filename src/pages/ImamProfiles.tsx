import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, User, ExternalLink } from "lucide-react";
import { useJsonLdSchema } from "@/hooks/useJsonLdSchema";
import { SEOUtils } from "@/lib/seo-utils";

const ImamProfiles: React.FC = () => {
  // SEO optimization for Imam Profiles page
  useEffect(() => {
    const title = SEOUtils.generateImamProfilesPageTitle();
    const description = SEOUtils.generateImamProfilesPageMetaDescription();
    const url = window.location.href;
    
    SEOUtils.updateDocumentHead(title, description, url);
  }, []);

  useJsonLdSchema({
    type: 'website',
    name: 'Australian Mosque Directory - Imam Profiles',
    description: 'Meet the leading imams serving Australian masjids and Islamic centres'
  });

  const imams = [
    {
      name: "Sheikh Yahya Safi",
      bio: "Senior Imam of Lakemba Mosque with over 27 years of service, currently pursuing Ph.D. in Fiqh. President of the Fiqhi Council of Australia and author of Islamic personal development works.",
      mosque: "Lakemba Mosque, Sydney",
      websiteText: "Lebanese Muslim Association",
      websiteUrl: "https://www.lma.org.au/imams-sheikhs-bio",
      altText: "Photo of Sheikh Yahya Safi, Senior Imam at Lakemba Mosque"
    },
    {
      name: "Imam Shady Al-Sulieman",
      bio: "Founder of United Muslims of Australia and President of Australian National Imams Council. International speaker and community leader dedicated to Islamic education and interfaith dialogue.",
      mosque: "United Muslims of Australia, Sydney",
      websiteText: "United Muslims of Australia",
      websiteUrl: "https://www.uma.org.au/about-sheikhs/",
      altText: "Photo of Imam Shady Al-Sulieman, Founder of United Muslims of Australia"
    },
    {
      name: "Imam Uzair Akbar",
      bio: "Respected scholar serving Holland Park Mosque for over two decades. President of Council of Imams Queensland and member of ANIC, known for connecting with youth through engaging Islamic lectures.",
      mosque: "Holland Park Mosque, Brisbane",
      websiteText: "Holland Park Mosque",
      websiteUrl: "https://www.hollandparkmosque.org.au/imam-uzair/",
      altText: "Photo of Imam Uzair Akbar, Imam at Holland Park Mosque"
    },
    {
      name: "Imam Alaa Elzokm OAM",
      bio: "Order of Australia Medal recipient recognized for service to Islamic faith and multiculturalism. Community leader focused on establishing peaceful relationships between Australian Muslim and broader communities.",
      mosque: "Australian Muslim Community",
      websiteText: "Australian Government Honours",
      websiteUrl: "https://www.gg.gov.au/australian-honours-and-awardsorder-australiarecipient-profiles/imam-alaa-elzokm-oam",
      altText: "Photo of Imam Alaa Elzokm OAM, Order of Australia Medal recipient"
    },
    {
      name: "Imam Mohammed Shakeeb",
      bio: "Dedicated Imam serving the Perth Mosque community, providing spiritual guidance and Islamic education to the Western Australian Muslim community with commitment to traditional Islamic values.",
      mosque: "Perth Mosque, Western Australia",
      websiteText: "AussieMuslims.net",
      websiteUrl: "https://www.aussiemuslims.net/team/imam-mohammed-shakeeb/",
      altText: "Photo of Imam Mohammed Shakeeb, Imam at Perth Mosque"
    },
    {
      name: "Sheikh Ali Rabah",
      bio: "Serving Imam of Preston Mosque since 2018 and member of Board of Imams Council Victoria. Marriage celebrant active in charity events, interfaith dialogue, and community mediation services.",
      mosque: "Preston Mosque, Victoria",
      websiteText: "Islamic Society of Victoria",
      websiteUrl: "https://isv.org.au/our-imam/",
      altText: "Photo of Sheikh Ali Rabah, Imam at Preston Mosque"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-warm-ivory to-cream/50">
      {/* Header Section */}
      <section className="pt-24 pb-16 bg-cream/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-islamic-black mb-6">
              Renowned Imams Australia | Islamic Leaders Directory
            </h1>
            <h2 className="text-2xl font-semibold text-islamic-black/80 mb-4">
              Find an Imam Near You
            </h2>
            <p className="text-lg text-islamic-black/80 max-w-4xl mx-auto leading-relaxed">
              Planning to find an Imam near you? Here is a curated list of some of Australia's renowned Islamic Leaders. We will continue to add more profiles.
            </p>
          </div>
        </div>
      </section>

      {/* Imam Profiles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Button 
                variant="outline" 
                className="h-12 font-body text-sm font-medium hover:bg-islamic-green/10 hover:border-islamic-green hover:text-islamic-green border-2"
              >
                Sydney Islamic Leaders
              </Button>
              <Button 
                variant="outline" 
                className="h-12 font-body text-sm font-medium hover:bg-islamic-green/10 hover:border-islamic-green hover:text-islamic-green border-2"
              >
                Melbourne Imam Profiles
              </Button>
              <Button 
                variant="outline" 
                className="h-12 font-body text-sm font-medium hover:bg-islamic-green/10 hover:border-islamic-green hover:text-islamic-green border-2"
              >
                Brisbane & Queensland
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imams.map((imam, index) => (
              <Card key={index} className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-islamic-green/10 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-islamic-green" />
                  </div>
                  <h2 className="text-xl font-semibold text-islamic-black mb-2 text-center">
                    {imam.name}
                  </h2>
                  <p className="text-sm text-islamic-black/70 mb-4 leading-relaxed">
                    {imam.bio}
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-islamic-green mr-2 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{imam.mosque}</span>
                    </div>
                    <div className="flex items-start">
                      <ExternalLink className="w-4 h-4 text-islamic-green mr-2 mt-0.5 flex-shrink-0" />
                      <a 
                        href={imam.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-islamic-green hover:text-islamic-green/80 underline"
                      >
                        {imam.websiteText}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
};

export default ImamProfiles;