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
  return (
    <div className="flex flex-col items-center text-center p-6">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={entry.image?.alternativeText || entry.name}
          className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg mb-4"
        />
      ) : (
        <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#F0EDE8] to-[#E8E8E8] flex items-center justify-center font-serif text-5xl font-bold text-[#C5A059] border-4 border-white shadow-lg mb-4">
          {initial}
        </div>
      )}
      <div className="text-[22px] font-semibold text-[#1A1A1A] mb-1" style={{ fontFamily: sans }}>
        {entry.name}
      </div>
      <div className="text-sm uppercase tracking-[0.15em] text-gray-500 mb-3" style={{ fontFamily: sans }}>
        {entry.relation}
      </div>
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
  return (
    <div className="flex items-start gap-4 bg-[#FAF9F6] border-l-4 border-[#C5A059] p-4 rounded-sm">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={entry.image?.alternativeText || entry.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F0EDE8] to-[#E8E8E8] flex items-center justify-center font-serif text-xl font-semibold text-[#C5A059] border-2 border-white shadow-sm">
          {initial}
        </div>
      )}
      <div>
        <p className="text-lg leading-relaxed" style={{ fontFamily: serif }}>
          “{entry.message}”
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
