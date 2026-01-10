import { fetchStrapi, strapiUrl } from './strapi';

export interface InvitationData {
  slug: string;
  type: 'Wedding' | 'Corporate' | 'Birthday' | 'Social';
  title: string;
  subtitle: string;
  date: string;
  time: string;
  description: string;
  heroImage: string;
}

// Strapi v5 Document Service API response format
interface StrapiInvitationItem {
    id: number;
  documentId: string;
      slug: string;
  event_date: string; // Strapi v5 uses event_date
      type: string;
      title: string;
  subtitle: string | null;
  time?: string;
  description?: string;
  hero_image?: {
    data?: {
      attributes?: {
            url: string;
          };
        } | null;
      };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string;
}

interface StrapiInvitationResponse {
  data: StrapiInvitationItem | StrapiInvitationItem[] | null;
  meta?: {};
}

export async function getInvitation(slug: string): Promise<InvitationData | null> {
  try {
    // Fetch invitation from Strapi by slug using filter query
    const response = await fetchStrapi<StrapiInvitationResponse>(
      `/invitation?filters[slug][$eq]=${encodeURIComponent(slug)}`
    );

    if (!response.data) {
      return null;
    }

    // Handle both single object and array responses
    let invitationItem: StrapiInvitationItem;
    
    if (Array.isArray(response.data)) {
      if (response.data.length === 0) {
        return null;
      }
      invitationItem = response.data[0];
    } else {
      invitationItem = response.data;
    }

    // Format date from ISO string to YYYY-MM-DD format
    const formatDate = (dateString: string): string => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
      } catch {
        return dateString; // Return as-is if parsing fails
      }
    };

    // Map Strapi v5 response to InvitationData format
    const invitationData: InvitationData = {
      slug: invitationItem.slug || slug,
      type: (invitationItem.type as InvitationData['type']) || 'Wedding',
      title: invitationItem.title || '',
      subtitle: invitationItem.subtitle || '',
      date: formatDate(invitationItem.event_date),
      time: invitationItem.time || '',
      description: invitationItem.description || '',
      heroImage: invitationItem.hero_image?.data?.attributes?.url 
        ? `${strapiUrl}${invitationItem.hero_image.data.attributes.url}`
        : '',
    };

    return invitationData;
  } catch (error) {
    // Handle errors
    if (error instanceof Error) {
      // Check for network/connection errors
      if (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('timeout') ||
        error.message.includes('Not found')
      ) {
        return null;
      }
    }

    // For any other errors, return null
    return null;
  }
}

