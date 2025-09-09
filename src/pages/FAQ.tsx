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
      answer: "A mosque is a public place of worship used by Muslims. The English word \"mosque\" is derived from its Arabic equivalent, masjid, which means \"place of prostration.\" Suitably termed, because the Islamic prayer, or salat, includes prostrating oneself before God."
    },
    {
      question: "How is a mosque used?",
      answer: "The Mosque plays a central role in the Muslim community primarily because it functions as the place where we may congregate to perform the required five daily prayers as well as the Friday Communal Prayers. In the United States, mosques may also accommodate fulltime and weekend Islamic schools, day care centers, adult and youth study groups, Qur'anic instruction, and Arabic classes. Community social events, weddings, dinners during Ramadan (the month of fasting), Eid holiday prayers and celebrations, youth activities, and funeral services are all hosted in mosques throughout the United States."
    },
    {
      question: "Is a mosque a holy place?",
      answer: "A mosque is a place that is primarily dedicated for prayer. However, nothing is sacred about the building or the place itself. We may pray in our homes, offices, schools, or anywhere we find a clean surface."
    },
    {
      question: "Do mosques welcome visitors?",
      answer: "Yes, mosques in the United States welcome visitors. Tours and educational seminars can be arranged at most facilities. It is always best to call mosque administrators to arrange a tour, before arrival, because they want to make sure your visit is informative and enjoyable."
    },
    {
      question: "What are the distinctive features of a mosque?",
      answer: "The prayer hall in each mosque is oriented in the direction of Mecca, toward which Muslims worldwide face during prayers. In most cities in the United States, worshippers face northeast. Prayer halls are spacious and unfurnished in order to accommodate lines of worshippers standing, bowing, and prostrating in unison. Pews, chairs, altars or pulpits are not typical or permanent fixtures in the prayer hall. Members of the congregation usually sit on the floor, but chairs are available for those who want them. Mosques may accommodate men and women in the same prayer hall, but most mosques have two separate areas for men and women. Mosques vary in size from tiny storefronts serving a handful of worshippers to large Islamic community centers that can accommodate thousands."
    },
    {
      question: "What else is in the prayer area?",
      answer: "All mosques have a niche that indicates the direction for prayer. Some mosques also have a pulpit to the right of the niche, which is used by the imam to deliver the Friday sermon."
    },
    {
      question: "What about children in the prayer area?",
      answer: "Children are often present during prayers, whether participating, watching, or imitating the movements of older Muslims. Their presence continues the tradition of the Prophet Muhammad, who always demonstrated tenderness and affection towards children and stressed the need to make them an integral part of the community."
    },
    {
      question: "What might I hear during my visit?",
      answer: "You might hear us Muslims exchanging the Islamic greeting, \"as-salaamu alaykum,\" which is an Arabic phrase meaning, \"peace be with you\" and responding with, \"wa alaykum as-salaam\" meaning, \"and with you be peace.\" You might also hear the call to prayer or adhan, which is recited in Arabic and can be interpreted as follows:\n\nGod is most great.\nI bear witness that nothing is worthy of worship but God.\nI bear witness that Muhammad is a messenger of God.\nCome to prayer. Come to success. God is most great.*\nThere is no deity worthy of worship but God.\n\n*The preceding phrases are repeated more than once.\n\nYou might also hear the opening verses of the Qur'an, which constitute the most frequently recited chapter of the Qur'an. During the Islamic prayers we recite chapters or verses from the Holy Qur'an along with other phrases in Arabic. The Opening, or Al-Fatihah, can be interpreted as follows:\n\nIn the name of God, Most Compassionate, Most Merciful.\nPraise be to God, Lord of the Worlds.\nThe Most Compassionate, the Most Merciful. Master of the Day of Judgment.\nYou Alone we worship, and You Alone we ask for help.\nShow us the straight path.\nThe path of those whom You have favored,\nnot of those who earn Your anger, nor those who go astray."
    },
    {
      question: "What about the rest of the building?",
      answer: "Many mosques have a minaret, the large tower used to recite the call to prayer five times each day. In the United States, the minaret is mainly decorative.\n\nFacilities to perform ablution, or wudu, can be found in all mosques. Before we approach God in prayer we perform ablution by washing our hands, face, and feet. This serves as a way for us to purify and prepare ourselves to stand in prayer, both physically and psychologically. Wudu facilities range from washbasins to specially designed areas with built-in benches, floor drains and faucets.\n\nLibraries are found in most mosques. Reading selections include various literature on theology, law, philosophy, as well as collections of the traditions and sayings of the Prophet Muhammad. Copies of the Qur'an, Islam's revealed text, are always available to worshippers.\n\nWorks of Arabic calligraphy, mainly quotations from the Holy Qur'an, are used to decorate nearly every mosque and to incite contemplation of the revealed Word of God. Other common features found in the mosque are clocks or schedules displaying the times of the five daily prayers and large rugs or carpets covering the prayer hall floor."
    },
    {
      question: "What customs are observed when visiting a mosque?",
      answer: "Visitors to mosques should conduct themselves as they would when visiting any religious institution. They should feel free to ask questions about the mosque, its purpose, architecture, and activities. Muslims are always pleased to answer any questions about our faith and customs.\n\nMen and women customarily dress modestly when visiting a mosque. Examples of appropriate clothing may include loose-fitting shirts, blouses, pants/slacks or long skirts, and may we also suggest no shorts or sleeveless shirts. Typically, Muslim women wear a scarf at the mosque; however, guests and visitors should not feel obliged to do so. Since we require a clean area on which to pray, everyone removes his or her shoes prior to entering the prayer hall. Shoe racks are located near the prayer hall entrance."
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