'use client'

import React, { useState, useEffect } from 'react';

type Step = 'lead' | 'verify' | 'calculate' | 'result';

const PriceCalculator: React.FC = () => {
  const [step, setStep] = useState<Step>('lead');
  const [leadInfo, setLeadInfo] = useState({ name: '', phone: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [details, setDetails] = useState({
    eventType: 'Wedding',
    date: '',
    guests: 100,
    mealType: 'Non-Veg'
  });
  const [estimate, setEstimate] = useState(0);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('verify');
    // Simulate sending a code
    setTimeout(() => {
      console.log("Mock verification code: 1234");
    }, 500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setStep('calculate');
    }, 1200);
  };

  const calculateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseRates: Record<string, number> = {
      'Wedding': 6500,
      'Corporate Event': 4200,
      'Birthday': 2800,
      'Gala': 5200
    };

    const costPerGuest = details.mealType === 'Non-Veg' ? 125 : 95;
    const base = baseRates[details.eventType] || 3500;
    const guestTotal = details.guests * costPerGuest;
    
    let weekendPremium = 0;
    if (details.date) {
      const dateObj = new Date(details.date);
      const day = dateObj.getDay();
      weekendPremium = (day === 0 || day === 6) ? 2200 : 0;
    }

    setEstimate(base + guestTotal + weekendPremium);
    setStep('result');
  };

  const reset = () => {
    setStep('lead');
    setLeadInfo({ name: '', phone: '' });
    setVerificationCode('');
  };

  const progress = step === 'lead' ? 25 : step === 'verify' ? 50 : step === 'calculate' ? 75 : 100;

  return (
    <section id="calculator" className="py-24 md:py-36 bg-[#F9F8F3] relative overflow-hidden">
      {/* Decorative botanical element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#064e3b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-[#C5A059] font-bold tracking-[0.5em] uppercase text-[10px] mb-4">Investment Studio</p>
          <h2 className="text-[#064e3b] font-serif text-4xl md:text-6xl mb-6">Tailored Valuation <span className="italic">Studio</span></h2>
          <div className="w-16 h-px bg-gray-200 mx-auto"></div>
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col md:flex-row min-h-[600px]">
          {/* Sidebar - Contextual Information */}
          <div className="md:w-1/3 bg-[#064e3b] p-10 md:p-14 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center mb-10">
                <svg className="w-6 h-6 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-serif text-3xl mb-6 italic">Precision Planning</h3>
              <p className="text-white/60 text-sm leading-relaxed font-light">
                Our algorithm accounts for current seasonal trends, weekend premiums, and artisanal catering costs to give you an accurate baseline for your bespoke event.
              </p>
            </div>
            
            <div className="space-y-4 pt-12 border-t border-white/10">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                <span className="text-white/40">Step</span>
                <span className="text-[#C5A059]">{step === 'lead' ? '01' : step === 'verify' ? '02' : step === 'calculate' ? '03' : '04'} / 04</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#C5A059] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          {/* Main Interface */}
          <div className="md:w-2/3 p-8 md:p-16 flex flex-col relative bg-[#fcfcfc]">
            {step === 'lead' && (
              <div className="animate-fade-in">
                <h4 className="text-[#064e3b] font-serif text-3xl mb-3">Begin Your Consultation</h4>
                <p className="text-gray-400 text-sm mb-12">Identify your celebration to unlock our investment calculator.</p>
                <form onSubmit={handleLeadSubmit} className="space-y-10">
                  <div className="group border-b border-gray-200 focus-within:border-[#C5A059] transition-colors pb-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#C5A059] block mb-2">Full Name</label>
                    <input 
                      type="text" required
                      className="w-full bg-transparent text-lg font-serif italic outline-none placeholder:text-gray-200"
                      placeholder="e.g. Elizabeth Sterling"
                      value={leadInfo.name}
                      onChange={(e) => setLeadInfo({...leadInfo, name: e.target.value})}
                    />
                  </div>
                  <div className="group border-b border-gray-200 focus-within:border-[#C5A059] transition-colors pb-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-[#C5A059] block mb-2">Mobile Contact</label>
                    <input 
                      type="tel" required
                      className="w-full bg-transparent text-lg font-serif italic outline-none placeholder:text-gray-200"
                      placeholder="+1 (555) 000-0000"
                      value={leadInfo.phone}
                      onChange={(e) => setLeadInfo({...leadInfo, phone: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-[#064e3b] text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#C5A059] transition-all shadow-xl"
                  >
                    Generate Access Key
                  </button>
                </form>
              </div>
            )}

            {step === 'verify' && (
              <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full">
                <div className="mb-8">
                  <h4 className="text-[#064e3b] font-serif text-3xl mb-3 italic">Security Verification</h4>
                  <p className="text-gray-400 text-sm">We've sent a 4-digit verification code to your mobile device.</p>
                </div>
                <form onSubmit={handleVerify} className="w-full max-w-xs space-y-8">
                  <div className="flex justify-center gap-4">
                    <input 
                      type="text" maxLength={4} required
                      className="w-full text-center text-4xl font-serif tracking-[0.5em] bg-transparent border-b-2 border-gray-100 focus:border-[#C5A059] outline-none py-4"
                      placeholder="0000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isVerifying}
                    className="w-full bg-[#064e3b] text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#C5A059] transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Authenticating...
                      </>
                    ) : 'Verify & Enter Studio'}
                  </button>
                  <button type="button" onClick={() => setStep('lead')} className="text-[9px] uppercase tracking-widest text-gray-300 hover:text-[#064e3b] font-bold transition-colors">
                    Back to Contact info
                  </button>
                </form>
              </div>
            )}

            {step === 'calculate' && (
              <div className="animate-fade-in h-full flex flex-col justify-center">
                <div className="mb-10 flex justify-between items-end">
                   <div>
                     <h4 className="text-[#064e3b] font-serif text-2xl italic">Curating your quote</h4>
                     <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Guest: {leadInfo.name}</p>
                   </div>
                </div>
                
                <form onSubmit={calculateQuote} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Celebration Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Wedding', 'Gala', 'Corporate', 'Intimate'].map((type) => (
                        <button
                          key={type} type="button"
                          onClick={() => setDetails({...details, eventType: type})}
                          className={`py-3 px-2 text-[9px] font-bold uppercase tracking-widest border transition-all ${details.eventType === type ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white text-gray-400 border-gray-100 hover:border-[#C5A059]'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Event Date</label>
                    <input 
                      type="date" required
                      className="w-full bg-white border border-gray-100 px-4 py-3 outline-none focus:border-[#C5A059] text-xs font-bold uppercase tracking-widest text-gray-600"
                      value={details.date}
                      onChange={(e) => setDetails({...details, date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Guest Intensity</label>
                      <span className="font-serif text-[#064e3b] italic">{details.guests} Attending</span>
                    </div>
                    <input 
                      type="range" min="30" max="300" step="5"
                      className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#064e3b]"
                      value={details.guests}
                      onChange={(e) => setDetails({...details, guests: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Gastronomy Direction</label>
                    <div className="flex gap-4">
                      {['Bespoke (Veg)', 'Signature (Non-Veg)'].map((type) => (
                        <button
                          key={type} type="button"
                          onClick={() => setDetails({...details, mealType: type.includes('Non-Veg') ? 'Non-Veg' : 'Veg'})}
                          className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest border transition-all ${details.mealType === (type.includes('Non-Veg') ? 'Non-Veg' : 'Veg') ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-white text-gray-400 border-gray-100 hover:border-[#C5A059]'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="md:col-span-2 w-full bg-[#C5A059] text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#064e3b] transition-all shadow-xl mt-4"
                  >
                    Request Valuation
                  </button>
                </form>
              </div>
            )}

            {step === 'result' && (
              <div className="animate-fade-in text-center flex flex-col items-center justify-center h-full">
                <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.5em] mb-6">Investment Estimate</p>
                <div className="mb-10 relative">
                  <span className="absolute -left-12 -top-4 text-5xl text-[#064e3b]/10 font-serif">$</span>
                  <h3 className="text-7xl md:text-9xl font-serif text-[#064e3b] tracking-tighter leading-none italic">
                    {estimate.toLocaleString()}
                  </h3>
                  <div className="mt-8 flex items-center justify-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <span>{details.guests} Guests</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span>{details.eventType}</span>
                  </div>
                </div>
                
                <div className="w-full max-w-sm grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 mb-12 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-white p-4">
                    <p className="text-[8px] text-gray-300 font-bold uppercase mb-1">Catering</p>
                    <p className="text-[10px] text-[#064e3b] font-bold tracking-widest uppercase">{details.mealType}</p>
                  </div>
                  <div className="bg-white p-4">
                    <p className="text-[8px] text-gray-300 font-bold uppercase mb-1">Day Rate</p>
                    <p className="text-[10px] text-[#064e3b] font-bold tracking-widest uppercase">
                      {details.date ? new Date(details.date).toLocaleDateString('en-US', { weekday: 'short' }) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <a 
                    href="#inquire"
                    className="flex-1 bg-[#064e3b] text-white py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#C5A059] transition-all shadow-xl text-center"
                  >
                    Secure This Estimate
                  </a>
                  <button 
                    onClick={reset}
                    className="flex-1 border border-gray-200 text-gray-400 py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gray-50 transition-all"
                  >
                    Adjust Parameters
                  </button>
                </div>
                <p className="mt-8 text-[9px] text-gray-300 uppercase tracking-widest italic">
                  * This is a curated baseline. Final contracts may vary based on specific artisanal selections.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceCalculator;
