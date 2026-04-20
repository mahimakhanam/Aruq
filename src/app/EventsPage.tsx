import React from 'react';
import { Layout } from './Layout';
import { Calendar, MapPin, Music, BookOpen, Clock, ArrowRight, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import simonShaheenImg from 'figma:asset/14a40ce1c9ffb7a78518fb863d948c13d133553e.png';
import gazaPoetryImg from 'figma:asset/0cac46ee5d982eda9a711b0e8fae37f584abcd32.png';

// Images
const event1 = simonShaheenImg;
const event2 = gazaPoetryImg;
const event3 = "https://images.unsplash.com/photo-1753738794538-9aa4cd8a7d55?auto=format&fit=crop&q=80&w=800";

const EventsPage = () => {
  return (
    <Layout>
      <div className="bg-stone-50 min-h-screen pb-20">
        
        {/* Header Banner */}
        <div className="bg-pal-black text-white py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pal-red/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cultural Events & News</h1>
            <p className="text-stone-300 text-lg max-w-2xl">
              Stay updated with the latest literary discoveries, musical performances, and cultural gatherings celebrating Palestinian heritage.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          
          {/* Featured News / Discovery */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Bell className="text-pal-red" /> Latest Discovery
            </h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-stone-100 flex flex-col md:flex-row">
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <img src={event3} alt="Manuscript Discovery" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-pal-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  New Finding
                </div>
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-stone-500 text-sm mb-3">
                  <Calendar className="w-4 h-4" /> Feb 12, 2026
                  <span className="w-1 h-1 bg-stone-300 rounded-full" />
                  <span className="text-pal-red font-medium">Literature</span>
                </div>
                <h3 className="text-3xl font-bold text-stone-800 mb-4">Unpublished Letters of Ghassan Kanafani Found</h3>
                <p className="text-stone-600 mb-6 leading-relaxed">
                  A collection of handwritten letters by the renowned author has been discovered in a private collection in Beirut. 
                  These documents shed new light on his literary process and personal life during the 1960s.
                </p>
                <button className="self-start flex items-center gap-2 text-pal-black font-bold hover:text-pal-red transition-colors group">
                  Read Full Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Events Grid */}
          <h2 className="text-2xl font-bold text-stone-800 mb-8">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Event Card 1 */}
            <EventCard 
              image={event1}
              category="Music"
              title="Oud Night: Tribute to Simon Shaheen"
              date="March 15, 2026"
              location="Ramallah Cultural Palace"
              desc="An evening of classical Arabic music featuring prominent Palestinian oud players."
            />

            {/* Event Card 2 */}
            <EventCard 
              image={event2}
              category="Literature"
              title="Poetry Reading: Voices of Gaza"
              date="March 22, 2026"
              location="Online / Zoom"
              desc="Contemporary poets from Gaza share their latest works in a live virtual recital."
            />

            {/* Event Card 3 */}
            <EventCard 
              image="https://images.unsplash.com/photo-1653798351714-53a89a88b486?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
              category="Exhibition"
              title="Jerusalem in Literature"
              date="April 05, 2026"
              location="Dar al-Kalima, Bethlehem"
              desc="A visual and literary exhibition exploring how Jerusalem has been depicted in Palestinian novels."
            />
          </div>

        </div>
      </div>
    </Layout>
  );
};

const EventCard = ({ image, category, title, date, location, desc }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-stone-100 flex flex-col h-full"
  >
    <div className="h-48 overflow-hidden relative">
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-stone-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        {category}
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-3">{title}</h3>
      <p className="text-stone-600 text-sm mb-6 flex-1">{desc}</p>
      <button className="w-full py-2 border border-stone-200 rounded-lg text-sm font-semibold text-stone-600 hover:bg-pal-black hover:text-white hover:border-pal-black transition-colors">
        View Details
      </button>
    </div>
  </motion.div>
);

export default EventsPage;
