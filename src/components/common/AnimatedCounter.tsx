import React, { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: string | number
  duration?: number
  className?: string
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1800,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0')
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Parse value into number + prefix + suffix + decimals + comma formatted
    const rawStr = value.toString().trim()
    const numericMatch = rawStr.match(/([0-9,.]+)/)

    if (!numericMatch) {
      setDisplayValue(rawStr)
      return
    }

    const matchedStr = numericMatch[0]
    const cleanNumStr = matchedStr.replace(/,/g, '')
    const targetNumber = parseFloat(cleanNumStr)

    if (isNaN(targetNumber)) {
      setDisplayValue(rawStr)
      return
    }

    const hasComma = matchedStr.includes(',')
    const hasDecimal = cleanNumStr.includes('.')
    const decimalPlaces = hasDecimal ? cleanNumStr.split('.')[1].length : 0

    const prefix = rawStr.slice(0, numericMatch.index)
    const suffix = rawStr.slice((numericMatch.index || 0) + matchedStr.length)

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(1, elapsed / duration)

            // Smooth ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3)
            const currentNum = targetNumber * easeOut

            let formattedNumber = currentNum.toFixed(decimalPlaces)

            if (hasComma) {
              const parts = formattedNumber.split('.')
              parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              formattedNumber = parts.join('.')
            }

            setDisplayValue(`${prefix}${formattedNumber}${suffix}`)

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              // Final exact string
              setDisplayValue(rawStr)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.15 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [value, duration, hasAnimated])

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  )
}
