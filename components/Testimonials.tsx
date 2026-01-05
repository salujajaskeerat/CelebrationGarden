
import React, { useState, useEffect } from 'react';

interface Review {
  id: string;
  name: string;
  role: string;
  content?: string;
  rating: number;
  avatar: string;
  handwrittenPhotoUrl?: string;
  isHandwritten?: boolean;
}

// MOCK DATA as fallback if the sheet is not provided or reachable
const FALLBACK_REVIEWS: Review[] = [
  {
    id: 'h1',
    name: 'The Millers',
    role: 'Couple',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=miller',
    handwrittenPhotoUrl: 'https://images.unsplash.com/photo-1516589174184-c685ca6d2080?auto=format&fit=crop&q=80&w=800',
    isHandwritten: true,
  },
  {
    id: '1',
    name: 'Patrick Nawrocki',
    role: 'Groom',
    content: "The lovely team at Celebration Garden has provided our wedding with significant leverage. Their work is exceptionally professional and attentive.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=patrick',
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Bride',
    content: "Celebration Garden far exceeded our expectations. The communication was always excellent and the scenery is breathtaking.",
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=priya',
  },
  {
    id: 'h2',
    name: 'Sophie & James',
    role: 'Couple',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=sophie',
    handwrittenPhotoUrl: 'https://images.unsplash.com/photo-1531346628371-55822986f376?auto=format&fit=crop&q=80&w=800',
    isHandwritten: true,
  }
];

// NOTE TO USER: Replace this ID with your actual Google Sheet ID. 
// Your sheet must be set to "Anyone with the link can view".
const GOOGLE_SHEET_ID = 'YOUR_SHEET_ID_HERE'; 
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv`;

const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSheetData = async () => {
      if (GOOGLE_SHEET_ID === 'YOUR_SHEET_ID_HERE') return;
      
      setLoading(true);
      try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // Simple CSV parser (assuming: Name, Role, Content, Rating, AvatarURL, HandwrittenPhotoURL)
        const rows = data.split('\n').slice(1); // Skip header
        const parsedReviews: Review[] = rows.map((row, index) => {
          const cols = row.split(',').map(c => c.replace(/^"|"$/g, ''));
          return {
            id: `sheet-${index}`,
            name: cols[0] || 'Anonymous',
            role: cols[1] || 'Guest',
            content: cols[2],
            rating: parseInt(cols[3]) || 5,
            avatar: cols[4] || `https://i.pravatar.cc/150?u=${index}`,
            handwrittenPhotoUrl: cols[5],
            isHandwritten: !!cols[5]
          };
        });
        
        if (parsedReviews.length > 0) {
          setReviews(parsedReviews);
        }
      } catch (error) {
        console.error("Failed to fetch Google Sheet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-[#F9F8F3] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-[#064e3b] font-medium tracking-[0.2em] uppercase text-[10px] mb-4">
            Testimonials
          </p>
          <h2 className="text-[#1a1a1a] font-serif text-4xl md:text-6xl max-w-2xl leading-[1.1]">
            Don't take our word for it!<br />
            <span className="italic opacity-60">Hear it from our partners.</span>
          </h2>
        </div>

        <div className="flex overflow-x-auto pb-12 gap-8 scrollbar-hide snap-x snap-mandatory">
          {reviews.map((review) => (
            <div 
              key={review.id}
              className={`min-w-[320px] md:min-w-[400px] bg-white shadow-sm rounded-3xl flex flex-col snap-center border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${review.isHandwritten ? 'p-0' : 'p-10'}`}
            >
              {review.isHandwritten ? (
                <div className="relative h-full flex flex-col">
                  <div className="flex-grow relative h-[350px]">
                    <img 
                      src={review.handwrittenPhotoUrl} 
                      alt="Handwritten review" 
                      className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-6 left-6">
                      <img 
                        src={review.avatar} 
                        alt={review.name} 
                        className="w-10 h-10 rounded-full border-2 border-white/50 shadow-lg"
                      />
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                       <p className="text-white font-serif text-2xl leading-none mb-1">
                        {review.name}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">
                        {review.role}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <img 
                        src={review.avatar} 
                        alt={review.name} 
                        className="w-12 h-12 rounded-full object-cover shadow-sm grayscale"
                      />
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-[#C5A059]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed text-base mb-10 font-medium">
                      "{review.content}"
                    </p>
                  </div>

                  <div>
                    <p className="font-serif text-2xl text-[#064e3b] leading-none mb-2 italic">
                      {review.name}
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                      {review.role}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* New Review Entry Placeholder */}
          <div className="min-w-[320px] md:min-w-[400px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 group cursor-pointer hover:border-[#C5A059] transition-all bg-white/50">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="text-[#C5A059] text-2xl">+</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 group-hover:text-[#064e3b]">Add Your Story</p>
            <p className="text-[10px] text-gray-300 mt-2 italic">Updated via our registry</p>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-6 opacity-40">
          <div className="h-[1px] flex-grow bg-gray-400"></div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-bold">
            Synched with our Client Registry
          </p>
          <div className="h-[1px] flex-grow bg-gray-400"></div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
