import React from "react";
import { ExternalLink, Building2, Film, Award, Landmark, Users, HandHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Partnership {
  id: number;
  name: string;
  logo: string;
  category: string;
  description: string;
  partnershipType: string;
  link: string;
}

const HollandParkPartnerships = () => {
  const navigate = useNavigate();

  const partnerships: Partnership[] = [
    {
      id: 1,
      name: "SBS (Special Broadcasting Service)",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/70/SBS_logo_%282019%29.svg/320px-SBS_logo_%282019%29.svg.png",
      category: "Media & Broadcasting",
      description: "Featured Holland Park Mosque in the groundbreaking documentary series 'The Mosque Next Door' (2017), providing unprecedented 24-hour access into the mosque for the first time in Australia. The three-part series gave viewers an inside look at Australian mosque life and the Muslim community.",
      partnershipType: "Documentary Feature",
      link: "https://www.sbs.com.au/ondemand/tv-series/the-mosque-next-door"
    },
    {
      id: 2,
      name: "Southern Pictures",
      logo: "https://southernpictures.com.au/wp-content/uploads/2022/04/sp-logo-250px.png",
      category: "Media Production",
      description: "Production company that partnered with Holland Park Mosque to create 'The Mosque Next Door' documentary series. The collaboration followed the diverse community over one year as they confronted misconceptions and struggled for acceptance in modern Australia.",
      partnershipType: "Production Partnership",
      link: "https://southernpictures.com.au/productions-2/the-mosque-next-door/"
    },
    {
      id: 3,
      name: "Screen Australia",
      logo: "https://www.screenaustralia.gov.au/sa/media/common-design-elements/images/logo-screen-australia.svg",
      category: "Government Support",
      description: "Provided principal funding for 'The Mosque Next Door' documentary series, supporting the groundbreaking project that showcased Holland Park Mosque and Australia's Muslim community to a national audience.",
      partnershipType: "Major Funding Partner",
      link: "https://www.screenaustralia.gov.au/"
    },
    {
      id: 4,
      name: "Screen Queensland",
      logo: "https://screenqueensland.com.au/wp-content/uploads/2021/03/SQ-Logo-Landscape-1.svg",
      category: "State Government",
      description: "State government funding body that supported the production of 'The Mosque Next Door', helping to tell the important story of Holland Park Mosque and Queensland's Muslim heritage to audiences across Australia.",
      partnershipType: "Regional Funding Support",
      link: "https://screenqueensland.com.au/"
    },
    {
      id: 5,
      name: "ISA Collective",
      logo: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=200&fit=crop",
      category: "Architecture & Design",
      description: "Collaborated on the major renovation project to enhance the mosque's facilities for Brisbane's growing Muslim population. The project includes state-of-the-art education and prayer spaces, a multipurpose hall, underground amenities, a commercial lift, and open reflection lawns with scenic CBD views.",
      partnershipType: "Architectural Design",
      link: "https://www.isacollective.com.au/projects/ishp-mosque"
    },
    {
      id: 6,
      name: "Sadaqa Welfare Fund",
      logo: "https://sadaqa.org.au/wp-content/uploads/2023/06/Sadaqa-logo-300x87.png",
      category: "Charity & Fundraising",
      description: "Australian-based charity organisation founded in Sydney in 2013 that supports Holland Park Mosque through fundraising efforts for annual running costs. The partnership helps ensure the mosque can continue serving the community with quality programs and facilities.",
      partnershipType: "Fundraising Support",
      link: "https://sadaqa.org.au/fundraisers/holland-park-masjid"
    },
    {
      id: 7,
      name: "Queensland Muslim Cultural & Heritage Centre",
      logo: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=200&fit=crop",
      category: "Cultural Heritage",
      description: "Partnership initiative that celebrates the rich history, cultural diversity, and contributions of the Muslim community in Queensland. Holland Park Mosque, as the oldest mosque on the East Coast, plays a central role in preserving and sharing Queensland's Islamic heritage.",
      partnershipType: "Heritage Preservation",
      link: "https://www.qmchc.org.au/about-qmchc.php"
    },
    {
      id: 8,
      name: "Brisbane City Council - Heritage Brisbane",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/Brisbane_City_Council_logo.svg/320px-Brisbane_City_Council_logo.svg.png",
      category: "Local Government",
      description: "Holland Park Mosque is recognized as a heritage place by Brisbane City Council. Established in 1908, the mosque represents over 100 years of continuous Islamic worship and is a significant landmark in Brisbane's cultural landscape, demonstrating the long-standing presence of Muslims in the region.",
      partnershipType: "Heritage Recognition",
      link: "http://heritage.brisbane.qld.gov.au/heritage-places/906"
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Media & Broadcasting":
      case "Media Production":
        return <Film className="w-6 h-6" />;
      case "Government Support":
      case "State Government":
      case "Local Government":
        return <Landmark className="w-6 h-6" />;
      case "Architecture & Design":
        return <Building2 className="w-6 h-6" />;
      case "Charity & Fundraising":
        return <HandHeart className="w-6 h-6" />;
      case "Cultural Heritage":
        return <Award className="w-6 h-6" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Community Partnerships
            </h1>
            <p className="text-xl md:text-2xl text-blue-50">
              Building Bridges, Strengthening Community
            </p>
            <p className="text-lg text-blue-100 mt-4 max-w-3xl mx-auto">
              For over 114 years, Holland Park Mosque has partnered with organizations across media, government, architecture, and cultural sectors to serve our diverse community and preserve Queensland's Islamic heritage.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction */}
        <section className="mb-16">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-4">
              Our Collaborative Approach
            </h2>
            <p className="text-architectural-shadow/80 text-lg leading-relaxed mb-4">
              Holland Park Mosque believes in the power of partnership and collaboration. Since our establishment in 1908, we have worked with diverse organizations to strengthen our community, preserve our heritage, and promote understanding across cultural boundaries.
            </p>
            <p className="text-architectural-shadow/80 text-lg leading-relaxed">
              These partnerships enable us to provide better services, maintain our historic facilities, and share our rich cultural heritage with all Australians. We are grateful to all our partners who have supported our mission over the years.
            </p>
          </div>
        </section>

        {/* Partnership Categories */}
        <section className="mb-12">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-8 text-center">
            Partnership Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Film className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm">Media</h3>
              <p className="text-xs text-architectural-shadow/60 mt-1">2 Partners</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Landmark className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm">Government</h3>
              <p className="text-xs text-architectural-shadow/60 mt-1">3 Partners</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm">Design</h3>
              <p className="text-xs text-architectural-shadow/60 mt-1">1 Partner</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-sm">Heritage</h3>
              <p className="text-xs text-architectural-shadow/60 mt-1">2 Partners</p>
            </div>
          </div>
        </section>

        {/* Partnerships List */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-8 text-center">
            Our Partners
          </h2>
          <div className="space-y-8">
            {partnerships.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="md:flex">
                  {/* Logo Section */}
                  <div className="md:w-1/4 bg-gray-50 flex items-center justify-center p-8">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="max-w-full max-h-32 object-contain"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="md:w-3/4 p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold flex items-center gap-2">
                            {getCategoryIcon(partner.category)}
                            {partner.category}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl font-bold text-architectural-shadow mb-2">
                          {partner.name}
                        </h3>
                        <p className="text-blue-600 font-semibold text-sm mb-4">
                          {partner.partnershipType}
                        </p>
                      </div>
                    </div>

                    <p className="text-architectural-shadow/80 leading-relaxed mb-6">
                      {partner.description}
                    </p>

                    <a
                      href={partner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Learn More About This Partnership
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-12 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">
              Interested in Partnering With Us?
            </h2>
            <p className="text-xl mb-8 text-blue-50 max-w-2xl mx-auto">
              We welcome partnerships with organizations that share our values of community service, cultural preservation, and interfaith understanding.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg">
                Contact Us About Partnerships
              </button>
              <a
                href="https://www.hollandparkmosque.org.au/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-bold text-lg inline-flex items-center gap-2"
              >
                Visit Our Website
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-md p-12">
            <h3 className="font-display text-2xl font-bold text-architectural-shadow mb-8 text-center">
              Partnership Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">114</div>
                <div className="text-architectural-shadow/70">Years of Community Service</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">8+</div>
                <div className="text-architectural-shadow/70">Active Partnerships</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-architectural-shadow/70">Weekly Community Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">45+</div>
                <div className="text-architectural-shadow/70">Nationalities United</div>
              </div>
            </div>
          </div>
        </section>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate("/featured/holland-park-mosque")}
            className="px-8 py-3 bg-architectural-shadow text-white rounded-lg hover:bg-architectural-shadow/90 transition-colors font-semibold"
          >
            ← Back to Holland Park Mosque
          </button>
        </div>
      </div>
    </div>
  );
};

export default HollandParkPartnerships;
