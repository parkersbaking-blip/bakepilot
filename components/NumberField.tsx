'use client'

import { useEffect, useState } from 'react'

interface NumberFieldProps {
  label?: string
  unit?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  allowDecimals?: boolean
  min?: number
}

function parseLocaleNumber(raw: string): number {
  const normalized = raw.replace(',', '.')
  const n = parseFloat(normalized)
  return isNaN(n) ? 0 : n
}

export default function NumberField({
  label,
  unit,
  value,
  onChange,
  placeholder,
  allowDecimals = true,
  min = 0,
}: NumberFieldProps) {
  // Lokale string-state — sta tussenvormen toe als "", "0", "0.", "0,5"
  const [text, setText] = useState<string>(value === 0 ? '' : String(value))

  // Sync wanneer parent-value extern wijzigt (bv. recept geladen, reset)
  useEffect(() => {
    const parsedFromText = parseLocaleNumber(text)
    if (parsedFromText !== value) {
      setText(value === 0 ? '' : String(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const pattern = allowDecimals ? /^[0-9]*[.,]?[0-9]*$/ : /^[0-9]*$/

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode={allowDecimals ? 'decimal' : 'numeric'}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            const raw = e.target.value
            if (!pattern.test(raw)) return
            setText(raw)
            const n = raw === '' ? 0 : parseLocaleNumber(raw)
            // Respecteer min: leeg veld geeft min terug (bv. 1 voor stuks)
            onChange(raw === '' && min > 0 ? min : n < min ? min : n)
          }}
          className={`
            w-full bg-warm-bg border border-warm-bg rounded-xl
            px-4 py-3 text-espresso placeholder-muted/60
            focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30
            transition-colors text-base
            ${unit ? 'pr-16' : ''}
          `}
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm font-medium pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
