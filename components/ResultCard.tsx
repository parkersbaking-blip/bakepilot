'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '@/lib/calculations'

interface ResultCardProps {
  label: string
  value: number
  highlight?: boolean
  index?: number
}

function useCountUp(target: number, duration = 0.8) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const startValRef = useRef(0)

  useEffect(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    startValRef.current = display
    startRef.current = null

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = (timestamp - startRef.current) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(startValRef.current + (target - startValRef.current) * eased)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(target)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return display
}

export default function ResultCard({ label, value, highlight = false, index = 0 }: ResultCardProps) {
  const animated = useCountUp(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      className={`rounded-2xl p-4 ${
        highlight
          ? 'bg-champagne/15 border border-champagne/40'
          : 'bg-espresso-light border border-espresso-light/60'
      }`}
    >
      <p className="text-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold tabular-nums ${highlight ? 'text-champagne text-2xl' : 'text-cream text-xl'}`}>
        {formatCurrency(animated)}
      </p>
    </motion.div>
  )
}
