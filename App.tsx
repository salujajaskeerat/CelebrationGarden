
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
  const [view, setView] = useState<'landing' | 'invitation'>('landing');
  const [activeInvitation, setActiveInvitation] = useState<string>('sarah-michael-2025');

  // Sync state with URL path
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      if (path.startsWith('/invitation/')) {
        const slug = path.split('/').filter(Boolean).pop();
        if (slug) {
          setActiveInvitation(slug);
          setView('invitation');
          window.scrollTo(0, 0);
        }
      } else {
        setView('landing');
      }
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const navigateToInvite = (slug: string) => {
    window.history.pushState({}, '', `/invitation/${slug}`);
    setActiveInvitation(slug);
    setView('invitation');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setView('landing');
    window.scrollTo(0, 0);
  };

  if (view === 'invitation') {
    return (
      <div className="relative">
        <button 
          onClick={navigateToHome}
          className="fixed top-6 left-6 z-[200] bg-white text-[#1a1a1a] border border-gray-200 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-all shadow-xl"
        >
          ← Back to Site
        </button>
        <ClientInvitation slug={activeInvitation} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen selection:bg-[#064e3b] selection:text-white">
      {/* Demo Multi-Type Toggle */}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 items-end group">
        <button 
          onClick={() => navigateToInvite('olivia-birthday-2025')}
          className="bg-white text-[#C5A059] px-6 py-4 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 translate-y-10 group-hover:translate-y-0 transition-all border border-gray-100 hover:bg-[#C5A059] hover:text-white"
        >
          Preview Birthday Invite
        </button>
        <button 
          onClick={() => navigateToInvite('sarah-michael-2025')}
          className="w-16 h-16 bg-[#064e3b] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          title="Preview Wedding Invitation"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      {/* Top Hook - Price Estimate */}
      <div className="bg-[#064e3b] py-2 z-[101] relative">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center gap-4">
          <span className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] hidden sm:inline">Planning your celebration?</span>
          <a 
            href="#calculator" 
            className="text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-[#C5A059] transition-colors flex items-center gap-2"
          >
            Get a price estimate <span className="text-xs">→</span>
          </a>
        </div>
      </div>

      <Navbar />
      <main>
        <Hero />
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
