'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BREAD_PROFILES } from '@/lib/breadProfiles'
import { BREAD_POWDERS, calculatePowderGrams, getPowderById } from '@/lib/breadPowders'
import { isProUser } from '@/lib/pro'
import type { Ingredient, BreadProfile } from '@/lib/types'

interface BreadProfileSelectorProps {
  flourGrams: number
  onAddIngredient: (ing: Ingredient) => void
  onShowProUpsell: () => void
}

/**
 * Detecteer het bloemgewicht uit een ingrediëntenlijst.
 * Zoekt op gangbare bloem-/meel-namen.
 */
export function detectFlourGrams(ingredients: Ingredient[]): number {
  const flourKeywords = ['bloem', 'meel', 'flour']
  return ingredients
    .filter((i) => {
      const n = i.name.toLowerCase()
      return flourKeywords.some((k) => n.includes(k))
    })
    .reduce((sum, i) => sum + i.quantity, 0)
}

export default function BreadProfileSelector({
  flourGrams,
  onAddIngredient,
  onShowProUpsell,
}: BreadProfileSelectorProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [pro, setPro] = useState(false)

  useEffect(() => {
    setPro(isProUser())
    // Re-check elke keer dat de pagina opnieuw rendert (bv. na Pro activeren)
    const interval = setInterval(() => setPro(isProUser()), 1000)
    return () => clearInterval(interval)
  }, [])

  const selected: BreadProfile | undefined = BREAD_PROFILES.find(
    (p) => p.id === selectedProfileId
  )

  function handleAddSuggestion(suggestion: { ingredientId: string; bakerPercentage: number }) {
    const powder = getPowderById(suggestion.ingredientId)
    if (!powder) return

    if (!pro) {
      onShowProUpsell()
      return
    }

    if (flourGrams <= 0) {
      // Voeg toe op 0 g; gebruiker ziet de bakerPercentage en kan bloem invullen
      onAddIngredient({
        id: crypto.randomUUID(),
        name: powder.name,
        quantity: 0,
        unit: 'gram',
        pricePerUnit: powder.defaultPricePerKg ?? 0,
        bakerPercentage: suggestion.bakerPercentage,
      })
      return
    }

    const grams = calculatePowderGrams(flourGrams, suggestion.bakerPercentage)
    onAddIngredient({
      id: crypto.randomUUID(),
      name: powder.name,
      quantity: grams,
      unit: 'gram',
      pricePerUnit: powder.defaultPricePerKg ?? 0,
      bakerPercentage: suggestion.bakerPercentage,
    })
  }

  return (
    <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
          Broodtype
        </h2>
        {!pro && (
          <span className="text-[10px] bg-warm text-white px-2 py-0.5 rounded-full font-bold">
            PRO
          </span>
        )}
      </div>

      <p className="text-muted text-xs leading-relaxed">
        Kies een broodtype om automatisch het juiste broodpoeder voor te stellen.
        Dosering wordt berekend op basis van bakkerspercentage.
      </p>

      {/* Profiel-selector */}
      <div className="grid grid-cols-2 gap-2">
        {BREAD_PROFILES.map((profile) => {
          const isActive = selectedProfileId === profile.id
          return (
            <button
              key={profile.id}
              type="button"
              onClick={() =>
                setSelectedProfileId(isActive ? '' : profile.id)
              }
              className={`text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors text-left ${
                isActive
                  ? 'bg-warm text-white'
                  : 'bg-warm-bg text-espresso hover:bg-warm-bg/80'
              }`}
            >
              {profile.name}
            </button>
          )
        })}
      </div>

      {/* Geselecteerd profiel detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="bg-warm-bg/60 rounded-2xl p-4 space-y-3"
          >
            <div>
              <p className="text-espresso text-sm font-semibold">
                {selected.name}
              </p>
              <p className="text-muted text-xs mt-0.5">
                Bv: {selected.examples.slice(0, 3).join(', ')}
              </p>
            </div>

            {selected.note && (
              <div className="bg-white rounded-xl p-3 text-xs text-espresso leading-relaxed">
                💡 {selected.note}
              </div>
            )}

            {selected.suggestedIngredients.length > 0 && (
              <div className="space-y-2">
                {selected.suggestedIngredients.map((suggestion) => {
                  const powder = getPowderById(suggestion.ingredientId)
                  if (!powder) return null
                  const grams =
                    flourGrams > 0
                      ? calculatePowderGrams(
                          flourGrams,
                          suggestion.bakerPercentage
                        )
                      : 0
                  return (
                    <div
                      key={suggestion.ingredientId}
                      className="bg-white rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-espresso text-sm font-semibold">
                          {powder.name}
                        </p>
                        <p className="text-muted text-xs mt-0.5">
                          {/* Pro ziet de exacte dosering, gratis gebruiker alleen het percentage */}
                          {pro && flourGrams > 0
                            ? `${suggestion.bakerPercentage}% × ${flourGrams} g bloem = ${grams} g`
                            : `${suggestion.bakerPercentage}% van bloemgewicht`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSuggestion(suggestion)}
                        className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-transform active:scale-95 ${
                          pro
                            ? 'bg-warm text-white'
                            : 'bg-warm-bg text-warm border border-warm/30'
                        }`}
                      >
                        {pro ? '+ Voeg toe' : '🔒 Pro'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pro upsell voor gratis gebruikers */}
            {!pro && selected.suggestedIngredients.length > 0 && (
              <button
                type="button"
                onClick={onShowProUpsell}
                className="w-full bg-warm/10 border border-warm/20 rounded-xl p-3 text-left active:scale-[0.99] transition-transform"
              >
                <p className="text-warm text-xs font-bold uppercase tracking-wider mb-1">
                  ⭐ Pro tip
                </p>
                <p className="text-espresso text-xs leading-relaxed">
                  Professionele optimalisatie beschikbaar: voeg automatisch het
                  juiste broodpoeder toe en laat BakePilot de exacte dosering
                  berekenen.
                </p>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lijst van beschikbare poeders (info, alleen Pro) */}
      {pro && !selected && (
        <details className="text-xs text-muted">
          <summary className="cursor-pointer hover:text-warm transition-colors">
            Alle beschikbare broodpoeders bekijken
          </summary>
          <div className="mt-3 space-y-2">
            {BREAD_POWDERS.map((p) => (
              <div
                key={p.id}
                className="bg-warm-bg/40 rounded-xl p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-espresso font-semibold text-sm">
                    {p.name}
                  </span>
                  <span className="text-warm font-bold text-sm">
                    {p.defaultBakerPercentage}%
                  </span>
                </div>
                <p className="text-muted text-xs mt-0.5">{p.description}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
