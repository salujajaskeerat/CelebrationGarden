import { ENTRIES_PER_PAGE_DEFAULT } from '../lib/scrapbook-template-constants';

type Invitation = {
  id: number;
  title: string;
  subtitle?: string;
  event_date?: string;
  type?: string;
  location?: string;
};

type Entry = {
  id: number;
  name: string;
  relation: string;
  message: string;
  image?: {
    url?: string;
    alternativeText?: string;
  };
};

type OrganizedData = {
  invitation: Invitation;
  filtered_entries: Entry[];
  categorized_entries: {
    friends: Entry[];
    closeRelatives: Entry[];
    extendedFamily: Entry[];
    colleagues: Entry[];
    others: Entry[];
  };
  highlights: {
    funny: Entry[];
    secret: Entry[];
  };
  pagination: {
    entriesPerPage: number;
    totalPages: number;
  };
};

export async function generateScrapbook(invitationSlug: string): Promise<OrganizedData> {
  const res = await fetch('/api/scrapbook/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invitationSlug }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to generate scrapbook: ${text}`);
  }

  const json = await res.json();
  return json.data as OrganizedData;
}

export function paginateEntries<T>(entries: T[], perPage = ENTRIES_PER_PAGE_DEFAULT) {
  const pages: T[][] = [];
  for (let i = 0; i < entries.length; i += perPage) {
    pages.push(entries.slice(i, i + perPage));
  }
  return { pages, totalPages: Math.max(1, pages.length), perPage };
}
