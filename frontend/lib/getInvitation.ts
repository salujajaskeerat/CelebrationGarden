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
    // First, try to fetch all invitations to verify endpoint works
    // This helps debug if it's a permissions or endpoint issue
    let allInvitations: StrapiInvitationItem[] = [];
    const baseEndpoint = '/invitations'; // Strapi v5 uses plural for collectionType
    
    try {
      const allResponse = await fetchStrapi<StrapiInvitationResponse>(baseEndpoint);
      if (Array.isArray(allResponse.data)) {
        allInvitations = allResponse.data;
      } else if (allResponse.data) {
        allInvitations = [allResponse.data];
      }
      console.log(`Found ${allInvitations.length} invitation(s) in database`);
      if (allInvitations.length > 0) {
        console.log('Available slugs:', allInvitations.map(i => i.slug).join(', '));
      }
    } catch (allError) {
      console.error('Error fetching all invitations:', allError);
      // Continue with filtered query
    }

    // Fetch invitation from Strapi by slug using filter query, populate hero_image
    const endpoint = `${baseEndpoint}?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=hero_image`;
    
    let response: StrapiInvitationResponse;
    let invitationItem: StrapiInvitationItem | null = null;

    // Try fetching with simple populate first
    try {
      response = await fetchStrapi<StrapiInvitationResponse>(endpoint);
      if (Array.isArray(response.data)) {
        invitationItem = response.data[0] || null;
      } else {
        invitationItem = response.data;
      }
    } catch (error) {
      console.warn('Simple populate failed, trying nested populate:', error);
      // Fallback to nested populate
      try {
        response = await fetchStrapi<StrapiInvitationResponse>(
          `${baseEndpoint}?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[hero_image]=*`
        );
        if (Array.isArray(response.data)) {
          invitationItem = response.data[0] || null;
        } else {
          invitationItem = response.data;
        }
      } catch (nestedError) {
        console.warn('Nested populate failed, trying without populate:', nestedError);
        // Fallback to no populate
        try {
          response = await fetchStrapi<StrapiInvitationResponse>(
            `${baseEndpoint}?filters[slug][$eq]=${encodeURIComponent(slug)}`
          );
          if (Array.isArray(response.data)) {
            invitationItem = response.data[0] || null;
          } else {
            invitationItem = response.data;
          }
        } catch (noPopulateError) {
          console.error('All fetch attempts failed. Last error:', noPopulateError);
          // If we have all invitations, try to find by slug manually
          if (allInvitations.length > 0) {
            invitationItem = allInvitations.find(inv => inv.slug === slug) || null;
            if (invitationItem) {
              console.log('Found invitation by searching all invitations');
            } else {
              console.error(`Invitation with slug "${slug}" not found. Available slugs: ${allInvitations.map(i => `"${i.slug}"`).join(', ')}`);
            }
          }
        }
      }
    }

    if (!invitationItem) {
      console.warn(`No invitation found with slug: ${slug}`);
      return null;
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

    // If hero_image is still missing, try to fetch it separately
    if (!invitationItem.hero_image && invitationItem.id) {
      console.log(`Hero image not found in initial fetch for invitation ID ${invitationItem.id}, fetching separately.`);
      try {
        const mediaResponse = await fetchStrapi<{ data: { attributes: { url: string } } }>(
          `/upload/files?filters[related.id][$eq]=${invitationItem.id}&filters[related.field][$eq]=hero_image`
        );
        if (mediaResponse.data && Array.isArray(mediaResponse.data) && mediaResponse.data.length > 0) {
          invitationItem.hero_image = { data: { attributes: { url: mediaResponse.data[0].attributes.url } } };
        }
      } catch (mediaError) {
        console.warn('Could not fetch hero image separately:', mediaError);
      }
    }

    // Helper function to extract image URL
    function extractImageUrl(heroImage: any, strapiBaseUrl: string): string {
      if (!heroImage) return '';

      let url = '';

      // Case 1: hero_image.data.attributes.url (most common for collectionType media)
      if (heroImage.data && heroImage.data.attributes?.url) {
        url = heroImage.data.attributes.url;
      }
      // Case 2: hero_image.attributes.url (sometimes for singleType media or direct populate)
      else if (heroImage.attributes?.url) {
        url = heroImage.attributes.url;
      }
      // Case 3: hero_image.url (less common, but possible if directly populated)
      else if (heroImage.url) {
        url = heroImage.url;
      }

      if (!url) return '';

      // Normalize URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url; // Already a full URL
      } else if (url.includes('cloudinary.com')) {
        // Ensure HTTPS for Cloudinary URLs that might be relative or protocol-agnostic
        return url.startsWith('//') ? `https:${url}` : `https://${url.replace(/^\/+/, '')}`;
      } else {
        // Assume it's a relative Strapi URL
        return `${strapiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`;
      }
    }

    // Map Strapi v5 response to InvitationData format
    const invitationData: InvitationData = {
      slug: invitationItem.slug || slug,
      type: (invitationItem.type as InvitationData['type']) || 'Wedding',
      title: invitationItem.title || '',
      subtitle: invitationItem.subtitle || '',
      date: formatDate(invitationItem.event_date),
      time: invitationItem.time || '',
      description: invitationItem.description || '',
      heroImage: extractImageUrl(invitationItem.hero_image, strapiUrl),
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

