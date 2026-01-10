'use client'

import React, { useState, useEffect } from 'react';

type EventType = 'Wedding' | 'Corporate' | 'Birthday' | 'Social';

export interface InvitationData {
  slug: string;
  type: EventType;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  description: string;
  heroImage: string;
}

const Countdown: React.FC<{ targetDate: string; targetTime?: string }> = ({ targetDate, targetTime }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTime = () => {
      // IST is UTC+5:30
      const istOffsetMinutes = 5 * 60 + 30; // 330 minutes
      
      // Parse date and time, treating them as IST
      let targetDateTime: Date;
      
      if (targetTime) {
        // Combine date and time, treating as IST
        const [hours, minutes] = targetTime.split(':').map(Number);
        const dateParts = targetDate.split('-').map(Number);
        // Create date string in IST format, then convert to UTC
        // Create a date string that represents IST time
        const istDateString = `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}-${String(dateParts[2]).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
        targetDateTime = new Date(istDateString);
      } else {
        // If no time provided, use date at midnight IST
        const dateParts = targetDate.split('-').map(Number);
        const istDateString = `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}-${String(dateParts[2]).padStart(2, '0')}T00:00:00+05:30`;
        targetDateTime = new Date(istDateString);
      }
      
      // Get current time
      const now = new Date();
      
      const difference = targetDateTime.getTime() - now.getTime();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      }
    };
    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  return (
    <div className="flex justify-center gap-4 md:gap-8 mt-12">
      {[
        { label: 'Days', value: timeLeft.d },
        { label: 'Hours', value: timeLeft.h },
        { label: 'Mins', value: timeLeft.m },
        { label: 'Secs', value: timeLeft.s },
      ].map((item, i) => (
        <div key={i} className="text-center group">
          <div className="bg-[#1a1a1a] text-white w-14 h-14 md:w-20 md:h-20 flex items-center justify-center rounded-sm mb-2 shadow-xl group-hover:bg-[#C5A059] transition-colors duration-500">
            <span className="font-serif text-xl md:text-3xl">{item.value.toString().padStart(2, '0')}</span>
          </div>
          <span className="text-gray-400 text-[8px] uppercase tracking-[0.3em] font-bold">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const ScrapbookForm: React.FC<{ invitationSlug: string }> = ({ invitationSlug }) => {
  const [status, setStatus] = useState<'idle' | 'compressing' | 'uploading' | 'submitting' | 'success' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [relation, setRelation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Dynamically import image compression to avoid SSR issues
  const getFileSize = (file: File): string => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB < 1) {
      return `${(file.size / 1024).toFixed(1)} KB`;
    }
    return `${sizeMB.toFixed(2)} MB`;
  };

  // Relation options for the dropdown
  const relationOptions = [
    'Bride\'s Mom',
    'Bride\'s Dad',
    'Bride\'s Friend',
    'Bride\'s Family',
    'Groom\'s Mom',
    'Groom\'s Dad',
    'Groom\'s Friend',
    'Groom\'s Family',
    'Mutual Friend',
    'Colleague',
    'Neighbor',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('compressing');
    setErrorMessage('');
    setUploadProgress(0);

    try {
      let cloudinaryUrl: string | null = null;

      // Step 1: Compress image if provided (client-side only)
      if (file && typeof window !== 'undefined') {
        try {
          // Dynamically import compression to avoid SSR issues
          const { compressImage } = await import('../lib/imageCompression');
          const compressed = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.8,
            maxSizeMB: 0.5, // Target 500KB
          });
          setCompressedFile(compressed);
          console.log(`Image compressed: ${getFileSize(file)} → ${getFileSize(compressed)}`);
        } catch (compressionError) {
          console.warn('Compression failed, using original:', compressionError);
          // Continue with original file if compression fails
        }
      }

      // Step 2: Upload directly to Cloudinary (if image provided)
      // If image is selected, it MUST upload successfully - don't continue if it fails
      if (compressedFile || file) {
        setStatus('uploading');
        setUploadProgress(25);

        // Get Cloudinary config from environment variables
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
        const folder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER || 'celebration-garden/scrapbook';

        if (!cloudName) {
          throw new Error('Cloudinary not configured. Please set NEXT_PUBLIC_CLOUDINARY_NAME in your environment variables.');
        }

        // Validate cloudName - it should not contain slashes (that's the folder)
        const cleanCloudName = cloudName.split('/')[0].trim();
        if (!cleanCloudName) {
          throw new Error('Invalid Cloudinary cloud name. It should be just the cloud name (e.g., "dxyz123"), not a path.');
        }

        setUploadProgress(50);

        // Upload directly to Cloudinary (client-side, no backend involved)
        // No API key needed - unsigned upload preset handles authentication
        // IMPORTANT: For unsigned uploads, transformations MUST be in the preset, not in the request
        const uploadFormData = new FormData();
        uploadFormData.append('file', compressedFile || file!);
        uploadFormData.append('upload_preset', uploadPreset);
        uploadFormData.append('folder', folder);
        
        // Note: Transformation parameters cannot be sent with unsigned uploads
        // They must be configured in the upload preset itself
        // The preset "ml_default" should have transformation: q_80,f_jpg,w_1920,h_1920,c_limit

        // Use clean cloud name (without folder path)
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cleanCloudName}/image/upload`;
        
        console.log('Uploading to Cloudinary:', {
          url: uploadUrl,
          cloudName: cleanCloudName,
          uploadPreset,
          folder,
          hasFile: !!(compressedFile || file),
        });

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          let errorMessage = 'Image upload failed';
          let errorDetails: any = {};
          
          try {
            errorDetails = JSON.parse(errorText);
            errorMessage = errorDetails.error?.message || errorDetails.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }

          // Provide helpful error messages for common issues
          if (uploadResponse.status === 401) {
            errorMessage = `Cloudinary authentication failed (401). Please check:
1. Upload preset "${uploadPreset}" exists in Cloudinary
2. Upload preset is set to "Unsigned" mode
3. Cloud name "${cleanCloudName}" is correct
4. Upload preset name matches exactly: ${uploadPreset}`;
          } else if (uploadResponse.status === 400) {
            const errorInfo = errorDetails.error || {};
            const detailedMessage = errorInfo.message || JSON.stringify(errorDetails);
            errorMessage = `Cloudinary upload failed (400 Bad Request). 
Error: ${detailedMessage}

Common causes:
1. Upload preset "${uploadPreset}" doesn't exist or is misconfigured
2. Invalid transformation parameters
3. File format not supported by preset
4. Upload preset has restrictions (file size, format, etc.)

Check the error details in console and verify preset in Cloudinary console.`;
          } else if (uploadResponse.status === 404) {
            errorMessage = `Cloudinary upload preset not found. Please verify:
1. Upload preset "${uploadPreset}" exists in Cloudinary Console
2. Preset name matches exactly (case-sensitive)`;
          }

          console.error('Cloudinary upload error details:', {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            error: errorDetails,
            errorMessage: errorDetails.error?.message,
            errorCode: errorDetails.error?.http_code,
            cloudName: cleanCloudName,
            uploadPreset,
            fullError: JSON.stringify(errorDetails, null, 2),
          });

          throw new Error(errorMessage);
        }

        const uploadData = await uploadResponse.json();
        cloudinaryUrl = uploadData.secure_url || uploadData.url;
        setUploadProgress(75);
        console.log('Image uploaded to Cloudinary:', cloudinaryUrl);
      }

      // Step 3: Submit form data to backend (without file, just URL)
      setStatus('submitting');
      setUploadProgress(90);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('message', message);
      formData.append('phone', phone);
      formData.append('relation', relation);
      formData.append('invitationSlug', invitationSlug);
      if (cloudinaryUrl) {
        formData.append('imageUrl', cloudinaryUrl);
      }

      const response = await fetch('/api/scrapbook', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save entry');
      }

      setUploadProgress(100);
      setStatus('success');
      
      // Reset form
      setName('');
      setMessage('');
      setPhone('');
      setRelation('');
      setFile(null);
      setCompressedFile(null);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setUploadProgress(0);
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12 animate-fade-in-up">
        <div className="w-20 h-20 bg-gradient-to-br from-[#064e3b] to-[#C5A059] text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-4xl">✨</span>
        </div>
        <h4 className="font-serif text-2xl italic text-[#064e3b] mb-2">Memory Captured! 🎉</h4>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-2">Your contribution is now part of our legacy.</p>
          <p className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.2em] mt-4 italic">
          📱 A digital copy will be sent to your WhatsApp soon.
          </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-white p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-lg border border-gray-50">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-3xl">📖</span>
        <h4 className="font-serif text-3xl text-[#1a1a1a] italic">Digital Scrapbook</h4>
          <span className="text-3xl">✨</span>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-2">Share your wishes & memories 💝</p>
      </div>
      
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Your Name <span className="text-red-500">*</span>
          </label>
        <input 
          type="text" 
            placeholder="Enter your full name" 
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
            spellCheck={true}
            autoComplete="name"
            className="w-full border-b-2 border-gray-200 py-3 px-2 outline-none focus:border-[#C5A059] text-sm transition-colors bg-gray-50/50 rounded-t"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Your Relation <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-full border-b-2 border-gray-200 py-3 px-2 outline-none focus:border-[#C5A059] text-sm transition-colors bg-gray-50/50 rounded-t appearance-none cursor-pointer"
          >
            <option value="">Select your relation...</option>
            {relationOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Your Message <span className="text-red-500">*</span>
          </label>
        <textarea 
            placeholder="Share your wishes, memories, or a special message... 💌" 
          required 
            rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
            spellCheck={true}
            autoComplete="off"
            className="w-full border-b-2 border-gray-200 py-3 px-2 outline-none focus:border-[#C5A059] text-sm transition-colors resize-none bg-gray-50/50 rounded-t"
        ></textarea>
          <p className="text-[9px] text-gray-400 mt-1 italic">💡 Tip: Feel free to use emojis to express yourself!</p>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input 
            type="tel" 
            placeholder="+91 98765 43210"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="w-full border-b-2 border-gray-200 py-3 px-2 outline-none focus:border-[#C5A059] text-sm transition-colors bg-gray-50/50 rounded-t"
          />
          <p className="text-[9px] text-gray-400 mt-1 italic">📱 We'll send you a digital copy of the scrapbook via WhatsApp</p>
        </div>

        <div className="relative group pt-4">
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                setFile(selectedFile);
                setCompressedFile(null); // Reset compressed file when new file selected
              }
            }}
            className="hidden" 
            id="photo-upload"
            disabled={status === 'compressing' || status === 'uploading' || status === 'submitting'}
          />
          <label 
            htmlFor="photo-upload"
            className={`flex items-center justify-center gap-3 w-full py-6 border-2 border-dashed rounded-lg transition-all group ${
              status === 'compressing' || status === 'uploading' || status === 'submitting'
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                : 'border-gray-300 hover:border-[#C5A059] hover:bg-[#C5A059]/5 cursor-pointer'
            }`}
          >
            {file ? (
              <>
                <span className="text-2xl">📷</span>
                <div className="flex flex-col items-start">
                  <span className="text-gray-700 text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    {compressedFile 
                      ? `Compressed: ${getFileSize(compressedFile)} (from ${getFileSize(file)})`
                      : `Size: ${getFileSize(file)}`
                    }
            </span>
                </div>
                <span className="text-xs text-gray-400">(Click to change)</span>
              </>
            ) : (
              <>
                <span className="text-2xl">📸</span>
                <span className="text-gray-600 text-sm font-medium">Upload a candid photo (Optional)</span>
              </>
            )}
          </label>
          {file && !compressedFile && status === 'idle' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
              <span>ℹ️</span>
              <span>Image will be compressed automatically before upload</span>
            </div>
          )}
          {(status === 'compressing' || status === 'uploading' || status === 'submitting') && (
            <div className="mt-4 space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#C5A059] to-[#d4b068] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {status === 'compressing' && 'Compressing image...'}
                {status === 'uploading' && 'Uploading to Cloudinary...'}
                {status === 'submitting' && 'Saving your entry...'}
              </p>
            </div>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={status === 'compressing' || status === 'uploading' || status === 'submitting'}
        className="w-full bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:from-[#C5A059] hover:to-[#d4b068] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center gap-2"
      >
        {status === 'compressing' ? (
          <>
            <span className="animate-spin">🔄</span>
            <span>Compressing...</span>
          </>
        ) : status === 'uploading' ? (
          <>
            <span className="animate-pulse">📤</span>
            <span>Uploading...</span>
          </>
        ) : status === 'submitting' ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span>💝</span>
            <span>Post to Digital Scrapbook</span>
          </>
        )}
      </button>
    </form>
  );
};

const ClientInvitation: React.FC<{ data: InvitationData }> = ({ data }) => {
  // Fixed location data
  const fixedAddress = "122 Garden Lane, Emerald Valley, EV 90210";
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=Celebration+Garden+Estates+${encodeURIComponent(fixedAddress)}`;

  return (
    <div className="bg-[#F9F8F3] min-h-screen text-[#1a1a1a] selection:bg-[#C5A059] selection:text-white pb-40">
      {/* Hero Atmosphere Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 scale-110 animate-slow-zoom">
          <img src={data.heroImage} alt="" className="w-full h-full object-cover grayscale-[10%]" />
          <div className="absolute inset-0 bg-black/50 bg-gradient-to-b from-transparent via-black/20 to-[#F9F8F3]"></div>
        </div>

        <div className="relative z-10 max-w-5xl animate-fade-in-up">
          <p className="text-[#C5A059] font-bold tracking-[0.6em] uppercase text-[10px] mb-8">{data.subtitle}</p>
          <h1 className="font-serif text-6xl md:text-[9rem] leading-[0.85] mb-12 tracking-tighter text-white drop-shadow-2xl">
            {data.title}
          </h1>
          <div className="flex items-center justify-center gap-6">
             <div className="h-px w-10 bg-white/40"></div>
             <p className="text-white text-xl md:text-2xl font-serif italic">{data.date}</p>
             <div className="h-px w-10 bg-white/40"></div>
          </div>
        </div>
      </section>

      {/* Primary Invitation Box */}
      <section className="relative z-20 -mt-20 px-6">
        <div className="max-w-4xl mx-auto bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] p-10 md:p-24 text-center rounded-sm">
          <div className="w-12 h-12 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-12">
            <span className="text-[#C5A059] text-xl font-serif">M</span>
          </div>
          
          <h2 className="text-[#1a1a1a] font-serif text-3xl md:text-5xl italic mb-10 leading-tight">
            {data.type === 'Wedding' ? 'A Forever Chapter Begins' : 'A Milestone to Remember'}
          </h2>
          
          <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed mb-16 max-w-2xl mx-auto italic">
            "{data.description}"
          </p>

          <Countdown targetDate={data.date} targetTime={data.time} />

          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-16 text-left border-t border-gray-50 pt-16">
            <div className="space-y-4">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">The Schedule</span>
              <p className="font-serif text-4xl italic leading-tight">{data.time}</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{data.date}</p>
            </div>
            <div className="space-y-4">
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">The Space</span>
              <p className="font-serif text-4xl italic leading-tight">Celebration Garden Estates</p>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Emerald Valley, EV 90210</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map & Get Directions Section - Moved up per request */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 order-2 lg:order-1">
            <div>
              <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-6">Logistics & Navigation</span>
              <h3 className="font-serif text-5xl md:text-6xl italic leading-tight text-[#1a1a1a]">Arrival at <br />the Estate</h3>
              <p className="text-gray-400 font-light text-lg mt-8 leading-relaxed">
                Celebration Garden is nestled in the heart of Emerald Valley. Valet services will be waiting for all guests at the main carriage entrance.
              </p>
            </div>
            
            <div className="bg-[#1a1a1a] p-10 rounded-sm text-white shadow-2xl">
              <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Official Location</p>
              <p className="font-serif text-2xl italic mb-2">{fixedAddress}</p>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-8">Emerald Valley, EV 90210</p>
              <a 
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#C5A059] text-white px-10 py-5 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-white hover:text-[#1a1a1a] transition-all w-full text-center shadow-xl"
              >
                Get Directions
              </a>
            </div>
          </div>
          
          <div className="relative group overflow-hidden shadow-2xl rounded-sm aspect-video order-1 lg:order-2 border border-gray-100">
            <div className="absolute inset-0 bg-gray-900">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                alt="Estate Map Location" 
                className="w-full h-full object-cover grayscale opacity-40 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                 <div className="w-16 h-16 bg-[#C5A059] rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrapbook Section */}
      <section className="py-32 px-6 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5">
            <span className="text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">Shared Memories</span>
            <h3 className="font-serif text-5xl md:text-7xl text-[#1a1a1a] italic leading-[1.1] mb-8">The Digital <br />Scrapbook</h3>
            <p className="text-gray-400 font-light text-lg max-w-md leading-relaxed mb-10">
              Contribute a wish or a photo to our collection. Guests who provide a phone number will receive a copy of the finalized scrapbook.
            </p>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md">
                   <img src={`https://i.pravatar.cc/100?u=memory${i}`} className="w-full h-full object-cover grayscale" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">+12</div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ScrapbookForm invitationSlug={data.slug} />
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-24 text-center">
        <div className="w-20 h-px bg-gray-100 mx-auto mb-10"></div>
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-300">Celebration Garden Estates &copy; 2025</p>
      </footer>
    </div>
  );
};

export default ClientInvitation;
