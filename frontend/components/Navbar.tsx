'use client'

import React, { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  brandName?: string;
  navItems?: NavItem[];
  navCtaLabel?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  brandName = 'Celebration Garden',
  navItems = [
    { label: 'The Estate', href: '#venue' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Investment', href: '#calculator' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#inquire' },
  ],
  navCtaLabel = 'Check Availability'
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section detection using Intersection Observer
  useEffect(() => {
    const sections = navItems
      .map(item => item.href.substring(1))
      .filter(href => href && href !== 'calculator') // Filter out calculator if it doesn't exist
      .concat(['testimonials']); // Add testimonials section

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observers: IntersectionObserver[] = [];

    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [navItems]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Parse brand name - if it contains "Garden", split it for styling
  const brandParts = brandName.split(' ');
  const firstPart = brandParts[0] || 'Celebration';
  const secondPart = brandParts.slice(1).join(' ') || 'Garden';

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
          aria-label="Go to homepage"
          className={`relative font-serif text-2xl md:text-3xl tracking-tighter transition-colors duration-500 z-[110] ${
            isScrolled || isMobileMenuOpen ? 'text-[#064e3b]' : 'text-white'
          }`}
        >
          {firstPart} {secondPart && <span className="italic font-normal opacity-80">{secondPart}</span>}
        </a>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-10">
          <div className="flex items-center space-x-8">
            {navItems.map((link) => {
              const sectionId = link.href.substring(1);
              const isActive = activeSection === sectionId;
              return (
                <a 
                  key={link.href}
                  href={link.href} 
                  className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 hover:text-[#C5A059] ${
                    isScrolled ? 'text-[#064e3b]' : 'text-white/90'
                  } ${isActive ? 'text-[#C5A059] border-b-2 border-[#C5A059] pb-1' : ''}`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
          <a 
            href="#inquire"
            aria-label="Check availability and contact us"
            className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${
              isScrolled 
                ? 'bg-[#064e3b] text-white hover:bg-[#C5A059]' 
                : 'bg-[#C5A059] text-white hover:bg-white hover:text-[#064e3b]'
            }`}
          >
            {navCtaLabel}
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
            {navItems.map((link) => (
              <a 
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-[#064e3b] font-serif text-4xl italic hover:text-[#C5A059] transition-all active:scale-95"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="w-12 h-px bg-gray-100"></div>
          <a 
            href="#inquire"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center bg-[#064e3b] text-white py-6 font-bold uppercase tracking-[0.4em] text-[10px] shadow-lg active:scale-95 transition-transform"
          >
            {navCtaLabel}
          </a>
        </div>
        
        <div className="p-8 border-t border-gray-50 text-center">
          <p className="text-[8px] font-bold uppercase tracking-widest text-gray-300">{brandName}</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
