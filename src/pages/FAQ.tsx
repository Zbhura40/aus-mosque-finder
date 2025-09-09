import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, HelpCircle, Building2 } from "lucide-react";

const FAQ = () => {
  const navigate = useNavigate();

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
    }
  ];

  return (
    <div className="min-h-screen bg-background elegant-texture">
      {/* Header */}
      <div className="bg-olive-green text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10 rounded-xl transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/30">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="font-elegant text-5xl lg:text-6xl font-bold leading-tight mb-4">
                Frequently Asked Questions
              </h1>
              <p className="font-body text-xl text-white/90">
                Common Questions about Mosques - By the Lado Group
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction Card */}
          <Card className="bg-warm-ivory border-2 border-golden-beige/60 shadow-xl rounded-2xl overflow-hidden mb-12">
            <CardHeader className="bg-warm-ivory border-b border-golden-beige/40 py-8">
              <CardTitle className="font-elegant text-3xl font-bold text-archway-black flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-olive-green/15 flex items-center justify-center border border-golden-beige/60">
                  <Building2 className="w-6 h-6 text-olive-green" />
                </div>
                About Mosques
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-warm-ivory p-8">
              <p className="font-body text-lg text-slate-blue leading-relaxed">
                Understanding mosques and Islamic worship practices can help build bridges between communities. 
                These frequently asked questions provide insight into the role, customs, and features of mosques 
                to promote better understanding and cultural awareness.
              </p>
            </CardContent>
          </Card>

          {/* FAQ Items */}
          <div className="space-y-8">
            {faqItems.map((item, index) => (
              <Card key={index} className="bg-warm-ivory border-2 border-golden-beige/60 shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-warm-ivory border-b border-golden-beige/40 py-6">
                  <CardTitle className="font-elegant text-xl font-bold text-archway-black flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-burnt-ochre/15 flex items-center justify-center mt-1 flex-shrink-0 border border-golden-beige/40">
                      <span className="font-body text-sm font-bold text-burnt-ochre">Q</span>
                    </div>
                    {item.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-warm-ivory p-8">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-olive-green/15 flex items-center justify-center mt-1 flex-shrink-0 border border-golden-beige/40">
                      <span className="font-body text-sm font-bold text-olive-green">A</span>
                    </div>
                    <div className="flex-1">
                      {item.answer.split('\n\n').map((paragraph, pIndex) => (
                        <p key={pIndex} className="font-body text-lg text-slate-blue leading-relaxed mb-4 last:mb-0">
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

          {/* Footer Card */}
          <Card className="bg-warm-ivory border-2 border-golden-beige/60 shadow-xl rounded-2xl overflow-hidden mt-12">
            <CardContent className="bg-warm-ivory p-8">
              <div className="text-center">
                <h3 className="font-elegant text-2xl font-bold text-archway-black mb-4">
                  Have More Questions?
                </h3>
                <p className="font-body text-lg text-slate-blue leading-relaxed mb-6">
                  If you have additional questions about mosques or Islamic practices, 
                  we encourage you to reach out to your local mosque community. 
                  Most mosques welcome questions and are happy to provide educational tours.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="font-body text-lg font-semibold bg-olive-green hover:bg-olive-green/80 text-white rounded-xl shadow-lg border-2 border-golden-beige/40 transition-all duration-300 px-8 py-3"
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