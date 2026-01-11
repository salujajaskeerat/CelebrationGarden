
import React from 'react';

interface VenueIntroProps {
  aboutText?: string;
}

const VenueIntro: React.FC<VenueIntroProps> = ({ 
  aboutText = "More than a venue—a living legacy. Spanning twenty acres of manicured emerald lawns and hidden groves, Celebration Garden is the definitive setting for life's most profound milestones."
}) => {
  return (
    <section id="venue" className="py-24 md:py-32 bg-[#F9F8F3] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <p className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[10px] mb-6">The Grand Estate</p>
          <h2 className="text-[#064e3b] font-serif text-4xl md:text-6xl mb-8 tracking-tight">Architectural Serenity meets <br /><span className="italic">Botanical Bliss</span></h2>
          <div className="w-20 h-0.5 bg-[#C5A059] mx-auto mb-10"></div>
          {aboutText && (
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed text-lg font-light">
              {aboutText}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Section 1 */}
          <div className="md:col-span-7 relative group">
            <div className="overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] rounded-sm">
              <img 
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1200" 
                alt="The Grand Pavilion" 
                loading="lazy"
                className="w-full h-[450px] md:h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-8 -right-4 md:right-12 bg-[#064e3b] text-white p-10 md:p-12 max-w-xs shadow-2xl rounded-sm">
              <h3 className="font-serif text-3xl mb-4 italic">The Grand Pavilion</h3>
              <p className="text-xs text-white/60 leading-relaxed font-bold uppercase tracking-widest mb-2">Signature Masterpiece</p>
              <p className="text-sm text-gray-300 leading-relaxed font-light">
                A glass-walled sanctuary offering an immersive connection to the surrounding heritage oaks.
              </p>
            </div>
          </div>

          <div className="md:col-span-5 md:pl-16 flex flex-col justify-center py-12">
            <h4 className="text-[#C5A059] tracking-[0.3em] uppercase text-[10px] font-bold mb-6">Experience One</h4>
            <p className="text-[#064e3b] font-serif text-4xl mb-8 italic tracking-tight">Ethereal Glass Artistry</p>
            <p className="text-gray-600 leading-relaxed mb-10 text-lg font-light">
              Bathed in natural light by day and starlit brilliance by night, the Pavilion effortlessly accommodates 
              up to 300 guests in a climate-controlled environment that defies the boundaries of nature.
            </p>
            <div className="border-l-[3px] border-[#C5A059] pl-8 py-4 italic text-gray-500 font-serif text-xl">
              "An architectural dialogue between structure and the sky."
            </div>
          </div>

          <div className="md:col-span-12 h-24"></div>

          {/* Section 2 */}
          <div className="md:col-span-5 order-2 md:order-1 md:pr-16 flex flex-col justify-center py-12">
            <h4 className="text-[#C5A059] tracking-[0.3em] uppercase text-[10px] font-bold mb-6">Experience Two</h4>
            <p className="text-[#064e3b] font-serif text-4xl mb-8 italic tracking-tight">The Secret Rose Garden</p>
            <p className="text-gray-600 leading-relaxed mb-10 text-lg font-light">
              Reserved for the most intimate of vows. Walk through paths of heirloom roses and stone arches 
              that have witnessed centuries of whispers.
            </p>
            <ul className="space-y-4">
              {[
                '150 Curated Guest Seats',
                'Heirloom Stone Archways',
                'Bespoke Outdoor Acoustics',
                'Fragrant English Rose Varieties'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-[#064e3b]">
                  <span className="w-2 h-2 bg-[#C5A059] rounded-full"></span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-7 order-1 md:order-2 relative group">
            <div className="overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] rounded-sm">
              <img 
                src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1200" 
                alt="Secret Rose Garden" 
                loading="lazy"
                className="w-full h-[450px] md:h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueIntro;
