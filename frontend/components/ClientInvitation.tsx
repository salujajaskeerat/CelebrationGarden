'use client'

import React, { useState, useEffect } from 'react';

type EventType = 'Wedding' | 'Corporate' | 'Birthday' | 'Social';

export interface InvitationData {
  slug: string;
  type: EventType;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  description: string;
  heroImage: string;
}

const Countdown: React.FC<{ targetDate: string; targetTime?: string }> = ({ targetDate, targetTime }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTime = () => {
      // IST is UTC+5:30
      const istOffsetMinutes = 5 * 60 + 30; // 330 minutes
      
      // Parse date and time, treating them as IST
      let targetDateTime: Date;
      
      if (targetTime) {
        // Combine date and time, treating as IST
        const [hours, minutes] = targetTime.split(':').map(Number);
        const dateParts = targetDate.split('-').map(Number);
        // Create date string in IST format, then convert to UTC
        // Create a date string that represents IST time
        const istDateString = `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}-${String(dateParts[2]).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
        targetDateTime = new Date(istDateString);
      } else {
        // If no time provided, use date at midnight IST
        const dateParts = targetDate.split('-').map(Number);
        const istDateString = `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}-${String(dateParts[2]).padStart(2, '0')}T00:00:00+05:30`;
        targetDateTime = new Date(istDateString);
      }
      
      // Get current time
      const now = new Date();
      
      const difference = targetDateTime.getTime() - now.getTime();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      }
    };
    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

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

const ScrapbookForm: React.FC<{ invitationSlug: string }> = ({ invitationSlug }) => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('message', message);
      formData.append('invitationSlug', invitationSlug);
      if (phone) {
        formData.append('phone', phone);
      }
      if (file) {
        formData.append('photo', file);
      }

      const response = await fetch('/api/scrapbook', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save entry');
      }

      setStatus('success');
      // Reset form
      setName('');
      setMessage('');
      setPhone('');
      setFile(null);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12 animate-fade-in-up">
        <div className="w-16 h-16 bg-[#064e3b] text-white rounded-full flex items-center justify-center mx-auto mb-6">✓</div>
        <h4 className="font-serif text-2xl italic text-[#064e3b]">Memory Captured</h4>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-2">Your contribution is now part of our legacy.</p>
        {phone && (
          <p className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.2em] mt-4 italic">
            A digital copy will be sent to your WhatsApp soon.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-white p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-sm border border-gray-50">
      <div className="text-center mb-8">
        <h4 className="font-serif text-3xl text-[#1a1a1a] italic">Digital Scrapbook</h4>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-2">Leave a wish & photo for the host</p>
      </div>
      
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <input 
          type="text" 
          placeholder="Your Name" 
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#C5A059] text-sm transition-colors"
        />
        <textarea 
          placeholder="A message to share..." 
          required 
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#C5A059] text-sm transition-colors resize-none"
        ></textarea>
        
        <div className="space-y-1">
          <input 
            type="tel" placeholder="Phone Number (Optional)"
            className="w-full border-b border-gray-100 py-3 outline-none focus:border-[#C5A059] text-sm transition-colors"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="text-[8px] text-gray-300 italic">Provide your number to receive a digital copy of the scrapbook via WhatsApp.</p>
        </div>

        <div className="relative group pt-4">
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
        type="submit" 
        disabled={status === 'submitting'}
        className="w-full bg-[#1a1a1a] text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#C5A059] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Submitting...' : 'Post to Digital Scrapbook'}
      </button>
    </form>
  );
};

const ClientInvitation: React.FC<{ data: InvitationData }> = ({ data }) => {
  // Fixed location data
  const fixedAddress = "122 Garden Lane, Emerald Valley, EV 90210";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=Celebration+Garden+Estates+${encodeURIComponent(fixedAddress)}`;

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

      {/* Primary Invitation Box */}
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

          <Countdown targetDate={data.date} targetTime={data.time} />

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-16 text-left border-t border-gray-50 pt-16">
            <div className="space-y-4">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">The Schedule</span>
              <p className="font-serif text-4xl italic leading-tight">{data.time}</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{data.date}</p>
            </div>
            <div className="space-y-4">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">The Space</span>
              <p className="font-serif text-4xl italic leading-tight">Celebration Garden Estates</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Emerald Valley, EV 90210</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Get Directions Section - Moved up per request */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 order-2 lg:order-1">
            <div>
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-6">Logistics & Navigation</span>
              <h3 className="font-serif text-5xl md:text-6xl italic leading-tight text-[#1a1a1a]">Arrival at <br />the Estate</h3>
              <p className="text-gray-400 font-light text-lg mt-8 leading-relaxed">
                Celebration Garden is nestled in the heart of Emerald Valley. Valet services will be waiting for all guests at the main carriage entrance.
              </p>
            </div>
            
            <div className="bg-[#1a1a1a] p-10 rounded-sm text-white shadow-2xl">
              <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Official Location</p>
              <p className="font-serif text-2xl italic mb-2">{fixedAddress}</p>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-8">Emerald Valley, EV 90210</p>
              <a 
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#C5A059] text-white px-10 py-5 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-[#1a1a1a] transition-all w-full text-center shadow-xl"
              >
                Get Directions
              </a>
            </div>
          </div>
          
          <div className="relative group overflow-hidden shadow-2xl rounded-sm aspect-video order-1 lg:order-2 border border-gray-100">
            <div className="absolute inset-0 bg-gray-900">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                alt="Estate Map Location" 
                className="w-full h-full object-cover grayscale opacity-40 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                 <div className="w-16 h-16 bg-[#C5A059] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrapbook Section */}
      <section className="py-32 px-6 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">Shared Memories</span>
            <h3 className="font-serif text-5xl md:text-7xl text-[#1a1a1a] italic leading-[1.1] mb-8">The Digital <br />Scrapbook</h3>
            <p className="text-gray-400 font-light text-lg max-w-md leading-relaxed mb-10">
              Contribute a wish or a photo to our collection. Guests who provide a phone number will receive a copy of the finalized scrapbook.
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
            <ScrapbookForm invitationSlug={data.slug} />
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
