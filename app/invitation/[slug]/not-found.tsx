import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-[#F9F8F3] min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="font-serif text-8xl md:text-[12rem] text-[#1a1a1a] mb-6 leading-none">404</h1>
          <div className="w-20 h-px bg-[#C5A059] mx-auto mb-8"></div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1a1a1a] italic mb-6">
            Invitation Not Found
          </h2>
          <p className="text-gray-500 text-lg md:text-xl font-light leading-relaxed mb-12 max-w-md mx-auto">
            We couldn't find the invitation you're looking for. It may have been moved or doesn't exist.
          </p>
        </div>
        
        <Link
          href="/"
          className="bg-[#1a1a1a] text-white px-12 py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#C5A059] transition-all shadow-xl inline-flex items-center gap-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

