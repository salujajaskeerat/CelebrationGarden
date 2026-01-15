/**
 * Fallback template for homepage content
 * This file is used when Strapi fields are empty or missing
 * Edit this file to set default values for your homepage content
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface HomePageFallbackData {
  brandName: string;
  navItems: NavItem[];
  navCtaLabel: string;
  formTitle: string;
  formSubtitle: string;
  formFieldNameLabel: string;
  formFieldNamePlaceholder: string;
  formFieldEmailLabel: string;
  formFieldEmailPlaceholder: string;
  formFieldPhoneLabel: string;
  formFieldPhonePlaceholder: string;
  formFieldLawnLabel: string;
  formFieldDateLabel: string;
  formFieldGuestsLabel: string;
  formSubmitLabel: string;
  formSuccessMessage: string;
  footerText: string;
  instagramUrl: string;
  faqs: FAQItem[];
  faqCategories: string[];
  address: {
    line1: string;
    line2: string;
    line3: string;
    country: string;
  };
  phoneNumber: string;
  whatsappPhone: string;
  testimonialsSubtitle: string;
  testimonialsHeading: string;
  testimonialsFooterText: string;
}

export const homePageFallback: HomePageFallbackData = {
  brandName: 'Celebration Garden',
  navItems: [
    { label: 'The Estate', href: '#venue' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Testimonials', href: '#testimonials' },
    // { label: 'Investment', href: '#calculator' }, // Commented out - calculator not shown for now
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#inquire' },
  ],
  navCtaLabel: 'Check Availability',
  formTitle: 'Engagement Inquiry',
  formSubtitle: 'Direct Concierge Access',
  formFieldNameLabel: 'Full Name',
  formFieldNamePlaceholder: 'Jane Sterling',
  formFieldEmailLabel: 'Email Address',
  formFieldEmailPlaceholder: 'jane@bespoke.com',
  formFieldPhoneLabel: 'Mobile Phone',
  formFieldPhonePlaceholder: '+1 (000) 000-0000',
  formFieldLawnLabel: 'Preferred Lawn',
  formFieldDateLabel: 'Desired Date',
  formFieldGuestsLabel: 'Guest Count',
  formSubmitLabel: 'Secure Consultation',
  formSuccessMessage: 'Thank you for your interest. A Dedicated Event Concierge will contact you within 24 hours to schedule your private tour.',
  footerText: '',
  instagramUrl: '',
  faqs: [
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
  ],
  faqCategories: ['General', 'Venue', 'Catering', 'Booking'],
  address: {
    line1: 'Celebration Garden, Opposite Parsavnath Sterling Appartments',
    line2: 'Mohan Nagar, Ghaziabad',
    line3: 'Pincode: 201001',
    country: 'Uttar Pradesh, India',
  },
  phoneNumber: '+91 9136222000',
  whatsappPhone: '+91 9136222000',
  testimonialsSubtitle: 'Testimonials',
  testimonialsHeading: "Don't take our word for it!<br />Hear it from our partners.",
  testimonialsFooterText: 'Synched with our Client Registry',
};
