import React from 'react';
import { ENTRIES_PER_PAGE_DEFAULT } from '../lib/scrapbook-template-constants';

export type ScrapbookEntry = {
  id: number;
  name: string;
  relation: string;
  message: string;
  image?: {
    url?: string;
    alternativeText?: string;
  };
  image_url?: string; // Fallback if image is not available
};

export type ScrapbookTemplateProps = {
  invitation: {
    title: string;
    subtitle?: string;
    event_date?: string;
    type?: string;
    location?: string;
  };
  categorizedEntries: {
    friends: ScrapbookEntry[];
    closeRelatives: ScrapbookEntry[];
    extendedFamily: ScrapbookEntry[];
    colleagues: ScrapbookEntry[];
    others: ScrapbookEntry[];
  };
  highlights: {
    funny: ScrapbookEntry[];
    secret: ScrapbookEntry[];
  };
  entriesPerPage?: number;
};

const serif = "'Playfair Display', 'Cormorant Garamond', serif";
const sans = "'Inter', 'Poppins', system-ui, -apple-system, sans-serif";

// Polaroid styles
const polaroidStyles = `
  .polaroid-container {
    perspective: 1000px;
  }
  
  .polaroid-frame {
    background: white;
    padding: 12px 12px 40px 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: rotate(-1deg);
    transition: transform 0.3s ease;
    width: 200px;
  }
  
  .polaroid-frame:hover {
    transform: rotate(0deg) scale(1.02);
  }
  
  .polaroid-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
    background: #f5f5f5;
  }
  
  .polaroid-placeholder {
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #F0EDE8 0%, #E8E8E8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 64px;
    font-weight: 700;
    color: #C5A059;
  }
  
  .polaroid-caption {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #E8E8E8;
    text-align: center;
  }
  
  .polaroid-container-small {
    perspective: 1000px;
  }
  
  .polaroid-frame-small {
    background: white;
    padding: 6px 6px 20px 6px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
    transform: rotate(2deg);
    transition: transform 0.3s ease;
    width: 80px;
  }
  
  .polaroid-frame-small:hover {
    transform: rotate(0deg) scale(1.05);
  }
  
  .polaroid-image-small {
    width: 100%;
    height: 80px;
    object-fit: cover;
    display: block;
    background: #f5f5f5;
  }
  
  .polaroid-placeholder-small {
    width: 100%;
    height: 80px;
    background: linear-gradient(135deg, #F0EDE8 0%, #E8E8E8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    color: #C5A059;
  }
`;

export function ScrapbookTemplate({
  invitation,
  categorizedEntries,
  highlights,
  entriesPerPage = ENTRIES_PER_PAGE_DEFAULT,
}: ScrapbookTemplateProps) {
  const sections = [
    { title: 'Friends', entries: categorizedEntries.friends },
    { title: 'Close Relatives', entries: categorizedEntries.closeRelatives },
    { title: 'Extended Family', entries: categorizedEntries.extendedFamily },
    { title: 'Colleagues', entries: categorizedEntries.colleagues },
    { title: 'Others', entries: categorizedEntries.others },
  ];

  return (
    <>
      <style>{polaroidStyles}</style>
      <div className="space-y-12">
        <CoverPage invitation={invitation} />
        {sections.map(
          (section) =>
            section.entries.length > 0 && (
              <SectionPage
                key={section.title}
                title={section.title}
                entries={section.entries}
                entriesPerPage={entriesPerPage}
              />
            )
        )}
        <HighlightsPage highlights={highlights} />
        <FooterPage invitation={invitation} />
      </div>
    </>
  );
}

function CoverPage({ invitation }: { invitation: ScrapbookTemplateProps['invitation'] }) {
  return (
    <div className="scrapbook-page relative flex flex-col items-center justify-center text-center bg-white w-[8.5in] min-h-[11in] px-16 py-14 mx-auto box-border">
      <div className="w-16 h-0.5 bg-[#C5A059] opacity-60 my-4 mx-auto" />
      <h1 className="text-[72px] font-black leading-tight tracking-[-0.02em] text-[#1A1A1A]" style={{ fontFamily: serif }}>
        {invitation.title}
      </h1>
      {invitation.subtitle && (
        <p className="text-[20px] text-gray-600 mt-2" style={{ fontFamily: sans }}>
          {invitation.subtitle}
        </p>
      )}
      {invitation.event_date && (
        <p className="text-[18px] text-gray-700 mt-6" style={{ fontFamily: serif }}>
          {formatDate(invitation.event_date)}
        </p>
      )}
      {invitation.type && (
        <p
          className="text-xs tracking-[0.2em] uppercase text-gray-500 mt-4"
          style={{ fontFamily: sans }}
        >
          {invitation.type}
        </p>
      )}
      <div className="w-16 h-0.5 bg-[#C5A059] opacity-60 my-6 mx-auto" />
      <Branding />
    </div>
  );
}

function SectionPage({
  title,
  entries,
  entriesPerPage,
}: {
  title: string;
  entries: ScrapbookEntry[];
  entriesPerPage: number;
}) {
  const pages = chunk(entries, entriesPerPage);

  return (
    <>
      {pages.map((pageEntries, idx) => (
        <div key={`${title}-${idx}`} className="scrapbook-page relative bg-white w-[8.5in] min-h-[11in] px-12 py-12 mx-auto box-border">
          <h2 className="text-4xl md:text-5xl font-bold text-center tracking-[-0.01em] text-[#1A1A1A]" style={{ fontFamily: serif }}>
            {title}
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] opacity-60 my-4 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
            {pageEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          <Branding />
        </div>
      ))}
    </>
  );
}

function EntryCard({ entry }: { entry: ScrapbookEntry }) {
  const initial = entry.name?.[0]?.toUpperCase() || '?';
  // Use image.url first, then fall back to image_url
  const imageUrl = entry.image?.url || entry.image_url;
  const hasImage = !!imageUrl;
  
  return (
    <div className="flex flex-col items-center text-center p-6">
      {hasImage ? (
        <div className="polaroid-container mb-6">
          <div className="polaroid-frame">
            <img
              src={imageUrl}
              alt={entry.image?.alternativeText || entry.name}
              className="polaroid-image"
            />
            <div className="polaroid-caption">
              <div className="text-sm font-semibold text-[#1A1A1A]" style={{ fontFamily: sans }}>
                {entry.name}
              </div>
              <div className="text-xs uppercase tracking-[0.1em] text-gray-500 mt-1" style={{ fontFamily: sans }}>
                {entry.relation}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="polaroid-container mb-6">
          <div className="polaroid-frame">
            <div className="polaroid-placeholder">
              {initial}
            </div>
            <div className="polaroid-caption">
              <div className="text-sm font-semibold text-[#1A1A1A]" style={{ fontFamily: sans }}>
                {entry.name}
              </div>
              <div className="text-xs uppercase tracking-[0.1em] text-gray-500 mt-1" style={{ fontFamily: sans }}>
                {entry.relation}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="text-[17px] leading-8 text-[#1A1A1A] max-w-xl" style={{ fontFamily: sans }}>
        {entry.message}
      </div>
    </div>
  );
}

function HighlightsPage({ highlights }: { highlights: ScrapbookTemplateProps['highlights'] }) {
  const { funny, secret } = highlights;
  if (!funny.length && !secret.length) return null;

  return (
    <div className="scrapbook-page relative bg-white w-[8.5in] min-h-[11in] px-12 py-12 mx-auto box-border">
      <h2 className="text-4xl md:text-5xl font-bold text-center tracking-[-0.01em] text-[#1A1A1A]" style={{ fontFamily: serif }}>
        Highlights
      </h2>
      <div className="w-16 h-0.5 bg-[#C5A059] opacity-60 my-4 mx-auto" />

      {funny.length > 0 && (
        <div className="mt-6">
          <h3 className="text-3xl text-center mb-4" style={{ fontFamily: serif }}>
            Funny Moments
          </h3>
          <div className="space-y-4">
            {funny.map((entry) => (
              <HighlightCard key={`funny-${entry.id}`} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {secret.length > 0 && (
        <div className="mt-10">
          <h3 className="text-3xl text-center mb-4" style={{ fontFamily: serif }}>
            Secret Revelations
          </h3>
          <div className="space-y-4">
            {secret.map((entry) => (
              <HighlightCard key={`secret-${entry.id}`} entry={entry} />
            ))}
          </div>
        </div>
      )}

      <Branding />
    </div>
  );
}

function HighlightCard({ entry }: { entry: ScrapbookEntry }) {
  const initial = entry.name?.[0]?.toUpperCase() || '?';
  // Use image.url first, then fall back to image_url
  const imageUrl = entry.image?.url || entry.image_url;
  const hasImage = !!imageUrl;
  
  return (
    <div className="flex items-start gap-4 bg-[#FAF9F6] border-l-4 border-[#C5A059] p-4 rounded-sm">
      {hasImage ? (
        <div className="polaroid-container-small flex-shrink-0">
          <div className="polaroid-frame-small">
            <img
              src={imageUrl}
              alt={entry.image?.alternativeText || entry.name}
              className="polaroid-image-small"
            />
          </div>
        </div>
      ) : (
        <div className="polaroid-container-small flex-shrink-0">
          <div className="polaroid-frame-small">
            <div className="polaroid-placeholder-small">
              {initial}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1">
        <p className="text-lg leading-relaxed" style={{ fontFamily: serif }}>
          "{entry.message}"
        </p>
        <p className="text-sm text-gray-500 mt-2 text-right" style={{ fontFamily: sans }}>
          — {entry.name}, {entry.relation}
        </p>
      </div>
    </div>
  );
}

function FooterPage({ invitation }: { invitation: ScrapbookTemplateProps['invitation'] }) {
  return (
    <div className="scrapbook-page relative flex flex-col items-center justify-center text-center bg-white w-[8.5in] min-h-[11in] px-16 py-14 mx-auto box-border">
      <div className="w-16 h-0.5 bg-[#C5A059] opacity-60 my-4 mx-auto" />
      <h2 className="text-4xl" style={{ fontFamily: serif }}>
        Thank You
      </h2>
      <p className="text-lg italic mt-4" style={{ fontFamily: sans }}>
        For being part of our special day
      </p>
      {invitation.event_date && (
        <p className="text-base mt-4" style={{ fontFamily: sans }}>
          {formatDate(invitation.event_date)}
        </p>
      )}
      {invitation.location && (
        <p className="text-base text-gray-600 mt-2" style={{ fontFamily: sans }}>
          {invitation.location}
        </p>
      )}
      <div className="mt-6 text-2xl" style={{ fontFamily: serif }}>
        Celebration Garden Estates
      </div>
      <Branding />
    </div>
  );
}

function Branding() {
  return (
    <div className="absolute bottom-5 right-5 text-xs text-gray-500 opacity-40 tracking-[0.1em] uppercase" style={{ fontFamily: serif }}>
      Celebration Garden
    </div>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    pages.push(arr.slice(i, i + size));
  }
  return pages;
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}
