'use client'

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
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled 
          ? 'bg-white shadow-lg py-4' 
          : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand */}
        <a 
          href="#" 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`relative font-serif text-2xl md:text-3xl tracking-tighter transition-colors duration-500 z-[110] ${
            isScrolled || isMobileMenuOpen ? 'text-[#064e3b]' : 'text-white'
          }`}
        >
          Celebration <span className="italic font-normal opacity-80">Garden</span>
        </a>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-10">
          <div className="flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:text-[#C5A059] ${
                  isScrolled ? 'text-[#064e3b]' : 'text-white/90'
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>
          <a 
            href="#inquire" 
            className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${
              isScrolled 
                ? 'bg-[#064e3b] text-white hover:bg-[#C5A059]' 
                : 'bg-[#C5A059] text-white hover:bg-white hover:text-[#064e3b]'
            }`}
          >
            Check Availability
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden relative z-[110] p-2 transition-colors duration-300 ${
            isScrolled || isMobileMenuOpen ? 'text-[#064e3b]' : 'text-white'
          }`}
          aria-label="Toggle Menu"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[104] transition-opacity duration-500 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[105] lg:hidden transition-transform duration-500 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        <div className="flex-grow flex flex-col items-center justify-center space-y-10 px-8">
          <div className="w-full text-center space-y-6">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-[#064e3b] font-serif text-4xl italic hover:text-[#C5A059] transition-all active:scale-95"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="w-12 h-px bg-gray-100"></div>
          <a 
            href="#inquire"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center bg-[#064e3b] text-white py-6 font-bold uppercase tracking-[0.4em] text-[10px] shadow-lg active:scale-95 transition-transform"
          >
            Check Availability
          </a>
        </div>
        
        <div className="p-8 border-t border-gray-50 text-center">
          <p className="text-[8px] font-bold uppercase tracking-widest text-gray-300">Celebration Garden Estates</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
