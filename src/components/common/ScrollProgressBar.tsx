import { useState, useEffect } from 'react'

export const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (windowHeight > 0) {
        const progress = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100))
        setScrollProgress(progress)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none bg-slate-100/30 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-150 ease-out shadow-xs"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

export default ScrollProgressBar
