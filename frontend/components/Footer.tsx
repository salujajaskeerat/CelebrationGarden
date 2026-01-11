
import React from 'react';
import InteractiveMap from './InteractiveMap';

interface FooterProps {
  aboutText?: string;
  address: {
    line1: string;
    line2: string;
    line3: string;
    country: string;
  };
  phoneNumber?: string;
}

const Footer: React.FC<FooterProps> = ({ 
  aboutText = "A bespoke setting for the modern romantic. Experience the pinnacle of luxury event design.",
  address,
  phoneNumber
}) => {
  return (
    <footer className="bg-[#F9F8F3] pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-1">
            <h3 className="font-serif text-3xl text-[#064e3b] mb-6 tracking-tighter">
              Celebration <br /><span className="italic opacity-60">Garden</span>
            </h3>
            {aboutText && (
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {aboutText}
              </p>
            )}
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#C5A059] hover:border-[#C5A059] transition-all">FB</a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#C5A059] hover:border-[#C5A059] transition-all">IG</a>
              <a href="#" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#C5A059] hover:border-[#C5A059] transition-all">PT</a>
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
              <li><a href="#calculator" className="text-gray-500 text-sm hover:text-[#C5A059] transition-colors">Investment Studio</a></li>
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
            &copy; 2024 Celebration Garden Estates. All Rights Reserved.
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
