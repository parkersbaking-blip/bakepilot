'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  unit?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, unit, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full bg-warm-bg border border-warm-bg rounded-xl
              px-4 py-3 text-espresso placeholder-muted/60
              focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30
              transition-colors text-base
              ${unit ? 'pr-16' : ''}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          {unit && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm font-medium pointer-events-none">
              {unit}
            </span>
          )}
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
