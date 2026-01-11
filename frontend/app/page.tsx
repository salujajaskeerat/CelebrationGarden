import type { Metadata } from 'next'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import VenueIntro from '../components/VenueIntro'
import Gallery from '../components/Gallery'
import PriceCalculator from '../components/PriceCalculator'
import FAQ from '../components/FAQ'
import Testimonials from '../components/Testimonials'
import InquiryForm from '../components/InquiryForm'
import Footer from '../components/Footer'
import HomePageClient from '../components/HomePageClient'
import { getHomePage } from '../lib/getHomePage'

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const homePageData = await getHomePage()
  
  return {
    title: homePageData?.metaTitle || 'Celebration Garden | Modern Secret Garden Venue',
    description: homePageData?.metaDescription || 'A premium, high-conversion landing page for Celebration Garden, featuring a Modern Secret Garden aesthetic with deep emerald, champagne gold, and soft ivory tones.',
  }
}

export default async function Home() {
  // Fetch home page data from Strapi
  const homePageData = await getHomePage()

  // Fallback values if Strapi data is not available
  const defaultData = {
    heroTitle: 'The Canvas for Your Forever Story',
    heroSubtitle: "A Sanctuary for Timeless Celebrations",
    heroDescription: "Where architectural grandeur meets untamed botanical beauty. Host your legacy in the heart of Emerald Valley.",
    heroImage: undefined,
    aboutText: "A bespoke setting for the modern romantic. Experience the pinnacle of luxury event design.",
    address: {
      line1: "122 Garden Lane",
      line2: "Emerald Valley, EV 90210",
      line3: "",
      country: "United Kingdom"
    },
    phoneNumber: "",
    whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '1234567890',
    metaTitle: 'Celebration Garden | Modern Secret Garden Venue',
    metaDescription: 'A premium, high-conversion landing page for Celebration Garden, featuring a Modern Secret Garden aesthetic with deep emerald, champagne gold, and soft ivory tones.',
    faqs: [],
    faqCategories: ['General', 'Venue', 'Catering', 'Booking'],
  }

  const data = homePageData || defaultData
  const whatsappMessage = "Hello! I'm interested in learning more about Celebration Garden Estates."

  return (
    <div className="relative min-h-screen selection:bg-[#064e3b] selection:text-white">
      {/* Client-side interactive elements */}
      <HomePageClient 
        whatsappPhone={data.whatsappPhone}
        whatsappMessage={whatsappMessage}
      />

      {/* Top Hook - Price Estimate */}
      <div className="bg-[#064e3b] py-2 z-[101] relative">
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center gap-4">
          <span className="text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] hidden sm:inline">Planning your celebration?</span>
          <a 
            href="#calculator" 
            className="text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-[#C5A059] transition-colors flex items-center gap-2"
          >
            Get a price estimate <span className="text-xs">→</span>
          </a>
        </div>
      </div>

      <Navbar />
      <main>
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
        <PriceCalculator />
        <FAQ 
          faqs={data.faqs}
          categories={data.faqCategories}
        />
        <Testimonials />
        <InquiryForm />
      </main>
      <Footer 
        aboutText={data.aboutText}
        address={data.address}
        phoneNumber={data.phoneNumber}
      />
    </div>
  )
}

