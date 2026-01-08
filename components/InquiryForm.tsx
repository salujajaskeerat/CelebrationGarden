'use client'

import React, { useState } from 'react';

const InquiryForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '150',
    lawn: 'emerald'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your interest. A Dedicated Event Concierge will contact you within 24 hours to schedule your private tour.');
  };

  return (
    <section id="inquire" className="py-24 md:py-36 bg-[#064e3b] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        <div className="lg:col-span-5">
          <p className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[10px] mb-6">Concierge Consultation</p>
          <h2 className="text-white font-serif text-4xl md:text-7xl mb-10 leading-[1.1]">The Journey <br /><span className="italic opacity-80">to Your Day</span></h2>
          <p className="text-white/60 leading-relaxed text-lg mb-12 font-light">
            Due to the exclusive nature of our estate, we host a limited number of celebrations each season. Share your vision with us to begin your journey.
          </p>
          
          <div className="space-y-10">
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 border border-white/20 flex items-center justify-center rounded-full text-[#C5A059] text-2xl font-serif">I</div>
              <div>
                <h5 className="text-white font-serif text-xl italic mb-1">Private Estate Tour</h5>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Personalized Walkthrough</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 border border-white/20 flex items-center justify-center rounded-full text-[#C5A059] text-2xl font-serif">II</div>
              <div>
                <h5 className="text-white font-serif text-xl italic mb-1">Bespoke Curation</h5>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Concept & Logistics Mapping</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-[#fcfcfc] p-10 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-2xl">
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-[#064e3b] font-serif text-3xl mb-2 italic">Engagement Inquiry</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">Direct Concierge Access</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                  <input 
                    type="text" required
                    className="w-full bg-transparent border-b border-gray-100 py-3 focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-gray-200"
                    placeholder="Jane Sterling"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                  <input 
                    type="email" required
                    className="w-full bg-transparent border-b border-gray-100 py-3 focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-gray-200"
                    placeholder="jane@bespoke.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preferred Lawn</label>
                  <select 
                    className="w-full bg-transparent border-b border-gray-100 py-3 focus:outline-none focus:border-[#C5A059] transition-colors bg-white cursor-pointer text-sm"
                    value={formData.lawn}
                    onChange={(e) => setFormData({...formData, lawn: e.target.value})}
                  >
                    <option value="emerald">The Emerald Grand Lawn</option>
                    <option value="grove">The Secret Grove Lawn</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Desired Date</label>
                  <input 
                    type="date" required
                    className="w-full bg-transparent border-b border-gray-100 py-3 focus:outline-none focus:border-[#C5A059] transition-colors"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Guest Count</label>
                  <select 
                    className="w-full bg-transparent border-b border-gray-100 py-3 focus:outline-none focus:border-[#C5A059] transition-colors bg-white cursor-pointer text-sm"
                    value={formData.guests}
                    onChange={(e) => setFormData({...formData, guests: e.target.value})}
                  >
                    <option value="50">Up to 50 guests</option>
                    <option value="150">50 - 150 guests</option>
                    <option value="300">150 - 300 guests</option>
                    <option value="unlimited">300+ guests</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mobile Phone</label>
                  <input 
                    type="tel"
                    className="w-full bg-transparent border-b border-gray-100 py-3 focus:outline-none focus:border-[#C5A059] transition-colors placeholder:text-gray-200"
                    placeholder="+1 (000) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#064e3b] text-white py-6 font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-[#C5A059] transition-all duration-500 mt-4 shadow-2xl rounded-sm"
              >
                Secure Consultation
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InquiryForm;
