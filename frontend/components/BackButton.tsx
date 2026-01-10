'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()

  const navigateToHome = () => {
    router.push('/')
  }

  return (
    <button 
      onClick={navigateToHome}
      className="fixed top-6 left-6 z-[200] bg-white text-[#1a1a1a] border border-gray-200 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] hover:text-white transition-all shadow-xl"
    >
      ← Back to Site
    </button>
  )
}

