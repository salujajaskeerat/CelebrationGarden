
import React, { useState, useEffect } from 'react';

type EventType = 'Wedding' | 'Corporate' | 'Birthday' | 'Social';

interface InvitationData {
  slug: string;
  type: EventType;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  locationName: string;
  address: string;
  description: string;
  heroImage: string;
  detailImage: string;
  mapUrl: string;
}

const Countdown: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      }
    };
    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-4 md:gap-8 mt-12">
      {[
        { label: 'Days', value: timeLeft.d },
        { label: 'Hours', value: timeLeft.h },
        { label: 'Mins', value: timeLeft.m },
        { label: 'Secs', value: timeLeft.s },
      ].map((item, i) => (
        <div key={i} className="text-center group">
          <div className="bg-[#1a1a1a] text-white w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-sm mb-2 shadow-xl group-hover:bg-[#C5A059] transition-colors duration-500">
            <span className="font-serif text-xl md:text-3xl">{item.value.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-gray-400 text-[8px] uppercase tracking-[0.3em] font-bold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const ScrapbookForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1500);
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12 animate-fade-in-up">
        <div className="w-16 h-16 bg-[#064e3b] text-white rounded-full flex items-center justify-center mx-auto mb-6">✓</div>
        <h4 className="font-serif text-2xl italic text-[#064e3b]">Memory Captured</h4>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-2">Your contribution is now part of our legacy.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-white p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-sm border border-gray-50">
      <div className="text-center mb-8">
        <h4 className="font-serif text-3xl text-[#1a1a1a] italic">Digital Scrapbook</h4>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-2">Leave a wish & photo for the host</p>
      </div>
      
      <div className="space-y-4">
        <input 
          type="text" placeholder="Your Name" required
          className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#C5A059] text-sm transition-colors"
        />
        <textarea 
          placeholder="A message to share..." required rows={3}
          className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#C5A059] text-sm transition-colors resize-none"
        ></textarea>
        
        <div className="relative group">
          <input 
            type="file" accept="image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden" id="photo-upload"
          />
          <label 
            htmlFor="photo-upload"
            className="flex items-center justify-center gap-3 w-full py-5 border border-dashed border-gray-200 rounded-sm cursor-pointer hover:border-[#C5A059] transition-all group-hover:bg-gray-50"
          >
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              {file ? file.name : 'Upload a candid photo'}
            </span>
          </label>
        </div>
      </div>

      <button 
        type="submit" disabled={status === 'submitting'}
        className="w-full bg-[#1a1a1a] text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#C5A059] transition-all shadow-xl"
      >
        {status === 'submitting' ? 'Submitting...' : 'Post to Digital Scrapbook'}
      </button>
    </form>
  );
};

const ClientInvitation: React.FC<{ slug: string }> = ({ slug }) => {
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isBirthday = slug.toLowerCase().includes('birthday');
    const isCorporate = slug.toLowerCase().includes('corporate');
    
    // Simulate API fetch
    setTimeout(() => {
      setData({
        slug,
        type: isBirthday ? 'Birthday' : isCorporate ? 'Corporate' : 'Wedding',
        title: isBirthday ? "Olivia's Thirtieth" : isCorporate ? "Annual Tech Summit" : "Sarah & Michael",
        subtitle: isBirthday ? "A Night of Golden Glamour" : isCorporate ? "Networking in the Garden" : "An Invitation to Love",
        date: 'June 14, 2025',
        time: isBirthday ? '7:00 PM - Late' : '4:00 PM onwards',
        locationName: isBirthday ? 'The Orchard Terrace' : 'The Grand Pavilion',
        address: '122 Garden Lane, Emerald Valley, EV 90210',
        description: isBirthday 
          ? "Three decades of life, laughter, and light. Join us for an evening of vintage champagne and dancing under the stars."
          : "Under the starlight of Emerald Valley, we invite you to witness a milestone celebration. Your presence is the greatest gift.",
        heroImage: isBirthday 
          ? 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1600'
          : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1600',
        detailImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200',
        mapUrl: 'https://maps.google.com/maps?q=Celebration+Garden+Estates'
      });
      setLoading(false);
    }, 500);
  }, [slug]);

  if (loading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-2 border-gray-100 border-t-[#C5A059] rounded-full animate-spin mb-6"></div>
      <p className="font-serif italic text-gray-300 text-lg tracking-widest">Unveiling invitation...</p>
    </div>
  );

  if (!data) return null;

  return (
    <div className="bg-[#F9F8F3] min-h-screen text-[#1a1a1a] selection:bg-[#C5A059] selection:text-white pb-40">
      {/* Hero Atmosphere Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 scale-110 animate-slow-zoom">
          <img src={data.heroImage} alt="" className="w-full h-full object-cover grayscale-[10%]" />
          <div className="absolute inset-0 bg-black/50 bg-gradient-to-b from-transparent via-black/20 to-[#F9F8F3]"></div>
        </div>

        <div className="relative z-10 max-w-5xl animate-fade-in-up">
          <p className="text-[#C5A059] font-bold tracking-[0.6em] uppercase text-[10px] mb-8">{data.subtitle}</p>
          <h1 className="font-serif text-6xl md:text-[9rem] leading-[0.85] mb-12 tracking-tighter text-white drop-shadow-2xl">
            {data.title}
          </h1>
          <div className="flex items-center justify-center gap-6">
             <div className="h-px w-10 bg-white/40"></div>
             <p className="text-white text-xl md:text-2xl font-serif italic">{data.date}</p>
             <div className="h-px w-10 bg-white/40"></div>
          </div>
        </div>
      </section>

      {/* High-Contrast Content Section */}
      <section className="relative z-20 -mt-20 px-6">
        <div className="max-w-4xl mx-auto bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] p-10 md:p-24 text-center rounded-sm">
          <div className="w-12 h-12 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-12">
            <span className="text-[#C5A059] text-xl font-serif">M</span>
          </div>
          
          <h2 className="text-[#1a1a1a] font-serif text-3xl md:text-5xl italic mb-10 leading-tight">
            {data.type === 'Wedding' ? 'A Forever Chapter Begins' : 'A Milestone to Remember'}
          </h2>
          
          <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed mb-16 max-w-2xl mx-auto italic">
            "{data.description}"
          </p>

          <Countdown targetDate={data.date} />

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-16 text-left border-t border-gray-50 pt-16">
            <div className="space-y-4">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">The Schedule</span>
              <p className="font-serif text-4xl italic leading-tight">{data.time}</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{data.date}</p>
            </div>
            <div className="space-y-4">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">The Venue</span>
              <p className="font-serif text-4xl italic leading-tight">{data.locationName}</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Celebration Garden Estates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Get Directions Section - Black Aesthetic */}
      <section className="py-32 px-6 bg-[#1a1a1a] text-white mt-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-30"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div>
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-6">Navigation</span>
              <h3 className="font-serif text-5xl md:text-7xl italic leading-tight">Finding the <br />Estate Gates</h3>
              <p className="text-white/40 font-light text-lg mt-8 leading-relaxed">
                Nestled in the heart of Emerald Valley, Celebration Garden is easily accessible via the private Carriage Road. Valet services will be waiting at the main entrance for all guests.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-10 rounded-sm">
              <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Official Address</p>
              <p className="font-serif text-2xl italic mb-2">{data.address}</p>
              <p className="text-white/30 text-xs font-light">Emerald Valley District, EV 90210</p>
            </div>
          </div>
          
          <div className="relative group overflow-hidden shadow-2xl rounded-sm aspect-square md:aspect-video lg:aspect-square">
            {/* Map Placeholder with Overlaid Button */}
            <div className="absolute inset-0 bg-gray-900">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                alt="Static Map Location" 
                className="w-full h-full object-cover grayscale opacity-30 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#C5A059] rounded-full flex items-center justify-center shadow-2xl mb-8 mx-auto animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <a 
                    href={data.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-[#1a1a1a] px-12 py-5 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-[#C5A059] hover:text-white transition-all shadow-2xl block"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrapbook Section - White Aesthetic */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">Shared Memories</span>
            <h3 className="font-serif text-5xl md:text-7xl text-[#1a1a1a] italic leading-[1.1] mb-8">Contribute to the <br />Scrapbook</h3>
            <p className="text-gray-400 font-light text-lg max-w-md leading-relaxed mb-10">
              We are gathering a digital collection of well-wishes and candid photos. Share your favorite memory or a note of celebration.
            </p>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md">
                   <img src={`https://i.pravatar.cc/100?u=memory${i}`} className="w-full h-full object-cover grayscale" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">+12</div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ScrapbookForm />
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-24 text-center">
        <div className="w-20 h-px bg-gray-100 mx-auto mb-10"></div>
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-300">Celebration Garden Estates &copy; 2025</p>
      </footer>
    </div>
  );
};

export default ClientInvitation;
