import React, { useEffect, useRef } from "react";
import { MapPin, Phone, Globe, Clock, Users, BookOpen, Heart, Calendar, Star, CalendarDays, Handshake, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HollandParkMosque = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Maps with custom marker
    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const hollandParkLocation = { lat: -27.518687, lng: 153.063982 };

      const map = new google.maps.Map(mapRef.current, {
        center: hollandParkLocation,
        zoom: 18,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
      });

      // Custom marker with your logo
      new google.maps.Marker({
        position: hollandParkLocation,
        map: map,
        title: "Holland Park Mosque",
        icon: {
          url: "/masjid-nawabi-logo.png",
          scaledSize: new google.maps.Size(50, 50),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(25, 50),
        },
      });
    };

    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  return (
    <div className="min-h-screen bg-warm-ivory">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gradient-to-br from-islamic-green to-architectural-shadow">
        <div className="absolute inset-0 bg-black/40"></div>
        <img
          src="https://www.isacollective.com.au/images/Projects/ishp/Place%20of%20Worship,%20Mosque%20Design%20&%20Plans%20Brisbane,%20Gold%20Coast%20&%20Sunshine%20Coast.avif"
          alt="Holland Park Mosque - Night View"
          className="w-full h-full object-cover opacity-60"
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
            href="tel:0733434748"
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
                <h3 className="font-semibold text-lg mb-4 text-islamic-green">General Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Saturday:</span>
                    <span className="text-architectural-shadow/70">1:00 PM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday:</span>
                    <span className="text-architectural-shadow/70">1:00 PM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-islamic-green">Friday:</span>
                    <span className="text-islamic-green font-medium">11:30 AM - 8:00 PM</span>
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

        {/* Prayer Times */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Prayer Times
          </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 flex justify-center">
            <div className="w-full overflow-hidden rounded-lg" style={{ height: '600px', maxWidth: '1400px' }}>
              <iframe
                src="https://time.my-masjid.com/timingscreen/071cf335-19b7-4840-9e74-6bed3087a7e8"
                width="100%"
                height="600"
                style={{ border: 0 }}
                loading="lazy"
                title="Prayer Times & Clock"
              ></iframe>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Location
          </h2>

          {/* Google Maps with Custom Marker */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div
              ref={mapRef}
              className="w-full h-96"
              style={{ minHeight: '384px' }}
            ></div>
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
                (07) 3343 4748
              </p>
              <p className="text-architectural-shadow/60 text-sm mb-4">
                Media Enquiries: 0430 029 718
              </p>
              <a
                href="tel:0733434748"
                className="text-islamic-green hover:text-islamic-green/80 font-semibold text-sm"
              >
                Call Now →
              </a>
            </div>
          </div>

          {/* Email Contact */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-islamic-green" />
              Email
            </h3>
            <p className="text-architectural-shadow/80 mb-4">
              hpmosque@gmail.com
            </p>
            <a
              href="mailto:hpmosque@gmail.com"
              className="text-islamic-green hover:text-islamic-green/80 font-semibold text-sm"
            >
              Send Email →
            </a>
          </div>

          {/* Getting There */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="font-semibold text-2xl mb-6">Getting There</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-islamic-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  By Car
                </h4>
                <p className="text-architectural-shadow/70 ml-7">
                  <span className="font-semibold text-islamic-green">14 minutes</span> from Brisbane CBD (10.5 km via M3). Free parking is available on-site. Enter via Nursery Road. The mosque is easily accessible from the M1 and Gateway Motorway.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-islamic-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  By Public Transport
                </h4>
                <p className="text-architectural-shadow/70 ml-7">
                  <span className="font-semibold text-islamic-green">36-40 minutes</span> from Brisbane CBD. Multiple bus routes serve Holland Park, including routes 113, 120, and 175. Please check <a href="https://translink.com.au" target="_blank" rel="noopener noreferrer" className="text-islamic-green hover:underline">TransLink</a> for current schedules and route planning.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-islamic-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Parking
                </h4>
                <p className="text-architectural-shadow/70 ml-7">
                  Free on-site parking available at the mosque. Enter via Nursery Road. Additional street parking is available on surrounding streets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Google Reviews */}
        <section className="mb-16">
          <h2 className="font-display text-3xl font-bold text-architectural-shadow mb-6">
            Reviews
          </h2>

          {/* Reviews Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-golden-amber text-white px-6 py-4 rounded-lg text-center">
                  <div className="text-4xl font-bold">4.9</div>
                  <div className="text-sm">out of 5</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-5 h-5 fill-golden-amber text-golden-amber" />
                    <Star className="w-5 h-5 fill-golden-amber text-golden-amber" />
                    <Star className="w-5 h-5 fill-golden-amber text-golden-amber" />
                    <Star className="w-5 h-5 fill-golden-amber text-golden-amber" />
                    <Star className="w-5 h-5 fill-golden-amber text-golden-amber" />
                  </div>
                  <div className="text-lg font-semibold text-architectural-shadow">Exceptional</div>
                  <div className="text-sm text-architectural-shadow/60">560 reviews from Google</div>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/place/Holland+Park+Mosque/@-27.5186728,153.0639817,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green/90 transition-colors font-semibold text-center"
              >
                View All Reviews on Google
              </a>
            </div>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {/* Review 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg text-architectural-shadow">Faisal</div>
                  <div className="text-sm text-architectural-shadow/60">Reviewed 3 months ago</div>
                </div>
                <div className="bg-golden-amber text-white px-4 py-2 rounded-lg font-bold text-lg">
                  5
                </div>
              </div>
              <p className="text-architectural-shadow/80 leading-relaxed mb-3">
                Absolutely beautiful and peaceful mosque! Holland Park Mosque is one of the cleanest and most well-maintained mosques I've ever visited. The architecture is stunning, and the prayer space is always organized. The community here is welcoming, and it's clear that a lot of care goes into maintaining this historic place.
              </p>
              <div className="flex items-center gap-2 text-islamic-green text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recommends this mosque
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg text-architectural-shadow">Syed Zubair Hasan</div>
                  <div className="text-sm text-architectural-shadow/60">Reviewed 9 months ago</div>
                </div>
                <div className="bg-golden-amber text-white px-4 py-2 rounded-lg font-bold text-lg">
                  5
                </div>
              </div>
              <p className="text-architectural-shadow/80 leading-relaxed mb-3">
                We recently visited the Holland Park Mosque and were very impressed. The mosque is well-maintained and clean, with separate prayer areas for men and women. We also appreciated the availability of shower facilities and the lift for easy access to different floors. The Imam was very welcoming and knowledgeable. Overall, a great place for prayer and reflection.
              </p>
              <div className="flex items-center gap-2 text-islamic-green text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recommends this mosque
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg text-architectural-shadow">Afiquenz</div>
                  <div className="text-sm text-architectural-shadow/60">Reviewed 2 months ago</div>
                </div>
                <div className="bg-golden-amber text-white px-4 py-2 rounded-lg font-bold text-lg">
                  5
                </div>
              </div>
              <p className="text-architectural-shadow/80 leading-relaxed mb-3">
                I had the opportunity to attend a Friday sermon by Sheikh Uzair on 11 July 2025. Masjid was fully packed as it was school holidays. It's a very big mosque with excellent facilities. The Friday khutbah was inspiring and the community atmosphere was wonderful. Highly recommend visiting during Jummah prayer to experience the vibrant community.
              </p>
              <div className="flex items-center gap-2 text-islamic-green text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recommends this mosque
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-lg text-architectural-shadow">Community Member</div>
                  <div className="text-sm text-architectural-shadow/60">Reviewed 5 months ago</div>
                </div>
                <div className="bg-golden-amber text-white px-4 py-2 rounded-lg font-bold text-lg">
                  5
                </div>
              </div>
              <p className="text-architectural-shadow/80 leading-relaxed mb-3">
                Ladies facilities as well, well maintained ablution facilities. The peaceful atmosphere makes it perfect for reflection and prayer. The mosque has a rich history being over 100 years old, and you can feel the spiritual significance when you visit. The volunteers and staff are always helpful and friendly.
              </p>
              <div className="flex items-center gap-2 text-islamic-green text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recommends this mosque
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
                <div className="w-full aspect-square rounded-lg overflow-hidden">
                  <img
                    src="/imam-uzair.png"
                    alt="Imam Uzair Akbar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="font-display text-2xl font-bold mb-3">Imam Uzair Akbar</h3>
                <p className="text-architectural-shadow/70 mb-4 leading-relaxed">
                  Religious Scholar | Imam | President Council of Imams (CIQ) QLD Australia | Marriage Celebrant | Motivational Speaker | Director of Centre of Excellence (CoE) | Head of Shariah Board Amanah Islamic Finance Australia (AIFA) | Australian National Council of Imams (ANIC) | Sports Fan
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

      </div>
    </div>
  );
};

export default HollandParkMosque;
