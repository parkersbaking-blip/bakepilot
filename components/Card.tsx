'use client'

import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'cream' | 'accent'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({
  children,
  variant = 'dark',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const variants = {
    dark: 'bg-espresso-card border border-espresso-light/40',
    cream: 'bg-cream-200 border border-cream-200',
    accent: 'bg-champagne/10 border border-champagne/30',
  }

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={`rounded-3xl shadow-lg ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
