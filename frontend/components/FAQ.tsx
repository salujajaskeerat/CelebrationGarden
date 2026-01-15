'use client'

import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQProps {
  faqs?: FAQItem[];
  categories?: string[];
}

// Icon mapping based on category
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'General': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    'Venue': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    'Catering': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    'Booking': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  };

  return iconMap[category] || (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

// Default FAQ data as fallback
const defaultFaqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is the maximum capacity of Celebration Garden?',
    answer: 'Our Grand Pavilion can comfortably host up to 300 guests for a seated banquet, while our intimate Secret Rose Garden is ideal for ceremonies of up to 150 guests.',
  },
  {
    category: 'General',
    question: 'Is there on-site parking available for guests?',
    answer: 'Yes, we provide complimentary valet parking for all guests. Our estate features a discreet, secure parking area with a capacity for 120 vehicles.',
  },
  {
    category: 'Venue',
    question: 'What happens if it rains on my wedding day?',
    answer: 'Our Grand Pavilion serves as a breathtaking indoor backup for outdoor ceremonies. Its floor-to-ceiling glass ensures you still feel surrounded by the garden while staying perfectly dry.',
  },
  {
    category: 'Venue',
    question: 'Are we allowed to bring our own external vendors?',
    answer: 'While we have a curated list of "Elite Partners," we do welcome outside vendors. They must be licensed, insured, and approved by our estate management team 60 days prior to the event.',
  },
  {
    category: 'Catering',
    question: 'Can you accommodate specific dietary requirements?',
    answer: 'Absolutely. Our executive culinary team specializes in bespoke menus, including vegan, gluten-free, Kosher, and Halal options. We conduct personal tasting sessions for every couple.',
  },
  {
    category: 'Booking',
    question: 'What is your cancellation and rescheduling policy?',
    answer: 'We offer a flexible rescheduling policy up to 9 months before your date. For cancellations, the initial reservation deposit is non-refundable, but can often be applied to a future date within 12 months.',
  },
];

const defaultCategories = ['General', 'Venue', 'Catering', 'Booking'];

const FAQ: React.FC<FAQProps> = ({ 
  faqs = defaultFaqs,
  categories = defaultCategories 
}) => {
  // Use provided categories or extract unique categories from FAQs
  const availableCategories = categories.length > 0 
    ? categories 
    : Array.from(new Set(faqs.map(faq => faq.category)));
  
  const [activeCategory, setActiveCategory] = useState(availableCategories[0] || 'General');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <section id="faq" className="py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
          <h2 className="text-[#064e3b] font-serif text-4xl md:text-5xl mb-6">Frequently asked questions</h2>
          <p className="text-gray-500 text-lg font-light">
            Everything you need to know about the estate and our services. <br />
            Can’t find what you’re looking for?             <a href="#inquire" className="text-[#C5A059] border-b border-[#C5A059] pb-0.5 hover:text-[#064e3b] hover:border-[#064e3b] transition-colors">Speak to our concierge team.</a>
          </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(0); // Reset accordion on tab change
              }}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                activeCategory === cat
                  ? 'bg-[#064e3b] text-white border-[#064e3b]'
                  : 'bg-white text-gray-400 border-gray-200 hover:border-[#C5A059]'
              }`}
            >
              {cat}
            </button>
          ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          {/* FAQ List */}
          <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No FAQs available for this category.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border-b border-gray-100 last:border-0 transition-all duration-500`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-start text-left gap-6 group focus:outline-none"
              >
                <div className={`w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-[#C5A059] text-white border-[#C5A059]' : 'text-[#064e3b] group-hover:bg-[#F9F8F3]'}`}>
                  {getCategoryIcon(faq.category)}
                </div>
                <div className="flex-grow pt-2">
                  <h3 className={`text-base font-semibold transition-colors duration-300 ${openIndex === index ? 'text-[#064e3b]' : 'text-gray-900 group-hover:text-[#064e3b]'}`}>
                    {faq.question}
                  </h3>
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      openIndex === index ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-gray-500 leading-relaxed text-sm font-light">
                      {faq.answer}
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <svg 
                    className={`w-5 h-5 text-gray-300 transition-transform duration-500 ${openIndex === index ? 'rotate-180 text-[#C5A059]' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            </div>
            ))
          )}
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={600}>
          {/* Help Bubble - Design element from image */}
          <div className="mt-20 flex flex-col items-center">
          <div className="p-1 rounded-full bg-gray-50 border border-gray-100 mb-6">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
                ))}
             </div>
          </div>
          <h4 className="text-base font-semibold text-[#064e3b] mb-2">Still have questions?</h4>
          <p className="text-gray-400 text-sm mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <a 
            href="#inquire" 
            className="bg-[#064e3b] text-white px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#C5A059] transition-all rounded-lg shadow-lg"
          >
            Get in touch
          </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FAQ;
