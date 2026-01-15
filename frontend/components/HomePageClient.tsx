'use client'

import { useEffect } from 'react'
import WhatsAppButton from './WhatsAppButton'
import InstagramButton from './InstagramButton'

interface HomePageClientProps {
  whatsappPhone: string
  whatsappMessage: string
  instagramUrl?: string
}

export default function HomePageClient({ whatsappPhone, whatsappMessage, instagramUrl }: HomePageClientProps) {
  // Smooth scroll handler for anchor links with offset
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href^="#"]') as HTMLAnchorElement
      
      if (link && link.hash) {
        e.preventDefault()
        const targetId = link.hash.substring(1)
        const targetElement = document.getElementById(targetId)
        
        if (targetElement) {
          const navbarHeight = window.innerWidth >= 1024 ? 100 : 80
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20
          
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
          })
        }
      }
    }

    document.addEventListener('click', handleSmoothScroll)
    return () => document.removeEventListener('click', handleSmoothScroll)
  }, [])

  return (
    <>
      {/* WhatsApp Button - Fixed on mobile */}
      <WhatsAppButton 
        phoneNumber={whatsappPhone}
        message={whatsappMessage}
      />
      
      {/* Instagram Button - Fixed next to WhatsApp */}
      {instagramUrl && (
        <InstagramButton 
          instagramUrl={instagramUrl}
        />
      )}
    </>
  )
}
