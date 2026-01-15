'use client'

import React, { useState, useRef, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

interface InquiryFormProps {
  formTitle?: string;
  formSubtitle?: string;
  formFieldNameLabel?: string;
  formFieldNamePlaceholder?: string;
  formFieldEmailLabel?: string;
  formFieldEmailPlaceholder?: string;
  formFieldPhoneLabel?: string;
  formFieldPhonePlaceholder?: string;
  formFieldLawnLabel?: string;
  formFieldDateLabel?: string;
  formFieldGuestsLabel?: string;
  formSubmitLabel?: string;
  formSuccessMessage?: string;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  formTitle = 'Engagement Inquiry',
  formSubtitle = 'Direct Concierge Access',
  formFieldNameLabel = 'Full Name',
  formFieldNamePlaceholder = 'Jane Sterling',
  formFieldEmailLabel = 'Email Address',
  formFieldEmailPlaceholder = 'jane@bespoke.com',
  formFieldPhoneLabel = 'Mobile Phone',
  formFieldPhonePlaceholder = '+1 (000) 000-0000',
  formFieldLawnLabel = 'Preferred Lawn',
  formFieldDateLabel = 'Desired Date',
  formFieldGuestsLabel = 'Guest Count',
  formSubmitLabel = 'Secure Consultation',
  formSuccessMessage = 'Thank you for your interest. A Dedicated Event Concierge will contact you within 24 hours to schedule your private tour.'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '150',
    lawn: 'maharaja'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus first field on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Phone number formatting
  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 10)}`;
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneNumber = phone.replace(/\D/g, '');
    return phoneNumber.length >= 10;
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        return !validateEmail(value) ? 'Please enter a valid email address' : '';
      case 'phone':
        return !validatePhone(value) ? 'Please enter a valid phone number' : '';
      case 'date':
        if (!value) return 'Please select a date';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today ? 'Date cannot be in the past' : '';
      default:
        return '';
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData({...formData, [name]: value});
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({...fieldErrors, [name]: ''});
    }
    // Validate on blur for phone number formatting
    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({...prev, phone: formatted}));
    }
  };

  const handleFieldBlur = (name: string, value: string) => {
    const error = validateField(name, value);
    setFieldErrors({...fieldErrors, [name]: error});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    // Validate all fields
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferred_lawn: formData.lawn,
          desired_date: formData.date,
          guest_count: formData.guests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitStatus('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        guests: '150',
        lawn: 'emerald'
      });
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="inquire" className="py-24 md:py-36 bg-[#064e3b] relative overflow-visible">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        <div className="lg:col-span-5">
          <ScrollReveal>
            <p className="text-[#C5A059] font-bold tracking-[0.4em] uppercase text-[10px] mb-6">Concierge Consultation</p>
            <h2 className="text-white font-serif text-4xl md:text-7xl mb-10 leading-[1.1]">The Journey <br /><span className="italic opacity-80">to Your Day</span></h2>
            <p className="text-white/60 leading-relaxed text-lg mb-12 font-light">
              Due to the exclusive nature of our estate, we host a limited number of celebrations each season. Share your vision with us to begin your journey.
            </p>
            
            <div className="space-y-10">
              <div className="flex items-center gap-8">
                <div className="w-14 h-14 border border-white/20 flex items-center justify-center rounded-full text-[#C5A059] text-2xl font-serif">I</div>
                <div>
                  <h5 className="text-white font-serif text-xl italic mb-1">Private Estate Tour</h5>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Personalized Walkthrough</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="w-14 h-14 border border-white/20 flex items-center justify-center rounded-full text-[#C5A059] text-2xl font-serif">II</div>
                <div>
                  <h5 className="text-white font-serif text-xl italic mb-1">Bespoke Curation</h5>
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Concept & Logistics Mapping</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="lg:col-span-7">
          <ScrollReveal delay={200}>
          <div className="bg-[#fcfcfc] p-10 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-2xl">
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-[#064e3b] font-serif text-3xl mb-2 italic">{formTitle}</h3>
              {formSubtitle && <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">{formSubtitle}</p>}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formFieldNameLabel}</label>
                  <input 
                    ref={nameInputRef}
                    type="text" required
                    className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors placeholder:text-gray-200 ${
                      fieldErrors.name 
                        ? 'border-red-300 focus:border-red-400' 
                        : 'border-gray-100 focus:border-[#C5A059]'
                    }`}
                    placeholder={formFieldNamePlaceholder}
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={(e) => handleFieldBlur('name', e.target.value)}
                  />
                  {fieldErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formFieldEmailLabel}</label>
                  <input 
                    type="email" required
                    className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors placeholder:text-gray-200 ${
                      fieldErrors.email 
                        ? 'border-red-300 focus:border-red-400' 
                        : 'border-gray-100 focus:border-[#C5A059]'
                    }`}
                    placeholder={formFieldEmailPlaceholder}
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    onBlur={(e) => handleFieldBlur('email', e.target.value)}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formFieldLawnLabel}</label>
                  <select 
                    className="w-full bg-transparent border-b border-gray-100 py-3 focus:outline-none focus:border-[#C5A059] transition-colors bg-white cursor-pointer text-sm"
                    value={formData.lawn}
                    onChange={(e) => setFormData({...formData, lawn: e.target.value})}
                  >
                    <option value="maharaja">The Maharaja Lawn — Ideal for grand celebrations (up to 700 guests)</option>
                    <option value="darbar">The Darbar Lawn — Perfect for intimate gatherings (up to 150 guests)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formFieldDateLabel}</label>
                  <input 
                    type="date" required
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors ${
                      fieldErrors.date 
                        ? 'border-red-300 focus:border-red-400' 
                        : 'border-gray-100 focus:border-[#C5A059]'
                    }`}
                    value={formData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                    onBlur={(e) => handleFieldBlur('date', e.target.value)}
                  />
                  {fieldErrors.date && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.date}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formFieldGuestsLabel}</label>
                  <select 
                    className="w-full bg-transparent border-b border-gray-100 py-3 focus:outline-none focus:border-[#C5A059] transition-colors bg-white cursor-pointer text-sm"
                    value={formData.guests}
                    onChange={(e) => setFormData({...formData, guests: e.target.value})}
                  >
                    <option value="50">Up to 50 guests</option>
                    <option value="150">50 - 150 guests</option>
                    <option value="300">150 - 300 guests</option>
                    <option value="unlimited">300+ guests</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{formFieldPhoneLabel}</label>
                  <input 
                    type="tel" required
                    className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors placeholder:text-gray-200 ${
                      fieldErrors.phone 
                        ? 'border-red-300 focus:border-red-400' 
                        : 'border-gray-100 focus:border-[#C5A059]'
                    }`}
                    placeholder={formFieldPhonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    onBlur={(e) => handleFieldBlur('phone', e.target.value)}
                  />
                  {fieldErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-sm text-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {formSuccessMessage}
                  </div>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-sm text-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </div>
                </div>
              )}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#064e3b] text-white py-6 font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-[#C5A059] transition-all duration-500 mt-4 shadow-2xl rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  formSubmitLabel
                )}
              </button>
            </form>
          </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default InquiryForm;
