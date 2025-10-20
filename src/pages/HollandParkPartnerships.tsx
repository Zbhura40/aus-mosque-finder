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

  // Verified partnerships from October 20, 2025
  const partnerships: Partnership[] = [
    {
      id: 1,
      name: "SBS - The Mosque Next Door",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/70/SBS_logo_%282019%29.svg/320px-SBS_logo_%282019%29.svg.png",
      category: "Media & Broadcasting",
      description: "Three-part documentary miniseries giving unprecedented 24-hour access inside Holland Park Mosque for the first time in Australia. The series revealed the diverse Muslim community and their daily lives at one of the nation's oldest mosques.",
      partnershipType: "Documentary Feature",
      link: "https://www.sbs.com.au/ondemand/tv-series/the-mosque-next-door"
    },
    {
      id: 2,
      name: "ISA Collective",
      logo: "https://www.isacollective.com.au/wp-content/themes/isa-collective-v2/images/logo.svg",
      category: "Architecture & Design",
      description: "Award-winning architectural firm behind the major mosque renovation. Winner of Master Builders Brisbane and Queensland Housing & Construction Awards 2022. Delivered state-of-the-art education and prayer spaces, multipurpose hall, underground amenities, commercial three-story lift, and reflection lawns with Brisbane CBD views.",
      partnershipType: "Architectural Design",
      link: "https://www.isacollective.com.au/projects/ishp-mosque"
    },
    {
      id: 3,
      name: "Brisbane City Council Heritage",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/Brisbane_City_Council_logo.svg/320px-Brisbane_City_Council_logo.svg.png",
      category: "Local Government",
      description: "Holland Park Mosque is an official Brisbane Heritage Place since 2003. Built 1968-1971 on the site of the original 1909 mosque, it's recognized as a rare example of traditionally styled Islamic architecture in Brisbane, representing continuous Muslim presence since the early 20th century.",
      partnershipType: "Heritage Recognition",
      link: "https://heritage.brisbane.qld.gov.au/heritage-places/906"
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
              Our Partnerships
            </h1>
            <p className="text-xl md:text-2xl text-blue-50">
              Collaborating to preserve heritage and serve community
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
              Key Partnerships
            </h2>
            <p className="text-architectural-shadow/80 text-lg leading-relaxed">
              Since 1908, Holland Park Mosque has collaborated with organizations across media, architecture, and government to preserve our heritage and serve our community.
            </p>
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
                <div className="p-8">
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
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-12 text-center">
            <h2 className="font-display text-3xl font-bold mb-6">
              Learn More About Our Partnerships
            </h2>
            <a
              href="https://www.hollandparkmosque.org.au/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg"
            >
              Visit Holland Park Mosque Website
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-md p-12">
            <h3 className="font-display text-2xl font-bold text-architectural-shadow mb-8 text-center">
              Heritage & Recognition
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">1909</div>
                <div className="text-architectural-shadow/70">Original Mosque Established</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">2003</div>
                <div className="text-architectural-shadow/70">Heritage Listed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">2022</div>
                <div className="text-architectural-shadow/70">Master Builders Award</div>
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
