'use client'

import React, { useState } from 'react';

interface AreaInfo {
  id: string;
  title: string;
  description: string;
  image: string;
}

const venueAreas: Record<string, AreaInfo> = {
  pavilion: {
    id: 'pavilion',
    title: 'Grand Pavilion',
    description: 'Glass-walled masterpiece with 360° botanical views.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=400'
  },
  rose: {
    id: 'rose',
    title: 'Secret Rose Garden',
    description: 'Intimate ceremony space with historic stone arches.',
    image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=400'
  },
  dance: {
    id: 'dance',
    title: 'The Orchard Terrace',
    description: 'Open-air dance floor under fairy-lit oak trees.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=400'
  }
};

const InteractiveMap: React.FC = () => {
  const [activeArea, setActiveArea] = useState<AreaInfo | null>(null);

  const handleFocus = (area: AreaInfo) => setActiveArea(area);
  const handleBlur = () => setActiveArea(null);

  return (
    <div className="relative w-full aspect-[4/3] bg-white border border-gray-100 shadow-inner overflow-hidden rounded-lg group">
      {/* SVG Map Layout */}
      <svg 
        viewBox="0 0 400 300" 
        className="w-full h-full p-4"
        onMouseLeave={() => setActiveArea(null)}
        aria-label="Interactive venue map of Celebration Garden"
        role="img"
      >
        <title>Celebration Garden Venue Map</title>
        <desc>An interactive map showing the Grand Pavilion, Secret Rose Garden, and Orchard Terrace.</desc>
        
        {/* Grounds / Grass */}
        <path d="M20,20 Q200,5 380,20 T380,280 Q200,295 20,280 T20,20" fill="#f0f2ef" />
        
        {/* Paths */}
        <path d="M100,50 C150,150 250,150 300,250" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
        <path d="M50,220 C150,220 250,180 350,100" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />

        {/* Grand Pavilion Area */}
        <g 
          className="cursor-pointer transition-all duration-300 focus:outline-none"
          onMouseEnter={() => handleFocus(venueAreas.pavilion)}
          onFocus={() => handleFocus(venueAreas.pavilion)}
          onBlur={handleBlur}
          tabIndex={0}
          role="button"
          aria-label="Grand Pavilion: Glass-walled sanctuary with 360-degree views"
        >
          <rect 
            x="240" y="40" width="100" height="70" rx="4"
            fill={activeArea?.id === 'pavilion' ? '#C5A059' : '#064e3b'} 
            className="transition-colors duration-300"
          />
          <text x="290" y="80" textAnchor="middle" className="fill-white text-[8px] font-bold uppercase tracking-widest pointer-events-none">Pavilion</text>
        </g>

        {/* Secret Rose Garden Area */}
        <g 
          className="cursor-pointer transition-all duration-300 focus:outline-none"
          onMouseEnter={() => handleFocus(venueAreas.rose)}
          onFocus={() => handleFocus(venueAreas.rose)}
          onBlur={handleBlur}
          tabIndex={0}
          role="button"
          aria-label="Secret Rose Garden: Intimate ceremony space with historic stone arches"
        >
          <path 
            d="M60,40 Q150,30 140,110 Q120,160 50,120 Z" 
            fill={activeArea?.id === 'rose' ? '#C5A059' : '#10b981'} 
            fillOpacity={activeArea?.id === 'rose' ? '1' : '0.2'}
            stroke="#10b981"
            strokeWidth="1"
            className="transition-all duration-300"
          />
          <circle cx="100" cy="85" r="3" fill="#064e3b" />
          <text x="100" y="105" textAnchor="middle" className="fill-[#064e3b] text-[8px] font-bold uppercase tracking-widest pointer-events-none">Rose Garden</text>
        </g>

        {/* Dance Floor / Orchard Terrace */}
        <g 
          className="cursor-pointer transition-all duration-300 focus:outline-none"
          onMouseEnter={() => handleFocus(venueAreas.dance)}
          onFocus={() => handleFocus(venueAreas.dance)}
          onBlur={handleBlur}
          tabIndex={0}
          role="button"
          aria-label="The Orchard Terrace: Open-air dance floor under oak trees"
        >
          <circle 
            cx="200" cy="200" r="45" 
            fill={activeArea?.id === 'dance' ? '#C5A059' : '#F9F8F3'} 
            stroke="#C5A059"
            strokeWidth="2"
            strokeDasharray="4 2"
            className="transition-colors duration-300"
          />
          <text x="200" y="205" textAnchor="middle" className="fill-[#064e3b] text-[8px] font-bold uppercase tracking-widest pointer-events-none">The Terrace</text>
        </g>

        {/* Legend */}
        <text x="20" y="285" className="fill-gray-400 text-[6px] uppercase tracking-widest">Interactive Venue Layout</text>
      </svg>

      {/* Info Pop-up */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 transition-transform duration-500 transform ${activeArea ? 'translate-y-0' : 'translate-y-full'}`}
        aria-live="polite"
      >
        {activeArea && (
          <div className="flex gap-4 items-center">
            <img src={activeArea.image} className="w-16 h-16 object-cover rounded shadow-sm" alt="" aria-hidden="true" />
            <div>
              <h5 className="font-serif text-[#064e3b] text-sm">{activeArea.title}</h5>
              <p className="text-[10px] text-gray-500 leading-tight mt-1">{activeArea.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Initial Hint */}
      {!activeArea && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-0 transition-opacity">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#064e3b]">Explore the Estate</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
