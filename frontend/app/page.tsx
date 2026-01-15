import type { Metadata } from 'next'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import VenueIntro from '../components/VenueIntro'
import Gallery from '../components/Gallery'
// import PriceCalculator from '../components/PriceCalculator' // Commented out - calculator not shown for now
import FAQ from '../components/FAQ'
import Testimonials from '../components/Testimonials'
import InquiryForm from '../components/InquiryForm'
import Footer from '../components/Footer'
import HomePageClient from '../components/HomePageClient'
import ScrollProgress from '../components/ScrollProgress'
import { getHomePage } from '../lib/getHomePage'

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const homePageData = await getHomePage()
  
  return {
    title: homePageData.metaTitle || 'Celebration Garden | Modern Secret Garden Venue',
    description: homePageData.metaDescription || 'A premium, high-conversion landing page for Celebration Garden, featuring a Modern Secret Garden aesthetic with deep emerald, champagne gold, and soft ivory tones.',
  }
}

export default async function Home() {
  // Fetch home page data from Strapi (now always returns data, with fallback if needed)
  const data = await getHomePage()
  const whatsappMessage = "Hello! I'm interested in learning more about Celebration Garden Estates."

  return (
    <div className="relative min-h-screen selection:bg-[#064e3b] selection:text-white">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />
      
      {/* Client-side interactive elements */}
      <HomePageClient 
        whatsappPhone={data.whatsappPhone}
        whatsappMessage={whatsappMessage}
        instagramUrl={data.instagramUrl}
      />

      {/* Top Hook - Price Estimate - Commented out - calculator not shown for now */}
      {/* <div className="bg-[#064e3b] py-2 z-[101] relative">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center gap-4">
          <span className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] hidden sm:inline">Planning your celebration?</span>
          <a 
            href="#calculator" 
            className="text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-[#C5A059] transition-colors flex items-center gap-2"
          >
            Get a price estimate <span className="text-xs">→</span>
          </a>
        </div>
      </div> */}

      <Navbar 
        brandName={data.brandName}
        navItems={data.navItems}
        navCtaLabel={data.navCtaLabel}
      />
      <main id="main-content" tabIndex={-1}>
        <Hero 
          heroTitle={data.heroTitle}
          heroSubtitle={data.heroSubtitle}
          heroDescription={data.heroDescription}
          heroImage={data.heroImage}
        />
        <VenueIntro 
          aboutText={data.aboutText}
        />
        <Gallery />
        <Testimonials 
          testimonialsSubtitle={data.testimonialsSubtitle}
          testimonialsHeading={data.testimonialsHeading}
          testimonialsFooterText={data.testimonialsFooterText}
        />
        <FAQ 
          faqs={data.faqs}
          categories={data.faqCategories}
        />
        <InquiryForm 
          formTitle={data.formTitle}
          formSubtitle={data.formSubtitle}
          formFieldNameLabel={data.formFieldNameLabel}
          formFieldNamePlaceholder={data.formFieldNamePlaceholder}
          formFieldEmailLabel={data.formFieldEmailLabel}
          formFieldEmailPlaceholder={data.formFieldEmailPlaceholder}
          formFieldPhoneLabel={data.formFieldPhoneLabel}
          formFieldPhonePlaceholder={data.formFieldPhonePlaceholder}
          formFieldLawnLabel={data.formFieldLawnLabel}
          formFieldDateLabel={data.formFieldDateLabel}
          formFieldGuestsLabel={data.formFieldGuestsLabel}
          formSubmitLabel={data.formSubmitLabel}
          formSuccessMessage={data.formSuccessMessage}
        />
      </main>
      <Footer 
        brandName={data.brandName}
        aboutText={data.aboutText}
        address={data.address}
        phoneNumber={data.phoneNumber}
        footerText={data.footerText}
        instagramUrl={data.instagramUrl}
      />
    </div>
  )
}

