
import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'The Estate', href: '#venue' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Investment', href: '#calculator' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#inquire' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Identity */}
        <a 
          href="#" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`group relative font-serif text-2xl md:text-3xl tracking-tighter transition-colors duration-500 z-[110] ${
            isScrolled || isMobileMenuOpen ? 'text-[#064e3b]' : 'text-white'
          }`}
        >
          Celebration <span className="italic font-normal opacity-80 group-hover:opacity-100 transition-opacity">Garden</span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-10">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className={`relative text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:text-[#C5A059] group ${
                  isScrolled ? 'text-[#064e3b]' : 'text-white/90'
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-[#C5A059] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          
          <a 
            href="#inquire" 
            className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 shadow-xl relative overflow-hidden group ${
              isScrolled 
                ? 'bg-[#064e3b] text-white hover:bg-[#C5A059]' 
                : 'bg-[#C5A059] text-white hover:bg-white hover:text-[#064e3b]'
            }`}
          >
            <span className="relative z-10">Check Availability</span>
          </a>
        </div>

        {/* Mobile Menu Toggle - z-[110] ensures it stays clickable over the drawer */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden relative z-[110] w-12 h-12 flex items-center justify-center transition-colors duration-300 ${
            isScrolled || isMobileMenuOpen ? 'text-[#064e3b]' : 'text-white'
          }`}
          aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
        >
          <div className="w-6 h-5 relative flex flex-col justify-between overflow-hidden">
            <span className={`w-full h-0.5 bg-current transition-all duration-500 ease-out transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
            <span className={`w-full h-0.5 bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-0 -translate-x-full' : ''}`}></span>
            <span className={`w-full h-0.5 bg-current transition-all duration-500 ease-out transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Slide-in Mobile Drawer from Left */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[104] lg:hidden transition-opacity duration-500 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#F9F8F3] shadow-2xl z-[105] lg:hidden transition-transform duration-700 cubic-bezier(0.85, 0, 0.15, 1) ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col px-10 pt-32 pb-12 overflow-y-auto">
          <p className="text-[#C5A059] font-bold tracking-[0.5em] uppercase text-[9px] mb-12 opacity-60">
            Discovery
          </p>
          
          <div className="flex flex-col space-y-8">
            {navLinks.map((link, idx) => (
              <a 
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-[#064e3b] font-serif text-3xl italic transition-all duration-500 hover:text-[#C5A059] transform origin-left ${
                  isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
                }`}
                style={{ transitionDelay: `${idx * 100 + 300}ms` }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="mt-auto pt-12 space-y-12">
            <div className={`transition-all duration-700 delay-800 transform ${
              isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <a 
                href="#inquire"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center bg-[#064e3b] text-white py-5 font-bold uppercase tracking-[0.4em] text-[10px] shadow-lg hover:bg-[#C5A059] transition-colors"
              >
                Check Availability
              </a>
            </div>

            <div className={`flex flex-col gap-4 transition-all duration-700 delay-[900ms] ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}>
              <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold">Social Connection</p>
              <div className="flex gap-8">
                <a href="#" className="text-[#064e3b] hover:text-[#C5A059] transition-colors font-bold text-[10px] uppercase tracking-widest">Instagram</a>
                <a href="#" className="text-[#064e3b] hover:text-[#C5A059] transition-colors font-bold text-[10px] uppercase tracking-widest">Pinterest</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
