
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000" 
          alt="Lush Wedding Garden" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/20 via-transparent to-[#064e3b]/50"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl animate-fade-in-up">
        <p className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs mb-6 drop-shadow-lg">
          A Sanctuary for Timeless Celebrations
        </p>
        <h1 className="text-white font-serif text-5xl md:text-8xl mb-8 leading-[1.1] tracking-tight">
          The Canvas for Your <br /><span className="italic">Forever Story</span>
        </h1>
        <p className="text-white/80 max-w-2xl mx-auto mb-12 text-lg font-light leading-relaxed">
          Where architectural grandeur meets untamed botanical beauty. Host your legacy in the heart of Emerald Valley.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a 
            href="#inquire" 
            className="bg-[#064e3b] text-white px-10 py-5 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-[#C5A059] transition-all duration-500 shadow-2xl min-w-[220px]"
          >
            Request Brochure
          </a>
          <a 
            href="#calculator" 
            className="text-white border border-white/40 backdrop-blur-md px-10 py-5 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-[#064e3b] transition-all duration-500 min-w-[220px]"
          >
            Get Price Estimate
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-[1px] h-20 bg-gradient-to-b from-white to-transparent"></div>
      </div>
    </section>
  );
};

export default Hero;
