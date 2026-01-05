
import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VenueIntro from './components/VenueIntro';
import Gallery from './components/Gallery';
import PriceCalculator from './components/PriceCalculator';
import FAQ from './components/FAQ';
import Testimonials from './components/Testimonials';
import InquiryForm from './components/InquiryForm';
import Footer from './components/Footer';
import ClientInvitation from './components/ClientInvitation';

const App: React.FC = () => {
  // Use a state for the view to ensure it works in sandboxed preview environments
  const [view, setView] = useState<'landing' | 'invitation'>('landing');
  const [activeInvitation, setActiveInvitation] = useState<string>('sarah-michael-2025');

  useEffect(() => {
    // Initial check for URL
    if (window.location.pathname.startsWith('/invitation/')) {
      const slug = window.location.pathname.split('/').pop();
      if (slug) {
        setActiveInvitation(slug);
        setView('invitation');
      }
    }

    const handlePopState = () => {
      if (window.location.pathname.startsWith('/invitation/')) {
        const slug = window.location.pathname.split('/').pop();
        if (slug) {
          setActiveInvitation(slug);
          setView('invitation');
        }
      } else {
        setView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);

    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');

      if (href && href.startsWith('/invitation/')) {
        e.preventDefault();
        const slug = href.split('/').pop();
        if (slug) {
          window.history.pushState({}, '', href);
          setActiveInvitation(slug);
          setView('invitation');
          window.scrollTo(0, 0);
        }
        return;
      }

      if (href === '/') {
        e.preventDefault();
        window.history.pushState({}, '', href);
        setView('landing');
        window.scrollTo(0, 0);
        return;
      }

      if (target.hash && target.hash.startsWith('#')) {
        const element = document.querySelector(target.hash);
        if (element && view === 'landing') {
          e.preventDefault();
          const navHeight = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        } else if (element && view === 'invitation') {
          // If on invitation, go back to landing then scroll
          e.preventDefault();
          setView('landing');
          setTimeout(() => {
             const el = document.querySelector(target.hash!);
             if (el) {
                const pos = el.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: pos, behavior: 'smooth' });
             }
          }, 100);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [view]);

  if (view === 'invitation') {
    return (
      <div className="relative">
        <button 
          onClick={() => setView('landing')}
          className="fixed top-6 left-6 z-[200] bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#064e3b] transition-all"
        >
          ← Back to Main Site
        </button>
        <ClientInvitation slug={activeInvitation} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen selection:bg-[#064e3b] selection:text-white">
      {/* Dev Mode / Preview Toggle */}
      <button 
        onClick={() => setView('invitation')}
        className="fixed bottom-8 right-8 z-[200] w-14 h-14 bg-[#C5A059] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        title="Preview Invitation Page"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="absolute right-full mr-4 bg-white text-[#064e3b] px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          View Demo Invitation
        </span>
      </button>

      {/* Top Hook - Price Estimate */}
      <div className="bg-[#064e3b] py-2 z-[101] relative">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center gap-4">
          <span className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] hidden sm:inline">Planning your 2025 celebration?</span>
          <a 
            href="#calculator" 
            className="text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-[#C5A059] transition-colors flex items-center gap-2"
          >
            Get a estimate of price <span className="text-xs">→</span>
          </a>
        </div>
      </div>

      <Navbar />
      <main>
        <Hero />
        
        {/* Secondary Sub-Nav Bar */}
        <div className="bg-white border-b border-gray-100 sticky top-[72px] lg:top-[88px] z-40 py-4 hidden md:block">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#064e3b]">
              Explore our sanctuary
            </p>
            <div className="flex gap-8">
              <a href="#venue" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#064e3b]">The Estate</a>
              <a href="#gallery" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#064e3b]">Lookbook</a>
              <a href="#faq" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#064e3b]">Inquiries</a>
            </div>
          </div>
        </div>

        <VenueIntro />
        <Gallery />
        <PriceCalculator />
        <FAQ />
        <Testimonials />
        <InquiryForm />
      </main>
      <Footer />
    </div>
  );
};

export default App;
