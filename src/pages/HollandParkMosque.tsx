import React from "react";
import { MapPin, Phone, Globe, Clock, Users, BookOpen, Heart, Home as HomeIcon, Calendar, Star, User, CalendarDays, Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HollandParkMosque = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-warm-ivory">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-br from-islamic-green to-architectural-shadow">
        <div className="absolute inset-0 bg-black/30"></div>
        <img
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1600&h=900&fit=crop"
          alt="Holland Park Mosque"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-6">
            <div className="flex justify-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-golden-amber text-architectural-shadow text-sm font-semibold rounded-full">
                Featured
              </span>
              <span className="px-4 py-1.5 bg-islamic-green text-white text-sm font-semibold rounded-full">
                Historic Site
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              Holland Park Mosque
            </h1>
            <p className="text-xl md:text-2xl text-warm-ivory/90 mb-6">
              Islamic Society of Holland Park
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Holland Park, QLD</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Est. 1908</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>500+ Weekly Attendees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <button
            onClick={() => navigate("/featured/holland-park-mosque/donate")}
            className="px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green/90 transition-colors font-semibold flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Donate
          </button>
          <button
            onClick={() => navigate("/featured/holland-park-mosque/events")}
            className="px-6 py-3 bg-golden-amber text-architectural-shadow rounded-lg hover:bg-golden-amber/90 transition-colors font-semibold flex items-center gap-2"
          >
            <CalendarDays className="w-5 h-5" />
            Events
          </button>
          <button
            onClick={() => navigate("/featured/holland-park-mosque/partnerships")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
          >
            <Handshake className="w-5 h-5" />
            Partnerships
          </button>
          <a
            href="tel:+61731617793"
            className="px-6 py-3 bg-architectural-shadow text-white rounded-lg hover:bg-architectural-shadow/90 transition-colors font-semibold flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Call
          </a>
          <a
            href="https://maps.google.com/?q=309+Nursery+Road,+Holland+Park+QLD+4121"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-architectural-shadow text-white rounded-lg hover:bg-architectural-shadow/90 transition-colors font-semibold flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Get Directions
          </a>
        </div>

        {/* About Section */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            About
          </h2>
          <div className="space-y-4 text-architectural-shadow/80 text-lg leading-relaxed">
            <p>
              The Holland Park Mosque is the oldest Masjid on the East Coast of Australia and has consistently been opened for over 100 years. Established in 1908 by Afghan cameleers, this 114 year old site is a pioneer for all Islamic societies, and a major spiritual hub of Brisbane and its surrounding cities.
            </p>
            <p>
              Boasting a rich history, the Holland Park Mosque is a proud testament to how Muslims have been a part of the Australian fabric for over a century. We serve the growing needs of the Muslim community, while providing a safe, peaceful and inclusive space to all members of the community.
            </p>
            <p>
              The Holland Park Mosque was featured in the highly rated "The Mosque Next Door" TV series by SBS. Please feel welcome at the Holland Park Mosque.
            </p>
          </div>
        </section>

        {/* Our Philosophy */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-8 text-center">
            Our Philosophy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-islamic-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-islamic-green" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Knowledge</h3>
              <p className="text-sm text-architectural-shadow/70">
                An important component of every Muslims journey is knowledge.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-islamic-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-islamic-green" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Spirituality</h3>
              <p className="text-sm text-architectural-shadow/70">
                Ihsan was the way of our Messenger.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-islamic-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-islamic-green" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Community</h3>
              <p className="text-sm text-architectural-shadow/70">
                We pray together, we break our fast together, Islam is community.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-islamic-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-islamic-green" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Services</h3>
              <p className="text-sm text-architectural-shadow/70">
                Being in service to others is the duty of every Muslim.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16 bg-gradient-to-r from-islamic-green to-islamic-green/80 text-white rounded-xl p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">45+</div>
              <div className="text-xl">Nationalities Represented</div>
              <p className="text-sm mt-2 text-warm-ivory/80">Diverse community</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-xl">Weekly Jummah Attendees</div>
              <p className="text-sm mt-2 text-warm-ivory/80">Growing congregation</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">114</div>
              <div className="text-xl">Years of Service</div>
              <p className="text-sm mt-2 text-warm-ivory/80">Continuous operation since 1908</p>
            </div>
          </div>
        </section>

        {/* Best Times to Visit */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Best Times to Visit
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-architectural-shadow/80 mb-6">
              The mosque welcomes visitors throughout the week. For the best experience, visit during prayer times to witness the community gathering. Jummah (Friday prayer) is particularly special with over 500 attendees.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-islamic-green/5 rounded-lg">
                <h4 className="font-semibold text-lg mb-2 text-islamic-green">Most Active</h4>
                <p className="text-architectural-shadow/80">Fridays 12:00 PM - 2:00 PM</p>
                <p className="text-sm text-architectural-shadow/60 mt-1">Jummah Prayer</p>
              </div>
              <div className="p-6 bg-golden-amber/5 rounded-lg">
                <h4 className="font-semibold text-lg mb-2 text-golden-amber">Peaceful</h4>
                <p className="text-architectural-shadow/80">Weekdays after Fajr</p>
                <p className="text-sm text-architectural-shadow/60 mt-1">Quiet reflection time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services & Facilities */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Services & Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Heart className="w-10 h-10 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-2">Marriage Services</h3>
              <p className="text-architectural-shadow/70">
                Imam Uzair is a highly regarded, registered marriage celebrant who has solemnized hundreds of marriages.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <BookOpen className="w-10 h-10 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-2">Madressa</h3>
              <p className="text-architectural-shadow/70">
                Quality Islamic Education according to the Quran and Sunnah. Classes for boys, girls, and Hifz programs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="w-10 h-10 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-2">Community Hall</h3>
              <p className="text-architectural-shadow/70">
                Opportunity to participate in different types of community activities and events.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Globe className="w-10 h-10 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-2">Shahada</h3>
              <p className="text-architectural-shadow/70">
                Supporting those taking the declaration of faith in the oneness of Allah and acceptance of Prophet Muhammad (PBUH).
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <BookOpen className="w-10 h-10 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-2">Islamic Bookshop</h3>
              <p className="text-architectural-shadow/70">
                Available and open to all members of the community with various Islamic literature and resources.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Heart className="w-10 h-10 text-islamic-green mb-4" />
              <h3 className="font-semibold text-xl mb-2">Counselling</h3>
              <p className="text-architectural-shadow/70">
                Professional support for community members facing various challenges.
              </p>
            </div>
          </div>
        </section>

        {/* Opening Hours */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Opening Hours
          </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-islamic-green">Daily Prayers</h3>
                <p className="text-architectural-shadow/70 mb-4">
                  The mosque is open for all five daily prayers. Prayer times vary based on the Islamic calendar and solar position.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Fajr:</span>
                    <span className="text-architectural-shadow/70">Before sunrise</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dhuhr:</span>
                    <span className="text-architectural-shadow/70">Midday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Asr:</span>
                    <span className="text-architectural-shadow/70">Afternoon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Maghrib:</span>
                    <span className="text-architectural-shadow/70">Sunset</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Isha:</span>
                    <span className="text-architectural-shadow/70">Night</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-islamic-green">Madressa Schedule</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Boys (Mon - Thu)</p>
                    <p className="text-architectural-shadow/70">Class 1: 4:00 PM - 5:30 PM</p>
                    <p className="text-architectural-shadow/70">Class 2: 5:30 PM - 7:00 PM</p>
                  </div>
                  <div>
                    <p className="font-medium">Girls (Mon - Thu)</p>
                    <p className="text-architectural-shadow/70">Class 1: 4:00 PM - 5:30 PM</p>
                    <p className="text-architectural-shadow/70">Class 2: 5:30 PM - 7:00 PM</p>
                  </div>
                  <div>
                    <p className="font-medium">Hifz (Mon - Sat)</p>
                    <p className="text-architectural-shadow/70">After Fajr & Asr prayers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Location
          </h2>

          {/* Google Maps Embed */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="w-full h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3539.9901396742967!2d153.06174631506237!3d-27.51868898288058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b9145f7c640d84d%3A0x86f9b8fc8f72b64f!2sHolland%20Park%20Mosque!5e0!3m2!1sen!2sau!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Holland Park Mosque Location"
              ></iframe>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-islamic-green" />
                Address
              </h3>
              <p className="text-architectural-shadow/80 mb-4">
                309 Nursery Road, Holland Park QLD 4121, Australia
              </p>
              <a
                href="https://maps.google.com/?q=309+Nursery+Road,+Holland+Park+QLD+4121"
                target="_blank"
                rel="noopener noreferrer"
                className="text-islamic-green hover:text-islamic-green/80 font-semibold text-sm"
              >
                Get Directions →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-islamic-green" />
                Website
              </h3>
              <p className="text-architectural-shadow/80 mb-4 break-words">
                www.hollandparkmosque.org.au
              </p>
              <a
                href="https://www.hollandparkmosque.org.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-islamic-green hover:text-islamic-green/80 font-semibold text-sm"
              >
                Visit Website →
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5 text-islamic-green" />
                Phone
              </h3>
              <p className="text-architectural-shadow/80 mb-4">
                +61 7 3161 7793
              </p>
              <a
                href="tel:+61731617793"
                className="text-islamic-green hover:text-islamic-green/80 font-semibold text-sm"
              >
                Call Now →
              </a>
            </div>
          </div>

          {/* Getting There */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="font-semibold text-2xl mb-6">Getting There</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-islamic-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  By Public Transport
                </h4>
                <p className="text-architectural-shadow/70 ml-7">
                  Take bus routes 160, 170, or 222 to Holland Park. The mosque is a short walk from the bus stop on Logan Road.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-islamic-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  By Car
                </h4>
                <p className="text-architectural-shadow/70 ml-7">
                  Free parking is available on-site. Enter via Nursery Road. The mosque is easily accessible from the M1 and Gateway Motorway.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-islamic-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Travel Time from Brisbane CBD
                </h4>
                <p className="text-architectural-shadow/70 ml-7">
                  Approximately 15-20 minutes by car, 30-40 minutes by public transport.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Imam Profile */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Religious Leadership
          </h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="w-full aspect-square bg-islamic-green/10 rounded-lg flex items-center justify-center">
                  <User className="w-24 h-24 text-islamic-green" />
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="font-display text-2xl font-bold mb-3">Imam Uzair Akbar</h3>
                <p className="text-architectural-shadow/70 mb-4 leading-relaxed">
                  Religious Scholar | Imam | President Council of Imams (CIQ) QLD Australia | Marriage Celebrant | Motivational Speaker | Director of Centre of Excellence (CoE) | Head of Shariah Board Amanah Islamic Finance Australia (AIFA) | Australian National Council of Imams (ANIC)
                </p>
                <a
                  href="https://www.hollandparkmosque.org.au/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-islamic-green hover:text-islamic-green/80 font-semibold"
                >
                  Learn More About Imam Uzair →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3">Are visitors welcome at the mosque?</h3>
              <p className="text-architectural-shadow/70">
                Yes, the Holland Park Mosque welcomes visitors of all backgrounds. We provide a safe, peaceful and inclusive space to all members of the community. Please dress modestly and respect prayer times.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3">How can I enroll my child in Madressa?</h3>
              <p className="text-architectural-shadow/70">
                Contact the mosque office for enrollment details. Madressa classes run Monday to Thursday for boys and girls, with Hifz programs available Monday to Saturday.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3">Do you offer marriage services?</h3>
              <p className="text-architectural-shadow/70">
                Yes, Imam Uzair Akbar is a registered marriage celebrant who has solemnized hundreds of Islamic marriages. Please contact the mosque to schedule a consultation.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3">Is parking available?</h3>
              <p className="text-architectural-shadow/70">
                Yes, free parking is available on-site. Additional street parking is available on Nursery Road.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-3">How can I support the mosque?</h3>
              <p className="text-architectural-shadow/70">
                You can support the mosque through donations, volunteering, or participating in community activities. Visit our donation page or contact us to learn more about volunteer opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-islamic-green to-islamic-green/80 text-white rounded-xl p-12 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Support Our Community</h2>
            <p className="text-xl mb-8 text-warm-ivory/90">
              Your donations help us serve the growing needs of the Muslim community and maintain this historic site.
            </p>
            <button
              onClick={() => navigate("/featured/holland-park-mosque/donate")}
              className="px-8 py-4 bg-white text-islamic-green rounded-lg hover:bg-warm-ivory transition-colors font-bold text-lg inline-flex items-center gap-3"
            >
              <Heart className="w-6 h-6" />
              Make a Donation
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HollandParkMosque;
