import { fetchStrapi, strapiUrl } from './strapi';
import { homePageFallback, type NavItem } from '../content/homePageFallback';

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
  // New editable content fields
  brandName: string;
  navItems: NavItem[];
  navCtaLabel: string;
  formTitle: string;
  formSubtitle: string;
  formFieldNameLabel: string;
  formFieldNamePlaceholder: string;
  formFieldEmailLabel: string;
  formFieldEmailPlaceholder: string;
  formFieldPhoneLabel: string;
  formFieldPhonePlaceholder: string;
  formFieldLawnLabel: string;
  formFieldDateLabel: string;
  formFieldGuestsLabel: string;
  formSubmitLabel: string;
  formSuccessMessage: string;
  footerText: string;
  instagramUrl: string;
  testimonialsSubtitle: string;
  testimonialsHeading: string;
  testimonialsFooterText: string;
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
  // New editable content fields
  brand_name?: string | null;
  nav_items?: NavItem[] | null;
  nav_cta_label?: string | null;
  form_title?: string | null;
  form_subtitle?: string | null;
  form_field_name_label?: string | null;
  form_field_name_placeholder?: string | null;
  form_field_email_label?: string | null;
  form_field_email_placeholder?: string | null;
  form_field_phone_label?: string | null;
  form_field_phone_placeholder?: string | null;
  form_field_lawn_label?: string | null;
  form_field_date_label?: string | null;
  form_field_guests_label?: string | null;
  form_submit_label?: string | null;
  form_success_message?: string | null;
  footer_text?: string | null;
  instagram_url?: string | null;
  testimonials_subtitle?: string | null;
  testimonials_heading?: string | null;
  testimonials_footer_text?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiHomePageResponse {
  data: StrapiHomePageItem | null;
  meta?: {};
}

export async function getHomePage(): Promise<HomePageData> {
  // Fetch home page from Strapi (Single Type endpoint) with hero_image populated
  // Note: FAQs are not in the schema, they come from fallback template
  let response: StrapiHomePageResponse;
  let homePageItem: StrapiHomePageItem | null = null;

  try {
    // Try fetching with hero_image populated
    try {
      response = await fetchStrapi<StrapiHomePageResponse>('/home-page?populate=hero_image');
      homePageItem = response.data;
    } catch (error) {
      console.warn('Populate failed, trying without populate:', error);
      // Fallback to no populate
      try {
        response = await fetchStrapi<StrapiHomePageResponse>('/home-page');
        homePageItem = response.data;
      } catch (noPopulateError) {
        console.warn('All fetch attempts failed, using fallback template. Error:', noPopulateError);
        // Return fallback data structure
        return {
            heroTitle: '',
            heroSubtitle: '',
            heroDescription: '',
            heroImage: '',
            aboutText: '',
            address: homePageFallback.address,
            phoneNumber: homePageFallback.phoneNumber,
            whatsappPhone: homePageFallback.whatsappPhone,
            metaTitle: '',
            metaDescription: '',
            brandName: homePageFallback.brandName,
            navItems: homePageFallback.navItems,
            navCtaLabel: homePageFallback.navCtaLabel,
            formTitle: homePageFallback.formTitle,
            formSubtitle: homePageFallback.formSubtitle,
            formFieldNameLabel: homePageFallback.formFieldNameLabel,
            formFieldNamePlaceholder: homePageFallback.formFieldNamePlaceholder,
            formFieldEmailLabel: homePageFallback.formFieldEmailLabel,
            formFieldEmailPlaceholder: homePageFallback.formFieldEmailPlaceholder,
            formFieldPhoneLabel: homePageFallback.formFieldPhoneLabel,
            formFieldPhonePlaceholder: homePageFallback.formFieldPhonePlaceholder,
            formFieldLawnLabel: homePageFallback.formFieldLawnLabel,
            formFieldDateLabel: homePageFallback.formFieldDateLabel,
            formFieldGuestsLabel: homePageFallback.formFieldGuestsLabel,
            formSubmitLabel: homePageFallback.formSubmitLabel,
            formSuccessMessage: homePageFallback.formSuccessMessage,
            footerText: homePageFallback.footerText,
            instagramUrl: homePageFallback.instagramUrl,
            testimonialsSubtitle: homePageFallback.testimonialsSubtitle,
            testimonialsHeading: homePageFallback.testimonialsHeading,
            testimonialsFooterText: homePageFallback.testimonialsFooterText,
            faqs: homePageFallback.faqs,
            faqCategories: homePageFallback.faqCategories,
          };
        }
      }

    if (!homePageItem) {
      console.warn('No home page data found, using fallback template');
      // Return fallback data structure with existing required fields as empty
      return {
        heroTitle: '',
        heroSubtitle: '',
        heroDescription: '',
        heroImage: '',
        aboutText: '',
        address: {
          line1: '',
          line2: '',
          line3: '',
          country: '',
        },
        phoneNumber: '',
        whatsappPhone: '',
        metaTitle: '',
        metaDescription: '',
        brandName: homePageFallback.brandName,
        navItems: homePageFallback.navItems,
        navCtaLabel: homePageFallback.navCtaLabel,
        formTitle: homePageFallback.formTitle,
        formSubtitle: homePageFallback.formSubtitle,
        formFieldNameLabel: homePageFallback.formFieldNameLabel,
        formFieldNamePlaceholder: homePageFallback.formFieldNamePlaceholder,
        formFieldEmailLabel: homePageFallback.formFieldEmailLabel,
        formFieldEmailPlaceholder: homePageFallback.formFieldEmailPlaceholder,
        formFieldPhoneLabel: homePageFallback.formFieldPhoneLabel,
        formFieldPhonePlaceholder: homePageFallback.formFieldPhonePlaceholder,
        formFieldLawnLabel: homePageFallback.formFieldLawnLabel,
        formFieldDateLabel: homePageFallback.formFieldDateLabel,
        formFieldGuestsLabel: homePageFallback.formFieldGuestsLabel,
        formSubmitLabel: homePageFallback.formSubmitLabel,
        formSuccessMessage: homePageFallback.formSuccessMessage,
        footerText: homePageFallback.footerText,
        instagramUrl: homePageFallback.instagramUrl,
        testimonialsSubtitle: homePageFallback.testimonialsSubtitle,
        testimonialsHeading: homePageFallback.testimonialsHeading,
        testimonialsFooterText: homePageFallback.testimonialsFooterText,
        faqs: homePageFallback.faqs,
        faqCategories: homePageFallback.faqCategories,
      };
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

    // Helper function to merge Strapi value with fallback
    // Uses fallback if Strapi value is null, undefined, or empty string
    const mergeField = <T>(strapiValue: T | null | undefined, fallbackValue: T): T => {
      if (strapiValue === null || strapiValue === undefined || strapiValue === '') {
        return fallbackValue;
      }
      return strapiValue;
    };

    // Parse nav_items JSON if it's a string, otherwise use as-is
    let navItems: NavItem[] = [];
    if (homePageItem.nav_items) {
      if (typeof homePageItem.nav_items === 'string') {
        try {
          navItems = JSON.parse(homePageItem.nav_items);
        } catch (e) {
          console.warn('Failed to parse nav_items JSON:', e);
          navItems = [];
        }
      } else if (Array.isArray(homePageItem.nav_items)) {
        navItems = homePageItem.nav_items;
      }
    }

    // Use fallback if navItems is empty
    if (navItems.length === 0) {
      navItems = homePageFallback.navItems;
    }

    // Map Strapi response to HomePageData format, merging with fallback
    const homePageData: HomePageData = {
      heroTitle: homePageItem.hero_title || '',
      heroSubtitle: homePageItem.hero_subtitle || '',
      heroDescription: homePageItem.hero_description || '',
      heroImage: extractImageUrl(homePageItem.hero_image, strapiUrl),
      aboutText: homePageItem.about_text || '',
      address: {
        line1: mergeField(homePageItem.address_line1, homePageFallback.address.line1),
        line2: mergeField(homePageItem.address_line2, homePageFallback.address.line2),
        line3: mergeField(homePageItem.address_line3, homePageFallback.address.line3),
        country: mergeField(homePageItem.address_country, homePageFallback.address.country),
      },
      phoneNumber: mergeField(homePageItem.phone_number, homePageFallback.phoneNumber),
      whatsappPhone: mergeField(homePageItem.whatsapp_phone, homePageFallback.whatsappPhone),
      metaTitle: homePageItem.meta_title || '',
      metaDescription: homePageItem.meta_description || '',
      faqs: Array.isArray(homePageItem.faqs) && homePageItem.faqs.length > 0
        ? homePageItem.faqs.map(faq => ({
            question: faq.question || '',
            answer: faq.answer || '',
            category: faq.category || 'General',
          }))
        : homePageFallback.faqs,
      // Extract unique categories from FAQs automatically
      faqCategories: Array.isArray(homePageItem.faqs) && homePageItem.faqs.length > 0
        ? Array.from(new Set(homePageItem.faqs.map(faq => faq.category).filter(Boolean)))
        : homePageFallback.faqCategories,
      // Merge new editable fields with fallback
      brandName: mergeField(homePageItem.brand_name, homePageFallback.brandName),
      navItems: navItems,
      navCtaLabel: mergeField(homePageItem.nav_cta_label, homePageFallback.navCtaLabel),
      formTitle: mergeField(homePageItem.form_title, homePageFallback.formTitle),
      formSubtitle: mergeField(homePageItem.form_subtitle, homePageFallback.formSubtitle),
      formFieldNameLabel: mergeField(homePageItem.form_field_name_label, homePageFallback.formFieldNameLabel),
      formFieldNamePlaceholder: mergeField(homePageItem.form_field_name_placeholder, homePageFallback.formFieldNamePlaceholder),
      formFieldEmailLabel: mergeField(homePageItem.form_field_email_label, homePageFallback.formFieldEmailLabel),
      formFieldEmailPlaceholder: mergeField(homePageItem.form_field_email_placeholder, homePageFallback.formFieldEmailPlaceholder),
      formFieldPhoneLabel: mergeField(homePageItem.form_field_phone_label, homePageFallback.formFieldPhoneLabel),
      formFieldPhonePlaceholder: mergeField(homePageItem.form_field_phone_placeholder, homePageFallback.formFieldPhonePlaceholder),
      formFieldLawnLabel: mergeField(homePageItem.form_field_lawn_label, homePageFallback.formFieldLawnLabel),
      formFieldDateLabel: mergeField(homePageItem.form_field_date_label, homePageFallback.formFieldDateLabel),
      formFieldGuestsLabel: mergeField(homePageItem.form_field_guests_label, homePageFallback.formFieldGuestsLabel),
      formSubmitLabel: mergeField(homePageItem.form_submit_label, homePageFallback.formSubmitLabel),
      formSuccessMessage: mergeField(homePageItem.form_success_message, homePageFallback.formSuccessMessage),
      footerText: mergeField(homePageItem.footer_text, homePageFallback.footerText),
      instagramUrl: mergeField(homePageItem.instagram_url, homePageFallback.instagramUrl),
      testimonialsSubtitle: mergeField(homePageItem.testimonials_subtitle, homePageFallback.testimonialsSubtitle),
      testimonialsHeading: mergeField(homePageItem.testimonials_heading, homePageFallback.testimonialsHeading),
      testimonialsFooterText: mergeField(homePageItem.testimonials_footer_text, homePageFallback.testimonialsFooterText),
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
        console.warn('Network error, using fallback template');
        return {
          heroTitle: '',
          heroSubtitle: '',
          heroDescription: '',
          heroImage: '',
          aboutText: '',
          address: {
            line1: '',
            line2: '',
            line3: '',
            country: '',
          },
          phoneNumber: '',
          whatsappPhone: '',
          metaTitle: '',
          metaDescription: '',
          brandName: homePageFallback.brandName,
          navItems: homePageFallback.navItems,
          navCtaLabel: homePageFallback.navCtaLabel,
          formTitle: homePageFallback.formTitle,
          formSubtitle: homePageFallback.formSubtitle,
          formFieldNameLabel: homePageFallback.formFieldNameLabel,
          formFieldNamePlaceholder: homePageFallback.formFieldNamePlaceholder,
          formFieldEmailLabel: homePageFallback.formFieldEmailLabel,
          formFieldEmailPlaceholder: homePageFallback.formFieldEmailPlaceholder,
          formFieldPhoneLabel: homePageFallback.formFieldPhoneLabel,
          formFieldPhonePlaceholder: homePageFallback.formFieldPhonePlaceholder,
          formFieldLawnLabel: homePageFallback.formFieldLawnLabel,
          formFieldDateLabel: homePageFallback.formFieldDateLabel,
          formFieldGuestsLabel: homePageFallback.formFieldGuestsLabel,
          formSubmitLabel: homePageFallback.formSubmitLabel,
          formSuccessMessage: homePageFallback.formSuccessMessage,
          footerText: homePageFallback.footerText,
          instagramUrl: homePageFallback.instagramUrl,
          testimonialsSubtitle: homePageFallback.testimonialsSubtitle,
          testimonialsHeading: homePageFallback.testimonialsHeading,
          testimonialsFooterText: homePageFallback.testimonialsFooterText,
          faqs: homePageFallback.faqs,
          faqCategories: homePageFallback.faqCategories,
        };
      }
    }

    // For any other errors, return fallback
    console.warn('Unexpected error, using fallback template');
    return {
      heroTitle: '',
      heroSubtitle: '',
      heroDescription: '',
      heroImage: '',
      aboutText: '',
      address: {
        line1: '',
        line2: '',
        line3: '',
        country: '',
      },
      phoneNumber: '',
      whatsappPhone: '',
      metaTitle: '',
      metaDescription: '',
      brandName: homePageFallback.brandName,
      navItems: homePageFallback.navItems,
      navCtaLabel: homePageFallback.navCtaLabel,
      formTitle: homePageFallback.formTitle,
      formSubtitle: homePageFallback.formSubtitle,
      formFieldNameLabel: homePageFallback.formFieldNameLabel,
      formFieldNamePlaceholder: homePageFallback.formFieldNamePlaceholder,
      formFieldEmailLabel: homePageFallback.formFieldEmailLabel,
      formFieldEmailPlaceholder: homePageFallback.formFieldEmailPlaceholder,
      formFieldPhoneLabel: homePageFallback.formFieldPhoneLabel,
      formFieldPhonePlaceholder: homePageFallback.formFieldPhonePlaceholder,
      formFieldLawnLabel: homePageFallback.formFieldLawnLabel,
      formFieldDateLabel: homePageFallback.formFieldDateLabel,
      formFieldGuestsLabel: homePageFallback.formFieldGuestsLabel,
      formSubmitLabel: homePageFallback.formSubmitLabel,
      formSuccessMessage: homePageFallback.formSuccessMessage,
      footerText: homePageFallback.footerText,
      instagramUrl: homePageFallback.instagramUrl,
      testimonialsSubtitle: homePageFallback.testimonialsSubtitle,
      testimonialsHeading: homePageFallback.testimonialsHeading,
      testimonialsFooterText: homePageFallback.testimonialsFooterText,
      faqs: homePageFallback.faqs,
      faqCategories: homePageFallback.faqCategories,
    };
  }
}
