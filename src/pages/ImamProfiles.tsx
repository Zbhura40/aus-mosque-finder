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
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="pt-24 pb-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-3">
              Find an Imam Near You
            </h1>
            <p className="text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Planning to find an Imam near you? Here is a curated list of some of Australia's renowned Islamic Leaders. We will continue to add more profiles.
            </p>
          </div>
        </div>
      </section>

      {/* Imam Profiles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imams.map((imam, index) => (
              <Card key={index} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-teal-50 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-serif font-medium text-gray-900 mb-2 text-center">
                    {imam.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {imam.bio}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{imam.mosque}</span>
                    </div>
                    <div className="flex items-start">
                      <ExternalLink className="w-4 h-4 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                      <a
                        href={imam.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 underline"
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