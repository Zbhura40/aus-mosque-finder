import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, User, ExternalLink } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useJsonLdSchema } from "@/hooks/useJsonLdSchema";

const ImamProfiles: React.FC = () => {
  useSEO('landing');
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
              Imam Profiles
            </h1>
            <p className="text-lg text-islamic-black/80 max-w-4xl mx-auto leading-relaxed">
              Browse the leading imams serving Australian masjids near me and discover each mosque's approach to prayer times, community services, and religious guidance. Planning to find a mosque or explore the nearest mosque for prayer? These imam profiles help make your visit more welcoming and meaningful.
            </p>
          </div>
        </div>
      </section>

      {/* Imam Profiles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
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

          <div className="text-center mt-12">
            <p className="text-sm text-islamic-black/60 max-w-3xl mx-auto">
              These imam profiles showcase the diverse leadership within Australian Muslim communities. Each masjid near me offers unique approaches to community service, prayer times guidance, and spiritual development. When you find a mosque that resonates with your needs, these imam profiles help ensure a more meaningful and welcoming experience.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ImamProfiles;