
import React from 'react';
import InteractiveMap from './InteractiveMap';

interface FooterProps {
  brandName?: string;
  aboutText?: string;
  address: {
    line1: string;
    line2: string;
    line3: string;
    country: string;
  };
  phoneNumber?: string;
  footerText?: string;
  instagramUrl?: string;
}

const Footer: React.FC<FooterProps> = ({ 
  brandName = 'Celebration Garden',
  aboutText = "A bespoke setting for the modern romantic. Experience the pinnacle of luxury event design.",
  address,
  phoneNumber,
  footerText,
  instagramUrl
}) => {
  // Parse brand name for display
  const brandParts = brandName.split(' ');
  const firstPart = brandParts[0] || 'Celebration';
  const secondPart = brandParts.slice(1).join(' ') || 'Garden';
  return (
    <footer className="bg-[#F9F8F3] pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-1">
            <h3 className="font-serif text-3xl text-[#064e3b] mb-6 tracking-tighter">
              {firstPart} {secondPart && <><br /><span className="italic opacity-60">{secondPart}</span></>}
            </h3>
            {aboutText && (
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {aboutText}
              </p>
            )}
            {footerText && (
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {footerText}
              </p>
            )}
            <div className="flex gap-4">
              {instagramUrl && (
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#C5A059] hover:border-[#C5A059] transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-[#064e3b]">Location</h4>
            <p className="text-gray-500 text-sm leading-loose">
              {address.line1 && <>{address.line1}<br /></>}
              {address.line2 && <>{address.line2}<br /></>}
              {address.line3 && <>{address.line3}<br /></>}
              {address.country}
            </p>
            {phoneNumber && (
              <p className="text-gray-500 text-sm leading-loose mt-4">
                <a href={`tel:${phoneNumber}`} className="hover:text-[#C5A059] transition-colors">
                  {phoneNumber}
                </a>
              </p>
            )}
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-[#064e3b]">Client Services</h4>
            <ul className="space-y-4">
              <li>
                <a href="/invitation/sarah-michael-2025" className="text-gray-500 text-sm hover:text-[#C5A059] transition-colors flex items-center gap-2">
                  Sample Invitation <span className="text-[10px] bg-[#C5A059]/10 text-[#C5A059] px-2 py-0.5 rounded-full font-bold">New</span>
                </a>
              </li>
              {/* <li><a href="#calculator" className="text-gray-500 text-sm hover:text-[#C5A059] transition-colors">Investment Studio</a></li> */} {/* Commented out - calculator not shown for now */}
              <li><a href="#inquire" className="text-gray-500 text-sm hover:text-[#C5A059] transition-colors">Concierge Portal</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-[#064e3b]">Our Estate</h4>
            <InteractiveMap />
          </div>
        </div>

        <div className="pt-12 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {brandName}. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-[#C5A059]">Privacy Policy</a>
            <a href="#" className="hover:text-[#C5A059]">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
