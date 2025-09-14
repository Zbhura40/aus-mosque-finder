import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, HelpCircle, Building2 } from "lucide-react";
import { SEOUtils } from "@/lib/seo-utils";

const FAQ = () => {
  const navigate = useNavigate();

  // SEO optimization for FAQ page
  useEffect(() => {
    const title = "Mosque Etiquette & Islamic Prayer FAQs | Australian Muslim Guide";
    const description = "Learn mosque customs, prayer etiquette, and Islamic practices in Australia. Comprehensive guide for visitors and new Muslims.";
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
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/lovable-uploads/df75c306-9fa0-4287-ab32-4382608ba5e7.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Gradient overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header - Floating Design */}
        <div className="pt-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-12">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 mb-8">
                <HelpCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="font-elegant text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 drop-shadow-2xl">
                Frequently Asked Questions
              </h1>
              <p className="font-body text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                Understanding mosques and Islamic worship practices
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Glass Cards Design */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Introduction Card */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl overflow-hidden mb-12">
              <CardHeader className="border-b border-white/20 py-8">
                <CardTitle className="font-elegant text-3xl font-bold text-white flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  About Mosques
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="font-body text-lg text-white/90 leading-relaxed">
                  Understanding mosques and Islamic worship practices can help build bridges between communities. 
                  These frequently asked questions provide insight into the role, customs, and features of mosques 
                  to promote better understanding and cultural awareness.
                </p>
              </CardContent>
            </Card>

            {/* FAQ Items - Glass Effect */}
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300">
                  <CardHeader className="border-b border-white/20 py-6">
                    <CardTitle className="font-elegant text-xl font-bold text-white flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-golden-amber/20 backdrop-blur-sm flex items-center justify-center mt-1 flex-shrink-0 border border-golden-amber/40">
                        <span className="font-body text-sm font-bold text-golden-amber">Q</span>
                      </div>
                      {item.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-islamic-green/20 backdrop-blur-sm flex items-center justify-center mt-1 flex-shrink-0 border border-islamic-green/40">
                        <span className="font-body text-sm font-bold text-islamic-green">A</span>
                      </div>
                      <div className="flex-1">
                        {item.answer.split('\n\n').map((paragraph, pIndex) => (
                          <p key={pIndex} className="font-body text-lg text-white/90 leading-relaxed mb-4 last:mb-0">
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
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl overflow-hidden mt-12">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="font-elegant text-3xl font-bold text-white mb-4">
                    Have More Questions?
                  </h3>
                  <p className="font-body text-lg text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto">
                    If you have additional questions about mosques or Islamic practices, 
                    we encourage you to reach out to your local mosque community. 
                    Most mosques welcome questions and are happy to provide educational tours.
                  </p>
                  <Button
                    onClick={() => navigate("/")}
                    className="font-body text-lg font-semibold bg-white/20 hover:bg-white/30 text-white rounded-2xl shadow-lg border border-white/30 backdrop-blur-sm transition-all duration-300 px-8 py-4"
                  >
                    Find Mosques Near You
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;