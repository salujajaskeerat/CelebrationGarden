import { fetchStrapi, strapiUrl } from './strapi';

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface HomePageData {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  aboutText: string;
  address: {
    line1: string;
    line2: string;
    line3: string;
    country: string;
  };
  phoneNumber: string;
  whatsappPhone: string;
  metaTitle: string;
  metaDescription: string;
  faqs: FAQItem[];
  faqCategories: string[];
}

// Strapi v5 Single Type response format
interface StrapiHomePageItem {
  id: number;
  documentId: string;
  hero_title: string;
  hero_subtitle: string | null;
  hero_description: string | null;
  hero_image?: {
    data?: {
      attributes?: {
        url: string;
      };
    } | null;
  };
  about_text: string;
  address_line1: string;
  address_line2: string | null;
  address_line3: string | null;
  address_country: string;
  phone_number: string;
  whatsapp_phone: string;
  meta_title: string;
  meta_description: string;
  faqs?: Array<{
    id?: number;
    question: string;
    answer: string;
    category: string;
  }> | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiHomePageResponse {
  data: StrapiHomePageItem | null;
  meta?: {};
}

export async function getHomePage(): Promise<HomePageData | null> {
  try {
    // Fetch home page from Strapi (Single Type endpoint) with FAQs populated
    const endpoint = '/home-page?populate[hero_image]=*&populate[faqs]=*';
    
    let response: StrapiHomePageResponse;
    let homePageItem: StrapiHomePageItem | null = null;

    // Try fetching with nested populate first (includes FAQs)
    try {
      response = await fetchStrapi<StrapiHomePageResponse>(endpoint);
      homePageItem = response.data;
    } catch (error) {
      console.warn('Nested populate failed, trying simple populate:', error);
      // Fallback to simple populate
      try {
        response = await fetchStrapi<StrapiHomePageResponse>(
          '/home-page?populate=hero_image&populate=faqs'
        );
        homePageItem = response.data;
      } catch (simpleError) {
        console.warn('Simple populate failed, trying without populate:', simpleError);
        // Fallback to no populate
        try {
          response = await fetchStrapi<StrapiHomePageResponse>('/home-page');
          homePageItem = response.data;
        } catch (noPopulateError) {
          console.error('All fetch attempts failed. Last error:', noPopulateError);
          return null;
        }
      }
    }

    if (!homePageItem) {
      console.warn('No home page data found');
      return null;
    }

    // Helper function to extract image URL
    function extractImageUrl(heroImage: any, strapiBaseUrl: string): string {
      if (!heroImage) return '';

      let url = '';

      // Case 1: hero_image.data.attributes.url (most common for media)
      if (heroImage.data && heroImage.data.attributes?.url) {
        url = heroImage.data.attributes.url;
      }
      // Case 2: hero_image.attributes.url (sometimes for direct populate)
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

    // Map Strapi response to HomePageData format
    const homePageData: HomePageData = {
      heroTitle: homePageItem.hero_title || '',
      heroSubtitle: homePageItem.hero_subtitle || '',
      heroDescription: homePageItem.hero_description || '',
      heroImage: extractImageUrl(homePageItem.hero_image, strapiUrl),
      aboutText: homePageItem.about_text || '',
      address: {
        line1: homePageItem.address_line1 || '',
        line2: homePageItem.address_line2 || '',
        line3: homePageItem.address_line3 || '',
        country: homePageItem.address_country || '',
      },
      phoneNumber: homePageItem.phone_number || '',
      whatsappPhone: homePageItem.whatsapp_phone || '',
      metaTitle: homePageItem.meta_title || '',
      metaDescription: homePageItem.meta_description || '',
      faqs: Array.isArray(homePageItem.faqs) 
        ? homePageItem.faqs.map(faq => ({
            question: faq.question || '',
            answer: faq.answer || '',
            category: faq.category || 'General',
          }))
        : [],
      // Extract unique categories from FAQs automatically
      faqCategories: Array.isArray(homePageItem.faqs) && homePageItem.faqs.length > 0
        ? Array.from(new Set(homePageItem.faqs.map(faq => faq.category).filter(Boolean)))
        : [],
    };

    return homePageData;
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
