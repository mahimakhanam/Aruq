import React from 'react';
import { Layout } from './Layout';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Music, Video, Image as ImageIcon, Users, Archive, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CultureSlideshow } from './components/CultureSlideshow';
import oralHistoryImg from 'figma:asset/5d6d68926c69612f52b6bb23b7fc26fa63833269.png';
import weddingSongsImg from 'figma:asset/cc40ef25e5c5aff4639a1ba7546a11dbcf7cd2c9.png';
import mahmoudDarwishImg from 'figma:asset/ac529957832020fd197c89f68382ef8397903a87.png';
import photographyImg from 'figma:asset/9c557e575dad1e1be4c1ddd7afbbc1a686e14857.png';

// Image Imports
const heroImage = "https://images.unsplash.com/photo-1620575999834-37312e671d24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920";
const literatureImg = "https://images.unsplash.com/photo-1711350987526-06d69fdfbf64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"; // Old Arabic Manuscript
const folkImg = "https://images.unsplash.com/photo-1597424867674-04ec2f290ebe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"; // Traditional Dabke/Costume
const historyImg = photographyImg; // Photography Category
const weddingImg = weddingSongsImg; // Oud/Music
const jaffaImg = "https://images.unsplash.com/photo-1565484195597-815bb1776b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"; // Jaffa Port/Sea

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <CultureSlideshow />

      {/* Tatreez Divider */}
      <div className="h-4 w-full bg-tatreez-red" />

      {/* Categories Section */}
      <section className="py-20 bg-stone-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pal-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pal-red/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">Explore Our Heritage</h2>
            <div className="w-24 h-1 bg-pal-green mx-auto mb-6" />
            <p className="text-stone-600 max-w-2xl mx-auto text-lg">
              Dive into a vast collection of cultural treasures, from ancient manuscripts to modern folk performances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <CategoryCard 
              icon={<BookOpen className="w-8 h-8" />}
              title="Literature"
              arabic="الأدب"
              desc="Poetry, novels, and historical texts."
              img={literatureImg}
              color="border-pal-black"
            />
            <CategoryCard 
              icon={<ImageIcon className="w-8 h-8" />}
              title="Photography"
              arabic="الصور"
              desc="Visual memories from across the decades."
              img={historyImg}
              color="border-pal-red"
            />
            <CategoryCard 
              icon={<Video className="w-8 h-8" />}
              title="Folk Arts"
              arabic="الفنون الشعبية"
              desc="Dabke, traditional crafts, and theater."
              img={folkImg}
              color="border-pal-green"
            />
            <CategoryCard 
              icon={<Mic className="w-8 h-8" />}
              title="Oral History"
              arabic="التاريخ الشفوي"
              desc="Recorded stories and testimonies."
              img={oralHistoryImg}
              color="border-stone-600"
            />
          </div>
        </div>
      </section>

      {/* Featured Content / Latest Additions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-2">Latest Additions</h2>
              <p className="text-stone-500">Recently archived materials from our contributors.</p>
            </div>
            <Link to="/archive" className="text-pal-red font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeaturedItem 
              type="Document"
              title="Diwan of Mahmoud Darwish"
              date="Added 2 days ago"
              contributor="University of Birzeit"
              image={mahmoudDarwishImg}
            />
            <FeaturedItem 
              type="Audio"
              title="Traditional Wedding Songs"
              date="Added 1 week ago"
              contributor="Nablus Heritage Center"
              image={weddingImg}
            />
            <FeaturedItem 
              type="Photograph"
              title="Jaffa Port, 1920"
              date="Added 2 weeks ago"
              contributor="Khalidi Library"
              image={jaffaImg}
            />
          </div>
        </div>
      </section>

      {/* Community / Contributors CTA */}
      <section className="py-24 bg-stone-900 text-white relative overflow-hidden">
        {/* Keffiyeh Pattern Overlay */}
        <div className="absolute inset-0 bg-keffiyeh opacity-5 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Users className="w-16 h-16 text-pal-green mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Preserve Our Story</h2>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto mb-10">
            Join a community of scholars, institutions, and individuals dedicated to safeguarding Palestinian heritage for future generations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth?tab=register" 
              className="bg-pal-green hover:bg-green-700 text-white px-8 py-4 rounded-md font-semibold text-lg transition-colors"
            >
              Become a Contributor
            </Link>
            <Link 
              to="/donate" 
              className="bg-transparent border border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-md font-semibold text-lg transition-colors"
            >
              Support the Cause
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const CategoryCard = ({ icon, title, arabic, desc, img, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border-t-4 ${color}`}
  >
    <div className="h-48 overflow-hidden relative">
      <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        <span className="text-white font-medium border border-white/50 px-4 py-2 rounded-full backdrop-blur-sm">View Collection</span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-stone-100 text-stone-700 group-hover:bg-stone-200 transition-colors`}>
          {icon}
        </div>
        <span className="font-arabic text-xl text-pal-red">{arabic}</span>
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

const FeaturedItem = ({ type, title, date, contributor, image }: any) => (
  <div className="bg-white border border-stone-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
    <div className="h-56 overflow-hidden relative">
      <img src={image} alt={title} className="w-full h-full object-cover" />
      <div className="absolute top-4 left-4">
        <span className="bg-white/90 text-stone-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {type}
        </span>
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold text-stone-800 mb-1">{title}</h3>
      <div className="flex items-center justify-between mt-4 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {contributor}
        </span>
        <span>{date}</span>
      </div>
    </div>
  </div>
);

export default HomePage;
