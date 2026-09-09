import React, { useRef, useState } from 'react'

interface InteractiveGlowCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  glowColor?: string
}

export const InteractiveGlowCard: React.FC<InteractiveGlowCardProps> = ({
  children,
  className = '',
  onClick,
  glowColor = 'rgba(59, 130, 246, 0.08)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition(null)
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl bg-white border border-slate-200/90 shadow-card transition-all duration-300 overflow-hidden hover:shadow-card-hover hover:border-blue-300/80 hover:-translate-y-1.5 ${className}`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Subtle mouse follow glow */}
      {isHovered && mousePosition && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 70%)`,
          }}
        />
      )}

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
