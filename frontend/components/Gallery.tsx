'use client'

import React, { useState, useMemo } from 'react';
import ScrollReveal from './ScrollReveal';

interface GalleryImage {
  url: string;
  span: string;
  aspect: string;
  title: string;
  category: string;
}

const Gallery: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Ceremony', 'Reception', 'Details', 'Venue'];

  const images: GalleryImage[] = useMemo(() => [
    { 
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000", 
      span: "md:col-span-8 md:row-span-2", 
      aspect: "aspect-[4/3] md:aspect-auto h-full",
      title: "The Al Fresco Banquet",
      category: "Reception"
    },
    { 
      url: "https://images.unsplash.com/photo-1544592732-83bb76319972?auto=format&fit=crop&q=80&w=600", 
      span: "md:col-span-4 md:row-span-1", 
      aspect: "aspect-square",
      title: "Floral Artistry",
      category: "Details"
    },
    { 
      url: "https://images.unsplash.com/photo-1550005809-91ad75fb315f?auto=format&fit=crop&q=80&w=600", 
      span: "md:col-span-4 md:row-span-1", 
      aspect: "aspect-square",
      title: "Golden Hour Glow",
      category: "Ceremony"
    },
    { 
      url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=600", 
      span: "md:col-span-4 md:row-span-2", 
      aspect: "aspect-[3/4] md:aspect-auto h-full",
      title: "The Heritage Arch",
      category: "Ceremony"
    },
    { 
      url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=1000", 
      span: "md:col-span-8 md:row-span-2", 
      aspect: "aspect-video md:aspect-auto h-full",
      title: "Estate Overlook",
      category: "Venue"
    },
    { 
      url: "https://images.unsplash.com/photo-1522673607200-1648832cee98?auto=format&fit=crop&q=80&w=600", 
      span: "md:col-span-4 md:row-span-1", 
      aspect: "aspect-square",
      title: "Nightfall Serenade",
      category: "Reception"
    },
  ], []);

  const filteredImages = activeFilter === 'All' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  return (
    <section id="gallery" className="py-24 md:py-36 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
          <div className="max-w-xl">
            <p className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[10px] mb-4">
              Visual Narrative
            </p>
            <h2 className="text-[#064e3b] font-serif text-5xl md:text-7xl leading-[1.1]">
              The <span className="italic">Lookbook</span>
            </h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs border-l border-gray-100 pl-8 pb-2">
            A curated selection of moments captured within our emerald sanctuary. Explore the tapestry of light and love.
          </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-wrap gap-4 mb-16 justify-center md:justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 border ${
                activeFilter === cat
                  ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-lg shadow-[#064e3b]/20'
                  : 'bg-white text-gray-400 border-gray-100 hover:border-[#C5A059] hover:text-[#C5A059]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-4 gap-6 md:h-[1200px]">
          {filteredImages.map((img, idx) => (
            <div 
              key={`${img.title}-${idx}`} 
              className={`${img.span} relative overflow-hidden group cursor-pointer shadow-sm rounded-sm`}
            >
              <div className={`w-full h-full ${img.aspect}`}>
                <img 
                  src={img.url} 
                  alt={img.title} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8">
                <p className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {img.category}
                </p>
                <h3 className="text-white font-serif text-2xl italic transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                  {img.title}
                </h3>
              </div>
            </div>
          ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Gallery;
