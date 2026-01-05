
import React, { useState, useEffect } from 'react';

interface InvitationData {
  slug: string;
  coupleNames: string;
  date: string;
  time: string;
  location: string;
  mapUrl: string;
  description: string;
  images: string[];
}

const GOOGLE_SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Shared with your team
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv`;

const ClientInvitation: React.FC<{ slug: string }> = ({ slug }) => {
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitation = async () => {
      // For demonstration, we'll use a mock if the sheet ID isn't set
      if (GOOGLE_SHEET_ID === 'YOUR_SHEET_ID_HERE') {
        setTimeout(() => {
          setData({
            slug: 'sarah-michael-2025',
            coupleNames: 'Sarah & Michael',
            date: 'Saturday, June 14, 2025',
            time: 'Ceremony at 4:00 PM',
            location: 'The Grand Pavilion, Celebration Garden',
            mapUrl: 'https://maps.google.com',
            description: 'We are overjoyed to invite you to celebrate our union in the heart of Emerald Valley. Your presence is the greatest gift we could hope for as we begin our new life together.',
            images: [
              'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1600',
              'https://images.unsplash.com/photo-1544592732-83bb76319972?auto=format&fit=crop&q=80&w=1600'
            ]
          });
          setLoading(false);
        }, 1000);
        return;
      }

      try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const rows = text.split('\n').slice(1);
        const match = rows.find(row => row.split(',')[0].replace(/"/g, '') === slug);

        if (match) {
          const cols = match.split(',').map(c => c.replace(/^"|"$/g, ''));
          setData({
            slug: cols[0],
            coupleNames: cols[1],
            date: cols[2],
            time: cols[3],
            location: cols[4],
            mapUrl: cols[5],
            description: cols[6],
            images: cols[7] ? cols[7].split(';') : []
          });
        }
      } catch (e) {
        console.error("Failed to fetch invitation data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen bg-[#F9F8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="font-serif italic text-[#064e3b] text-xl">Preparing your invitation...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen bg-[#F9F8F3] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-4xl text-[#064e3b] mb-4">Invitation Not Found</h1>
        <p className="text-gray-500 mb-8">This celebration link may have expired or is incorrect.</p>
        <a href="/" className="bg-[#064e3b] text-white px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Return to Home</a>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F8F3] min-h-screen">
      {/* Immersive Header */}
      <header className="relative h-[80vh] flex items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105 animate-slow-zoom">
          <img src={data.images[0]} alt="The Happy Couple" className="w-full h-full object-cover grayscale-[30%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#F9F8F3]"></div>
        </div>
        
        <div className="relative z-10 animate-fade-in-up">
          <p className="text-[#C5A059] font-bold tracking-[0.5em] uppercase text-[10px] mb-6">You are invited to the celebration of</p>
          <h1 className="text-white font-serif text-6xl md:text-9xl mb-8 drop-shadow-2xl tracking-tighter">{data.coupleNames}</h1>
          <div className="w-24 h-px bg-white/40 mx-auto mb-8"></div>
          <p className="text-white font-serif italic text-2xl md:text-3xl mb-12">{data.date}</p>
          <a 
            href={data.mapUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#C5A059] text-white px-10 py-5 font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-[#064e3b] transition-all shadow-2xl"
          >
            How to Reach the Estate
          </a>
        </div>
      </header>

      {/* Narrative Section */}
      <section className="py-24 md:py-32 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-20">
          <h2 className="text-[#064e3b] font-serif text-4xl md:text-5xl italic mb-10 leading-tight">The Celebration Details</h2>
          <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed italic border-l-2 border-r-2 border-[#C5A059]/20 px-8 md:px-16">
            "{data.description}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left bg-white p-12 md:p-20 shadow-xl rounded-sm">
          <div className="space-y-4">
            <h4 className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest">When</h4>
            <p className="text-[#064e3b] font-serif text-2xl">{data.date}</p>
            <p className="text-gray-500 font-light">{data.time}</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest">Where</h4>
            <p className="text-[#064e3b] font-serif text-2xl">{data.location}</p>
            <p className="text-gray-500 font-light">Emerald Valley, EV 90210</p>
          </div>
        </div>
      </section>

      {/* Gallery Highlight */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.images.slice(0, 2).map((img, i) => (
            <div key={i} className={`overflow-hidden rounded-sm shadow-lg ${i % 2 === 0 ? 'md:-translate-y-12' : 'md:translate-y-12'}`}>
              <img src={img} alt={`Moment ${i+1}`} className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
            </div>
          ))}
        </div>
      </section>

      {/* Lead Gen Footer for Guests */}
      <section className="bg-[#064e3b] py-24 text-center px-6 relative overflow-hidden">
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
         <div className="relative z-10">
           <h3 className="text-white font-serif text-4xl mb-8 italic">Captivated by this sanctuary?</h3>
           <p className="text-white/60 text-sm font-bold uppercase tracking-[0.4em] mb-12">Experience the legacy of Celebration Garden</p>
           <a 
              href="/" 
              className="inline-block bg-white text-[#064e3b] px-12 py-5 font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-[#C5A059] hover:text-white transition-all shadow-2xl"
            >
              Discover The Estate
            </a>
         </div>
      </section>

      <footer className="py-12 bg-white text-center border-t border-gray-100">
        <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em]">&copy; 2024 Celebration Garden Estates | Concierge: +1 800 555 0199</p>
      </footer>
    </div>
  );
};

export default ClientInvitation;
