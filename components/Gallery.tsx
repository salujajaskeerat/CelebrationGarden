
import React, { useState, useMemo } from 'react';

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
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200", 
      span: "md:col-span-8 md:row-span-2", 
      aspect: "aspect-[4/3] md:aspect-auto h-full",
      title: "The Al Fresco Banquet",
      category: "Reception"
    },
    { 
      url: "https://images.unsplash.com/photo-1544592732-83bb76319972?auto=format&fit=crop&q=80&w=800", 
      span: "md:col-span-4 md:row-span-1", 
      aspect: "aspect-square",
      title: "Floral Artistry",
      category: "Details"
    },
    { 
      url: "https://images.unsplash.com/photo-1550005809-91ad75fb315f?auto=format&fit=crop&q=80&w=800", 
      span: "md:col-span-4 md:row-span-1", 
      aspect: "aspect-square",
      title: "Golden Hour Glow",
      category: "Ceremony"
    },
    { 
      url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800", 
      span: "md:col-span-4 md:row-span-2", 
      aspect: "aspect-[3/4] md:aspect-auto h-full",
      title: "The Heritage Arch",
      category: "Ceremony"
    },
    { 
      url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=1200", 
      span: "md:col-span-8 md:row-span-2", 
      aspect: "aspect-video md:aspect-auto h-full",
      title: "Estate Overlook",
      category: "Venue"
    },
    { 
      url: "https://images.unsplash.com/photo-1522673607200-1648832cee98?auto=format&fit=crop&q=80&w=800", 
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
        {/* Magazine Header */}
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

        {/* Filter Navigation */}
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

        {/* Asymmetrical Magazine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-4 gap-6 md:h-[1200px] transition-all duration-700">
          {filteredImages.map((img, idx) => (
            <div 
              key={`${img.title}-${idx}`} 
              className={`${img.span} relative overflow-hidden group cursor-pointer shadow-sm rounded-sm animate-fade-in`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`w-full h-full ${img.aspect}`}>
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                />
              </div>
              
              {/* Elegant Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8">
                <p className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  {img.category}
                </p>
                <h3 className="text-white font-serif text-2xl italic transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                  {img.title}
                </h3>
              </div>
              
              {/* Subtle Border Glow */}
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-700 pointer-events-none m-4"></div>
            </div>
          ))}
        </div>
        
        {/* Magazine Footer Action */}
        <div className="mt-24 flex flex-col items-center">
          <div className="w-px h-16 bg-gradient-to-b from-gray-200 to-transparent mb-8"></div>
          <button className="group relative">
            <span className="text-[#064e3b] font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs">
              Explore Full Collection
            </span>
            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#C5A059] transition-all duration-500 group-hover:w-full"></span>
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-2">
              <span className="text-[10px] italic text-gray-400">View 48+ more stories</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
