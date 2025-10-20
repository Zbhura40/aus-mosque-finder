import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Building2, Gift, HeartHandshake, Shield } from "lucide-react";
import { SEOUtils } from "@/lib/seo-utils";

const FAQ = () => {
  const navigate = useNavigate();

  // SEO optimization for FAQ page
  useEffect(() => {
    const title = SEOUtils.generateFAQPageTitle();
    const description = SEOUtils.generateFAQPageMetaDescription();
    const url = window.location.href;
    
    SEOUtils.updateDocumentHead(title, description, url);
  }, []);

  const faqItems = [
    {
      question: "What is a mosque?",
      answer: "A mosque is a Muslim place of worship, open to the public. The term \"mosque\" comes from the Arabic word \"masjid,\" which means \"place of prostration,\" reflecting the prayer posture central to Islamic worship."
    },
    {
      question: "How is a mosque used?",
      answer: "The mosque is the heart of the Muslim community, serving as the location for daily prayers and the Friday congregation. In places like Australia, mosques may also host Islamic classes, community celebrations, weddings, Ramadan dinners, youth activities, and funeral services."
    },
    {
      question: "Is a mosque considered holy?",
      answer: "While mosques are intended primarily for prayers and religious activities, the building itself is not regarded as inherently sacred. Muslims may also pray in their homes, workplaces, schools, or any clean area."
    },
    {
      question: "Do mosques welcome visitors?",
      answer: "Yes, mosques generally encourage visitors. Arranging a tour ahead of time with mosque staff is recommended, ensuring that the visit is informative and respectful."
    },
    {
      question: "What are common features of mosques?",
      answer: "The main prayer area is aligned toward Mecca, allowing worshippers to pray in the same direction. These spaces are open and have minimal furnishings. Men and women may have separate or shared areas. Mosques range from small storefronts to vast centers serving thousands."
    },
    {
      question: "What can be found in the prayer hall?",
      answer: "Every mosque includes a niche showing the direction of prayer. Some also have a pulpit for sermons. Seating is typically on the floor, but chairs are available for those who need them."
    },
    {
      question: "Are children allowed in the mosque?",
      answer: "Children often join prayers, watch, or mimic adults, reflecting the Prophet Muhammad's (peace be upon him) tradition of including children in communal worship and fostering their connection to the community."
    },
    {
      question: "What sounds might I hear inside a mosque?",
      answer: "You'll likely hear greetings in Arabic such as \"as-salaamu alaykum\" (peace be with you), the call to prayer (adhan), and passages from the Qur'an—including the commonly recited opening chapter, Al-Fatihah—during worship."
    },
    {
      question: "What else is part of a mosque building?",
      answer: "Many mosques have a minaret, primarily decorative in Western countries. Ablution facilities are provided for ritual washing prior to prayer. Libraries, Qur'an copies, Islamic writings, Arabic calligraphy, clocks for prayer times, and carpets or rugs are also typically present."
    },
    {
      question: "What customs should visitors observe?",
      answer: "Visitors should behave respectfully, similar to attending any religious site, and are encouraged to ask questions. Modest clothing is advised (loose-fitting attire; women may wear a headscarf, but it isn't required for guests), and everyone must remove shoes before entering the prayer hall. Shoe racks are available near the entrance."
    },
    {
      question: "How can I find the nearest mosque or search for mosques near me to attend daily prayers?",
      answer: "To find the nearest mosque or search for mosques near me, use our online mosque directory. Simply enter your location or allow location access, or search for masjids using our search radius buttons (3kms, 10kms or 25kms) and you'll see a list of mosques and masjids based on your criteria, including directions and contact details for each one."
    },
    {
      question: "Where can I check accurate prayer times for a masjid near me or the closest mosque near me?",
      answer: "At this stage, we do not publish prayer times. We recommend contacting the masjid directly. If this is a feature you would like to see, please let us know."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-6">
              <HelpCircle className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-3">
              Frequently Asked Questions - Find Masjid Near Me
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Understanding mosques and Islamic worship practices
            </p>
          </div>
        </div>
      </div>

      {/* Trust Building Section */}
      <section className="container mx-auto px-4 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free to Use */}
            <div className="text-center space-y-4 p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                <Gift className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-serif font-medium text-gray-900">100% Free</h3>
              <p className="text-sm text-gray-600 leading-relaxed">This platform is completely free to use, with zero ads of any kind.</p>
            </div>

            {/* Built by Muslims */}
            <div className="text-center space-y-4 p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto rounded-full bg-teal-100 flex items-center justify-center">
                <HeartHandshake className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-serif font-medium text-gray-900">Community Built</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Designed and managed by Muslims, with your best interests at heart.</p>
            </div>

            {/* No Ads Ever */}
            <div className="text-center space-y-4 p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-serif font-medium text-gray-900">No Ads Ever</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Absolutely no advertisements—ever. Just a clean, focused experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introduction Card */}
          <Card className="bg-white border border-gray-200 rounded-lg mb-8">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="text-xl font-serif font-medium text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <h2>Finding Mosques and Islamic Centers</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                Understanding mosques and Islamic worship practices can help build bridges between communities.
                These frequently asked questions provide insight into the role, customs, and features of mosques
                to promote better understanding and cultural awareness.
              </p>
            </CardContent>
          </Card>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
                <CardHeader className="border-b border-gray-200 pb-4">
                  <CardTitle className="text-base font-medium text-gray-900 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-xs font-semibold text-teal-600">Q</span>
                    </div>
                    <h3>{item.question}</h3>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">A</span>
                    </div>
                    <div className="flex-1">
                      {item.answer.split('\n\n').map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
                          {paragraph.split('\n').map((line, lIndex) => (
                            <React.Fragment key={lIndex}>
                              {line}
                              {lIndex < paragraph.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer Card - Call to Action */}
          <Card className="bg-white border border-gray-200 rounded-lg mt-8">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">
                  Have More Questions?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-2xl mx-auto">
                  If you have additional questions about mosques or Islamic practices,
                  we encourage you to reach out to your local mosque community.
                  Most mosques welcome questions and are happy to provide educational tours.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="text-base font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 py-2"
                >
                  Find Mosques Near You
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;