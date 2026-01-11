'use client'

import { useRouter } from 'next/navigation'
import WhatsAppButton from './WhatsAppButton'

interface HomePageClientProps {
  whatsappPhone: string
  whatsappMessage: string
}

export default function HomePageClient({ whatsappPhone, whatsappMessage }: HomePageClientProps) {
  const router = useRouter()

  const navigateToInvite = (slug: string) => {
    router.push(`/invitation/${slug}`)
  }

  return (
    <>
      {/* WhatsApp Button - Fixed on mobile */}
      <WhatsAppButton 
        phoneNumber={whatsappPhone}
        message={whatsappMessage}
      />
      
      {/* Demo Multi-Type Toggle */}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3 items-end group">
        <button 
          onClick={() => navigateToInvite('olivia-birthday-2025')}
          className="bg-white text-[#C5A059] px-6 py-4 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 translate-y-10 group-hover:translate-y-0 transition-all border border-gray-100 hover:bg-[#C5A059] hover:text-white"
        >
          Preview Birthday Invite
        </button>
        <button 
          onClick={() => navigateToInvite('sarah-michael-2025')}
          className="w-16 h-16 bg-[#064e3b] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          title="Preview Wedding Invitation"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </>
  )
}
