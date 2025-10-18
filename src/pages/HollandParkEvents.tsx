import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, Tag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  attendees?: number;
  isUpcoming: boolean;
  image?: string;
}

const HollandParkEvents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Mock events data - In production, this would come from an API or database
  const events: Event[] = [
    {
      id: 1,
      title: "Grand Re-Opening Celebration",
      date: "November 15, 2025",
      time: "2:00 PM - 6:00 PM",
      location: "Holland Park Mosque Main Hall",
      category: "Community",
      description: "Join us for the grand re-opening celebration of the Mother Mosque. A historic moment as we welcome the community back to this beautifully renovated 114-year-old spiritual home.",
      attendees: 500,
      isUpcoming: true,
      image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Weekly Jummah Prayer",
      date: "Every Friday",
      time: "12:30 PM - 2:00 PM",
      location: "Holland Park Mosque",
      category: "Prayer",
      description: "Join over 500 community members for our weekly Jummah (Friday) prayer. Khutbah delivered by Imam Uzair Akbar followed by congregational prayer.",
      attendees: 500,
      isUpcoming: true,
      image: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Islamic Studies Circle",
      date: "November 20, 2025",
      time: "7:00 PM - 8:30 PM",
      location: "Community Hall",
      category: "Education",
      description: "Monthly Islamic studies circle covering various topics from Quran, Hadith, and Islamic history. Led by Imam Uzair Akbar. All levels welcome.",
      attendees: 75,
      isUpcoming: true,
    },
    {
      id: 4,
      title: "Youth Program - Sports Day",
      date: "November 22, 2025",
      time: "10:00 AM - 3:00 PM",
      location: "Holland Park Mosque Grounds",
      category: "Youth",
      description: "Fun-filled sports day for youth aged 8-18. Activities include basketball, cricket, and team-building exercises. Lunch provided.",
      attendees: 60,
      isUpcoming: true,
    },
    {
      id: 5,
      title: "Madressa Open Day",
      date: "December 1, 2025",
      time: "4:00 PM - 6:00 PM",
      location: "Madressa Classrooms",
      category: "Education",
      description: "Open day for parents interested in enrolling their children in our Madressa programs. Meet the teachers, tour the facilities, and learn about our curriculum.",
      attendees: 40,
      isUpcoming: true,
    },
    {
      id: 6,
      title: "Community Iftar",
      date: "October 15, 2025",
      time: "6:00 PM - 8:00 PM",
      location: "Community Hall",
      category: "Ramadan",
      description: "Community gathering for breaking fast together during Ramadan. Brought together over 300 community members from diverse backgrounds.",
      attendees: 300,
      isUpcoming: false,
    },
    {
      id: 7,
      title: "Eid ul-Adha Prayer",
      date: "October 28, 2025",
      time: "8:00 AM - 10:00 AM",
      location: "Holland Park Mosque",
      category: "Eid",
      description: "Eid ul-Adha prayer followed by community celebration. Over 600 attendees joined us for this blessed occasion.",
      attendees: 600,
      isUpcoming: false,
    },
    {
      id: 8,
      title: "Interfaith Dialogue",
      date: "September 10, 2025",
      time: "6:30 PM - 8:30 PM",
      location: "Community Hall",
      category: "Community",
      description: "Interfaith dialogue bringing together people from different religious backgrounds to promote understanding and unity.",
      attendees: 85,
      isUpcoming: false,
    },
  ];

  const upcomingEvents = events.filter(event => event.isUpcoming);
  const pastEvents = events.filter(event => !event.isUpcoming);
  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Community': 'bg-islamic-green/10 text-islamic-green',
      'Prayer': 'bg-blue-50 text-blue-700',
      'Education': 'bg-golden-amber/10 text-golden-amber',
      'Youth': 'bg-purple-50 text-purple-700',
      'Ramadan': 'bg-green-50 text-green-700',
      'Eid': 'bg-red-50 text-red-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-warm-ivory">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-islamic-green to-islamic-green/80 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Upcoming Events
            </h1>
            <p className="text-xl md:text-2xl text-warm-ivory/90">
              Holland Park Mosque Community Events
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 md:flex-none px-8 py-4 rounded-lg font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-islamic-green text-white shadow-lg'
                : 'bg-white text-architectural-shadow hover:bg-gray-50'
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 md:flex-none px-8 py-4 rounded-lg font-semibold transition-all ${
              activeTab === 'past'
                ? 'bg-islamic-green text-white shadow-lg'
                : 'bg-white text-architectural-shadow hover:bg-gray-50'
            }`}
          >
            Past Events ({pastEvents.length})
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {displayEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="md:flex">
                {/* Event Image */}
                {event.image && (
                  <div className="md:w-1/3">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                )}

                {/* Event Details */}
                <div className={`p-6 ${event.image ? 'md:w-2/3' : 'w-full'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                        {event.isUpcoming && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-2xl font-bold text-architectural-shadow mb-3">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-architectural-shadow/80">
                      <Calendar className="w-5 h-5 text-islamic-green flex-shrink-0" />
                      <span className="font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-architectural-shadow/80">
                      <Clock className="w-5 h-5 text-islamic-green flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-architectural-shadow/80">
                      <MapPin className="w-5 h-5 text-islamic-green flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    {event.attendees && (
                      <div className="flex items-center gap-3 text-architectural-shadow/80">
                        <Users className="w-5 h-5 text-islamic-green flex-shrink-0" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    )}
                  </div>

                  <p className="text-architectural-shadow/70 leading-relaxed mb-6">
                    {event.description}
                  </p>

                  {event.isUpcoming && (
                    <div className="flex flex-wrap gap-3">
                      <button className="px-6 py-2 bg-islamic-green text-white rounded-lg hover:bg-islamic-green/90 transition-colors font-semibold flex items-center gap-2">
                        Register Interest
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button className="px-6 py-2 bg-warm-ivory border-2 border-islamic-green text-islamic-green rounded-lg hover:bg-islamic-green/5 transition-colors font-semibold">
                        Share Event
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {displayEvents.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-architectural-shadow/30 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-architectural-shadow mb-2">
              No {activeTab} events
            </h3>
            <p className="text-architectural-shadow/60">
              Check back later for updates
            </p>
          </div>
        )}

        {/* Community Note */}
        <div className="mt-12 bg-islamic-green/5 border border-islamic-green/20 rounded-xl p-8">
          <h3 className="font-display text-2xl font-bold text-architectural-shadow mb-4">
            Stay Connected
          </h3>
          <p className="text-architectural-shadow/80 mb-6 leading-relaxed">
            Join our mailing list to receive updates about upcoming events, programs, and community announcements. Follow us on social media for daily updates.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-islamic-green text-white rounded-lg hover:bg-islamic-green/90 transition-colors font-semibold">
              Subscribe to Newsletter
            </button>
            <a
              href="https://www.facebook.com/hpmosque"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-architectural-shadow text-white rounded-lg hover:bg-architectural-shadow/90 transition-colors font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Visit Facebook Page
            </a>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
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

export default HollandParkEvents;
