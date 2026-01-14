import { NextRequest, NextResponse } from 'next/server';
import { strapiUrl } from '../../../../lib/strapi';

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
  image_url?: string;
};

type ModerationResult = {
  filtered_entries: Entry[];
  categorized_entries: {
    friends: Entry[];
    closeRelatives: Entry[];
    extendedFamily: Entry[];
    colleagues: Entry[];
    others: Entry[];
  };
};

type HighlightsResult = {
  funny: Entry[];
  secret: Entry[];
};

type OrderingResult = {
  [key: string]: {
    ordered_ids: number[];
  };
};

type OrganizedResult = {
  invitation: Invitation;
  filtered_entries: Entry[];
  categorized_entries: {
    friends: {
      ordered_ids: number[];
      entries: Entry[];
    };
    closeRelatives: {
      ordered_ids: number[];
      entries: Entry[];
    };
    extendedFamily: {
      ordered_ids: number[];
      entries: Entry[];
    };
    colleagues: {
      ordered_ids: number[];
      entries: Entry[];
    };
    others: {
      ordered_ids: number[];
      entries: Entry[];
    };
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

const ENTRIES_PER_PAGE = 4;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invitationSlug: string | undefined = body?.invitationSlug;
    const invitationId: number | undefined = body?.invitationId;

    if (!invitationSlug && !invitationId) {
      return NextResponse.json(
        { error: 'invitationSlug or invitationId is required' },
        { status: 400 }
      );
    }

    // Fetch invitation
    const invitation = await fetchInvitation(invitationSlug, invitationId);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Fetch entries
    const entries = await fetchEntries(invitation.id);

    // Organize content (LLM with fallback)
    const organized = await organizeScrapbook(invitation, entries);

    return NextResponse.json({ success: true, data: organized });
  } catch (error) {
    console.error('Error generating scrapbook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function fetchInvitation(slug?: string, id?: number): Promise<Invitation | null> {
  try {
    if (id) {
      const res = await fetch(`${strapiUrl}/api/invitations/${id}?populate=*`);
      const json = await res.json();
      return json?.data
        ? {
            id: json.data.id,
            title: json.data.title,
            subtitle: json.data.subtitle,
            event_date: json.data.event_date,
            type: json.data.type,
            location: json.data.location,
          }
        : null;
    }

    if (slug) {
      const res = await fetch(
        `${strapiUrl}/api/invitations?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`
      );
      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data[0] : json?.data;
      return data
        ? {
            id: data.id,
            title: data.title,
            subtitle: data.subtitle,
            event_date: data.event_date,
            type: data.type,
            location: data.location,
          }
        : null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching invitation:', error);
    throw error;
  }
}

async function fetchEntries(invitationId: number): Promise<Entry[]> {
  try {
    const res = await fetch(
      `${strapiUrl}/api/scrapbook-entries?filters[invitation][id][$eq]=${invitationId}&populate=image`
    );
    const json = await res.json();
    const entries = Array.isArray(json?.data) ? json.data : json?.data ? [json.data] : [];

    return entries.map((entry: any) => {
      // Get image URL from image field first, then fall back to image_url field
      let imageUrl: string | undefined;
      let alternativeText: string | undefined;

      if (entry.image) {
        // Handle both single image object and array
        const img = Array.isArray(entry.image) ? entry.image[0] : entry.image;
        // Strapi returns relative URLs, need to make them absolute
        const rawUrl = img?.url || img?.formats?.thumbnail?.url || img?.formats?.small?.url;
        if (rawUrl) {
          imageUrl = rawUrl.startsWith('http') ? rawUrl : `${strapiUrl}${rawUrl}`;
        }
        alternativeText = img?.alternativeText;
      }

      // Fall back to image_url field if image is not available
      if (!imageUrl && entry.image_url) {
        imageUrl = entry.image_url;
      }

      return {
        id: entry.id,
        name: entry.name,
        relation: entry.relation,
        message: entry.message,
        image: imageUrl
          ? {
              url: imageUrl,
              alternativeText: alternativeText || entry.name,
            }
          : undefined,
        image_url: entry.image_url, // Keep for fallback
      };
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }
}

async function organizeScrapbook(invitation: Invitation, entries: Entry[]): Promise<OrganizedResult> {
  // Try parallel LLM calls for speed optimization
  const llmResult = await tryLLMOrganization(invitation, entries);
  
  // Use LLM results if available, otherwise fallback to heuristic
  const filtered = llmResult?.filtered_entries || filterAbusive(entries);
  const categorized = llmResult?.categorized_entries || categorizeEntries(filtered);
  const highlights = llmResult?.highlights || pickHighlights(filtered);
  const ordering = llmResult?.ordering || null;

  // Apply ordering to categorized entries
  const orderedCategorized = applyOrdering(categorized, ordering);

  const totalEntries =
    categorized.friends.length +
    categorized.closeRelatives.length +
    categorized.extendedFamily.length +
    categorized.colleagues.length +
    categorized.others.length;

  return {
    invitation,
    filtered_entries: filtered,
    categorized_entries: orderedCategorized,
    highlights,
    pagination: {
      entriesPerPage: ENTRIES_PER_PAGE,
      totalPages: Math.max(1, Math.ceil(totalEntries / ENTRIES_PER_PAGE)),
    },
  };
}

function applyOrdering(
  categorized: {
    friends: Entry[];
    closeRelatives: Entry[];
    extendedFamily: Entry[];
    colleagues: Entry[];
    others: Entry[];
  },
  ordering: OrderingResult | null
) {
  const categories = ['friends', 'closeRelatives', 'extendedFamily', 'colleagues', 'others'] as const;
  
  const result: OrganizedResult['categorized_entries'] = {
    friends: { ordered_ids: [], entries: [] },
    closeRelatives: { ordered_ids: [], entries: [] },
    extendedFamily: { ordered_ids: [], entries: [] },
    colleagues: { ordered_ids: [], entries: [] },
    others: { ordered_ids: [], entries: [] },
  };

  categories.forEach((category) => {
    const entries = categorized[category];
    if (ordering && ordering[category]?.ordered_ids) {
      // Use LLM ordering
      const orderedIds = ordering[category].ordered_ids;
      const entryMap = new Map(entries.map((e) => [e.id, e]));
      const orderedEntries = orderedIds
        .map((id) => entryMap.get(id))
        .filter((e): e is Entry => e !== undefined);
      
      // Add any entries not in the ordered list
      const remaining = entries.filter((e) => !orderedIds.includes(e.id));
      orderedEntries.push(...remaining);
      
      result[category] = {
        ordered_ids: orderedEntries.map((e) => e.id),
        entries: orderedEntries,
      };
    } else {
      // Use original order
      result[category] = {
        ordered_ids: entries.map((e) => e.id),
        entries: entries,
      };
    }
  });

  return result;
}

function filterAbusive(entries: Entry[]): Entry[] {
  const blocked = ['abuse', 'hate', 'offensive']; // simple client-side filter
  return entries.filter(
    (entry) =>
      !blocked.some((word) => entry.message?.toLowerCase().includes(word)) &&
      entry.message &&
      entry.name &&
      entry.relation
  );
}

function categorizeEntries(entries: Entry[]) {
  const result = {
    friends: [] as Entry[],
    closeRelatives: [] as Entry[],
    extendedFamily: [] as Entry[],
    colleagues: [] as Entry[],
    others: [] as Entry[],
  };

  entries.forEach((entry) => {
    const rel = entry.relation?.toLowerCase() || '';
    if (rel.includes('friend') || rel.includes('best man') || rel.includes('maid')) {
      result.friends.push(entry);
    } else if (
      rel.includes('mom') ||
      rel.includes('dad') ||
      rel.includes('mother') ||
      rel.includes('father') ||
      rel.includes('grand') ||
      rel.includes('parent')
    ) {
      result.closeRelatives.push(entry);
    } else if (rel.includes('uncle') || rel.includes('aunt') || rel.includes('cousin')) {
      result.extendedFamily.push(entry);
    } else if (rel.includes('colleague') || rel.includes('cowork') || rel.includes('office')) {
      result.colleagues.push(entry);
    } else {
      result.others.push(entry);
    }
  });

  return result;
}

function pickHighlights(entries: Entry[]) {
  // Simple heuristic: longest messages for "secret", medium for "funny"
  const sorted = [...entries].sort((a, b) => (b.message?.length || 0) - (a.message?.length || 0));
  return {
    funny: sorted.slice(0, 3),
    secret: sorted.slice(3, 6),
  };
}

async function tryLLMOrganization(invitation: Invitation, entries: Entry[]) {
  const provider = process.env.LLM_PROVIDER || 'gemini';

  try {
    // Call 1 & 2 run in parallel for speed
    const [moderationResult, highlightsResult] = await Promise.all([
      moderateAndCategorize(invitation, entries, provider),
      extractHighlights(invitation, entries, provider),
    ]);

    // Call 3 runs after Call 1 completes (needs categorized entries)
    const orderingResult = moderationResult
      ? await orderEntries(moderationResult.categorized_entries, provider)
      : null;

    return {
      filtered_entries: moderationResult?.filtered_entries || null,
      categorized_entries: moderationResult?.categorized_entries || null,
      highlights: highlightsResult || null,
      ordering: orderingResult || null,
    };
  } catch (error) {
    console.warn('LLM organization failed, falling back to heuristic:', error);
    return null;
  }
}

async function moderateAndCategorize(
  invitation: Invitation,
  entries: Entry[],
  provider: string
): Promise<ModerationResult | null> {
  if (provider === 'gemini' && process.env.GOOGLE_AI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = buildModerationPrompt(invitation, entries);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text) as ModerationResult | null;
      return parsed;
    } catch (error) {
      console.warn('Gemini moderation failed:', error);
    }
  }

  if (provider === 'groq' && process.env.GROQ_API_KEY) {
    try {
      const { Groq } = await import('groq-sdk');
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = buildModerationPrompt(invitation, entries);
      const completion = await client.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });
      const text = completion.choices?.[0]?.message?.content || '';
      const parsed = safeParseJSON(text) as ModerationResult | null;
      return parsed;
    } catch (error) {
      console.warn('Groq moderation failed:', error);
    }
  }

  return null;
}

async function extractHighlights(
  invitation: Invitation,
  entries: Entry[],
  provider: string
): Promise<HighlightsResult | null> {
  if (provider === 'gemini' && process.env.GOOGLE_AI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = buildHighlightsPrompt(invitation, entries);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text) as HighlightsResult | null;
      return parsed;
    } catch (error) {
      console.warn('Gemini highlights failed:', error);
    }
  }

  if (provider === 'groq' && process.env.GROQ_API_KEY) {
    try {
      const { Groq } = await import('groq-sdk');
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = buildHighlightsPrompt(invitation, entries);
      const completion = await client.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });
      const text = completion.choices?.[0]?.message?.content || '';
      const parsed = safeParseJSON(text) as HighlightsResult | null;
      return parsed;
    } catch (error) {
      console.warn('Groq highlights failed:', error);
    }
  }

  return null;
}

async function orderEntries(
  categorized: ModerationResult['categorized_entries'],
  provider: string
): Promise<OrderingResult | null> {
  if (provider === 'gemini' && process.env.GOOGLE_AI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = buildOrderingPrompt(categorized);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text) as OrderingResult | null;
      return parsed;
    } catch (error) {
      console.warn('Gemini ordering failed:', error);
    }
  }

  if (provider === 'groq' && process.env.GROQ_API_KEY) {
    try {
      const { Groq } = await import('groq-sdk');
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const prompt = buildOrderingPrompt(categorized);
      const completion = await client.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });
      const text = completion.choices?.[0]?.message?.content || '';
      const parsed = safeParseJSON(text) as OrderingResult | null;
      return parsed;
    } catch (error) {
      console.warn('Groq ordering failed:', error);
    }
  }

  return null;
}

function buildModerationPrompt(invitation: Invitation, entries: Entry[]) {
  return `You are moderating and categorizing scrapbook entries for a wedding/event scrapbook. Perform BOTH tasks:

1. CONTENT MODERATION: Filter out any entries with abusive, inappropriate, hateful, or offensive content. Only include appropriate, positive messages.

2. RELATION CATEGORIZATION: Organize the filtered entries into categories based on their relation field. Use the invitation context to better understand relationships:
   - friends: All friend entries (Bride's Friend, Groom's Friend, Mutual Friend, Best Man, Maid of Honor, etc.)
   - closeRelatives: Immediate family (Mom, Dad, Mother, Father, Grandmother, Grandfather - for both Bride and Groom)
   - extendedFamily: Extended family (Uncle, Aunt, Cousin, etc.)
   - colleagues: Work-related (Colleague, Coworker, etc.)
   - others: Everything else

IMPORTANT RULES:
- Do NOT modify or rewrite any messages - use them exactly as provided
- Do NOT change entry IDs, names, relations, or any other fields
- Return ONLY valid JSON, no explanations or markdown
- Include ALL appropriate entries in categorized_entries (don't skip any)
- Use invitation context to better categorize relations (e.g., "Mom" could be Bride's or Groom's mom based on event title)

Invitation context: ${JSON.stringify(invitation)}
All entries: ${JSON.stringify(entries)}

Return JSON in this exact format:
{
  "filtered_entries": [Entry, Entry, ...],
  "categorized_entries": {
    "friends": [Entry, Entry, ...],
    "closeRelatives": [Entry, Entry, ...],
    "extendedFamily": [Entry, Entry, ...],
    "colleagues": [Entry, Entry, ...],
    "others": [Entry, Entry, ...]
  }
}`;
}

function buildHighlightsPrompt(invitation: Invitation, entries: Entry[]) {
  return `You are extracting highlights from scrapbook entries for a wedding/event scrapbook.

Identify the best entries for highlights:
   - funny: Top 3-5 entries with humorous, lighthearted, or funny messages (appropriate humor only)
   - secret: Top 3-5 entries with heartwarming, revealing, or touching messages (positive and meaningful)

IMPORTANT RULES:
- Do NOT modify or rewrite any messages - use them exactly as provided
- Do NOT change entry IDs, names, relations, or any other fields
- Return ONLY valid JSON, no explanations or markdown
- Select entries from the provided list only

Invitation context: ${JSON.stringify(invitation)}
All entries: ${JSON.stringify(entries)}

Return JSON in this exact format:
{
  "funny": [Entry, Entry, ...],
  "secret": [Entry, Entry, ...]
}`;
}

function buildOrderingPrompt(categorized: ModerationResult['categorized_entries']) {
  return `You are ordering scrapbook entries for optimal visual balance on a page.

For each category, order entries to create visual rhythm:
   - Alternate between entries with images and without images
   - Vary message lengths (mix short, medium, long messages - avoid clustering all long messages together)
   - Create a natural visual flow across the page
   - Consider visual weight: entries with images and long messages have more visual weight

IMPORTANT RULES:
- Return ONLY valid JSON, no explanations or markdown
- Return an ordered array of entry IDs for each category
- Include ALL entry IDs from each category (don't skip any)
- Order should optimize for visual balance and variety

Categorized entries: ${JSON.stringify(categorized)}

Return JSON in this exact format:
{
  "friends": {
    "ordered_ids": [3, 7, 2, 9, 1, ...]
  },
  "closeRelatives": {
    "ordered_ids": [5, 12, 8, ...]
  },
  "extendedFamily": {
    "ordered_ids": [10, 15, 11, ...]
  },
  "colleagues": {
    "ordered_ids": [20, 18, 22, ...]
  },
  "others": {
    "ordered_ids": [25, 27, 24, ...]
  }
}`;
}

function safeParseJSON(text: string | undefined) {
  if (!text) return null;
  try {
    // Extract JSON block if wrapped
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
}
