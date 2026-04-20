import React from 'react';
import Slider from 'react-slick';
import { motion } from 'motion/react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dabkeImg from 'figma:asset/9d765133f87fc9411ec38c405e7ae15add47ae87.png';
import tatreezImg from 'figma:asset/a98536ccc24e1c89158b458b58936d97fa469e6e.png';

// Images from Unsplash
const slides = [
  {
    image: "https://images.unsplash.com/photo-1661786672064-e62e8f18d2c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
    title: "The Ancient Olive Trees",
    fact: "Olive trees in Palestine are symbols of resilience and rootedness, with some trees dating back over 4,000 years. They represent the connection between the people and their land."
  },
  {
    image: tatreezImg,
    title: "The Art of Tatreez",
    fact: "Tatreez (Palestinian embroidery) is a centuries-old folk art where every pattern tells a story of a specific village, status, and identity, passed down through generations."
  },
  {
    image: "https://images.unsplash.com/photo-1653798351714-53a89a88b486?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920",
    title: "Historic Jerusalem",
    fact: "The Old City of Jerusalem features architecture that spans millennia. Its stone streets and markets have been a center of commerce, culture, and spirituality for centuries."
  },
  {
    image: dabkeImg,
    title: "Dabke & Celebration",
    fact: "Dabke is a traditional folk dance performed at weddings and joyous occasions. The stomping of feet symbolizes a deep connection to the earth and community solidarity."
  }
];

export const CultureSlideshow = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    cssEase: "linear",
    pauseOnHover: false,
    arrows: false,
    customPaging: () => (
      <div className="w-3 h-3 bg-white/50 rounded-full hover:bg-white transition-colors mt-8" />
    )
  };

  return (
    <div className="relative h-[85vh] min-h-[600px] overflow-hidden bg-stone-900">
      <Slider {...settings} className="h-full culture-slider">
        {slides.map((slide, index) => (
          <div key={index} className="relative h-[85vh] min-h-[600px] outline-none">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-stone-900/90" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white pb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl"
              >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-serif leading-tight">
                  {slide.title}
                </h1>
                <div className="h-1 w-24 bg-pal-red mx-auto mb-8" />
                <p className="text-lg md:text-2xl text-stone-200 leading-relaxed font-light bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                  {slide.fact}
                </p>
              </motion.div>
            </div>
          </div>
        ))}
      </Slider>

      <style>{`
        .culture-slider .slick-dots {
          bottom: 40px;
        }
        .culture-slider .slick-dots li {
          margin: 0 4px;
        }
      `}</style>
    </div>
  );
};
