'use client'

import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollableHeight = documentHeight - windowHeight
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
      setScrollProgress(progress)
    }

    // Initial calculation
    updateScrollProgress()

    // Update on scroll
    window.addEventListener('scroll', updateScrollProgress, { passive: true })
    window.addEventListener('resize', updateScrollProgress, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateScrollProgress)
      window.removeEventListener('resize', updateScrollProgress)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[99] h-1.5 bg-[#064e3b]/10 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[#064e3b] via-[#C5A059] to-[#064e3b] transition-all duration-150 ease-out shadow-lg shadow-[#C5A059]/30 relative overflow-hidden"
        style={{ width: `${scrollProgress}%` }}
      >
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  )
}
