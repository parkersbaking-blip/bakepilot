'use client'

import { useEffect, useState } from 'react'
import type { Ingredient, Unit, PriceUnit } from '@/lib/types'
import { calcIngredientCost, formatCurrency } from '@/lib/calculations'
import { parseLocaleNumber } from '@/lib/parseNumber'

interface IngredientRowProps {
  ingredient: Ingredient
  index: number
  onChange: (id: string, field: keyof Ingredient, value: string | number) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: 'gram', label: 'gram' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'liter', label: 'liter' },
  { value: 'stuk', label: 'stuk' },
]

// Welke prijs-eenheden mogen bij welke hoeveelheids-eenheid?
const PRICE_OPTIONS_BY_UNIT: Record<Unit, { value: PriceUnit; label: string }[]> = {
  gram: [
    { value: 'per_kg', label: '€/kg' },
    { value: 'per_100g', label: '€/100g' },
    { value: 'per_g', label: '€/g' },
  ],
  kg: [
    { value: 'per_kg', label: '€/kg' },
    { value: 'per_100g', label: '€/100g' },
  ],
  ml: [
    { value: 'per_liter', label: '€/L' },
    { value: 'per_100ml', label: '€/100ml' },
  ],
  liter: [
    { value: 'per_liter', label: '€/L' },
    { value: 'per_100ml', label: '€/100ml' },
  ],
  stuk: [{ value: 'per_stuk', label: '€/stuk' }],
}

function defaultPriceUnitFor(unit: Unit): PriceUnit {
  return PRICE_OPTIONS_BY_UNIT[unit][0].value
}

// Korte label voor het inline prijs-suffix (gebruikt in collapsed view)
function shortPriceUnitLabel(unit: Unit): string {
  return PRICE_OPTIONS_BY_UNIT[unit][0].label
}

// Hint-tekst voor 'Andere eenheid?' knop, afhankelijk van unit
function advancedHintFor(unit: Unit): string {
  const others = PRICE_OPTIONS_BY_UNIT[unit].slice(1).map((p) => p.label)
  if (others.length === 0) return ''
  return `Andere eenheid? (${others.join(', ')})`
}

const inputClass = "w-full bg-white border border-warm-bg rounded-xl px-3 py-2.5 text-espresso placeholder-muted/60 focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30 text-sm"

export default function IngredientRow({
  ingredient,
  index,
  onChange,
  onRemove,
  canRemove,
}: IngredientRowProps) {
  // Lokale string-state zodat tussenvormen ("0", "0.", "0,5") gewoon te typen zijn
  const [qtyText, setQtyText] = useState<string>(
    ingredient.quantity === 0 ? '' : String(ingredient.quantity)
  )
  const [priceText, setPriceText] = useState<string>(
    ingredient.pricePerUnit === 0 ? '' : String(ingredient.pricePerUnit)
  )

  // Toon dropdown alleen als gebruiker afwijkende prijs-eenheid kiest
  const currentPriceUnit = ingredient.priceUnit ?? defaultPriceUnitFor(ingredient.unit)
  const isUsingDefaultPriceUnit = currentPriceUnit === defaultPriceUnitFor(ingredient.unit)
  const hasAdvancedOptions = PRICE_OPTIONS_BY_UNIT[ingredient.unit].length > 1
  const [showAdvanced, setShowAdvanced] = useState<boolean>(!isUsingDefaultPriceUnit)

  // Sync wanneer ingredient van buitenaf verandert (bv. recept geladen)
  useEffect(() => {
    setQtyText(ingredient.quantity === 0 ? '' : String(ingredient.quantity))
  }, [ingredient.id, ingredient.quantity])

  useEffect(() => {
    setPriceText(ingredient.pricePerUnit === 0 ? '' : String(ingredient.pricePerUnit))
  }, [ingredient.id, ingredient.pricePerUnit])

  // Reset naar default prijs-eenheid als gebruiker geavanceerd weer dichtklapt
  function handleCloseAdvanced() {
    setShowAdvanced(false)
    if (!isUsingDefaultPriceUnit) {
      onChange(ingredient.id, 'priceUnit', defaultPriceUnitFor(ingredient.unit))
    }
  }

  // Live preview van de kostprijs voor dit ingrediënt (op basis-hoeveelheid, niet geschaald)
  const previewCost =
    ingredient.quantity > 0 && ingredient.pricePerUnit > 0
      ? calcIngredientCost(ingredient, ingredient.quantity)
      : 0

  return (
    <div className="bg-warm-bg/60 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs font-medium uppercase tracking-wider">
          Ingrediënt {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(ingredient.id)}
            className="text-muted hover:text-red-400 transition-colors p-1"
            aria-label="Verwijder ingrediënt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Naam (bijv. Bloem)"
        value={ingredient.name}
        onChange={(e) => onChange(ingredient.id, 'name', e.target.value)}
        className={`${inputClass} px-4`}
      />

      {/* Hoeveelheid + eenheid */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Hoeveelheid"
          value={qtyText}
          onChange={(e) => {
            const raw = e.target.value
            if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return
            setQtyText(raw)
            onChange(ingredient.id, 'quantity', parseLocaleNumber(raw))
          }}
          className={inputClass}
        />

        <select
          value={ingredient.unit}
          onChange={(e) => {
            const newUnit = e.target.value as Unit
            onChange(ingredient.id, 'unit', newUnit)
            // Reset prijs-eenheid naar default bij eenheid-wissel — voorkomt verwarrende state
            onChange(ingredient.id, 'priceUnit', defaultPriceUnitFor(newUnit))
            setShowAdvanced(false)
          }}
          className={`${inputClass} appearance-none`}
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      {/* Prijs — collapsed: gewoon één veld met €/kg suffix. Expanded: met dropdown */}
      {showAdvanced && hasAdvancedOptions ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Prijs"
              value={priceText}
              onChange={(e) => {
                const raw = e.target.value
                if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return
                setPriceText(raw)
                onChange(ingredient.id, 'pricePerUnit', parseLocaleNumber(raw))
              }}
              className={inputClass}
            />
            <select
              value={currentPriceUnit}
              onChange={(e) =>
                onChange(ingredient.id, 'priceUnit', e.target.value as PriceUnit)
              }
              className={`${inputClass} appearance-none`}
            >
              {PRICE_OPTIONS_BY_UNIT[ingredient.unit].map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleCloseAdvanced}
            className="text-muted text-xs underline underline-offset-2"
          >
            Eenvoudig ({shortPriceUnitLabel(ingredient.unit)})
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              placeholder="Prijs"
              value={priceText}
              onChange={(e) => {
                const raw = e.target.value
                if (!/^[0-9]*[.,]?[0-9]*$/.test(raw)) return
                setPriceText(raw)
                onChange(ingredient.id, 'pricePerUnit', parseLocaleNumber(raw))
              }}
              className={`${inputClass} pr-14`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium pointer-events-none">
              {shortPriceUnitLabel(ingredient.unit)}
            </span>
          </div>
          {hasAdvancedOptions && (
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="text-muted text-xs underline underline-offset-2"
            >
              {advancedHintFor(ingredient.unit)}
            </button>
          )}
        </div>
      )}

      {/* Live cost preview */}
      {previewCost > 0 && (
        <div className="bg-white/60 border border-warm-bg rounded-xl px-3 py-2 flex items-center justify-between">
          <span className="text-muted text-xs">Kosten dit ingrediënt</span>
          <span className="text-warm text-sm font-semibold tabular-nums">
            {formatCurrency(previewCost)}
          </span>
        </div>
      )}
    </div>
  )
}
