'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import BackBar from '@/components/BackBar'
import RecipeCard from '@/components/RecipeCard'
import Footer from '@/components/Footer'
import { STARTER_RECIPES } from '@/lib/recipes'
import { getCustomRecipes } from '@/lib/customRecipes'
import type { Recipe } from '@/lib/types'

const CATEGORIES = [
  { label: 'Alle', emoji: '🍞' },
  { label: 'Mijn recepten', emoji: '⭐' },
  { label: 'Brood', emoji: '🥖' },
  { label: 'Zoet gebak', emoji: '🧁' },
  { label: 'Cake', emoji: '🎂' },
  { label: 'Koekjes', emoji: '🍪' },
]

export default function ReceptenPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('Alle')
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    setCustomRecipes(getCustomRecipes())
    // Lees ?cat=... uit URL en zet filter direct
    if (typeof window !== 'undefined') {
      const cat = new URLSearchParams(window.location.search).get('cat')
      if (cat) {
        const decoded = decodeURIComponent(cat)
        // Alleen toepassen als het een bestaande categorie is
        if (CATEGORIES.some((c) => c.label === decoded)) {
          setActiveCategory(decoded)
        }
      }
    }
  }, [])

  // Combineer eigen recepten bovenaan met startrecepten
  const allRecipes: Recipe[] = [...customRecipes, ...STARTER_RECIPES]

  const filtered =
    activeCategory === 'Alle'
      ? allRecipes
      : activeCategory === 'Mijn recepten'
        ? customRecipes
        : allRecipes.filter((r) => r.category === activeCategory)

  function handleSelect(recipe: Recipe) {
    router.push(`/recepten/${recipe.id}`)
  }

  function handleNewRecipe() {
    router.push('/calculator?nieuw=1')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title="Recepten" />
      <BackBar />

      <div className="px-4 pt-6 pb-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="space-y-3"
        >
          <div>
            <h1 className="text-espresso text-2xl font-bold">Recepten</h1>
            <p className="text-muted text-sm mt-1">
              Kies een recept of maak je eigen
            </p>
          </div>
          <button
            onClick={handleNewRecipe}
            className="w-full flex items-center justify-center gap-2 bg-warm text-white font-bold py-3 rounded-full shadow-md active:scale-[0.98] transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nieuw recept maken</span>
          </button>
        </motion.div>

        {/* Category pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.label
            // Verberg "Mijn recepten" tab als de gebruiker er geen heeft
            if (cat.label === 'Mijn recepten' && customRecipes.length === 0) {
              return null
            }
            return (
              <motion.button
                key={cat.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.label)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-warm text-white shadow-md'
                    : 'bg-warm-bg text-espresso border border-warm-bg'
                }`}
              >
                <span className="text-base">{cat.emoji}</span>
                <span>{cat.label}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted text-xs font-medium"
        >
          {filtered.length} {filtered.length === 1 ? 'recept' : 'recepten'} gevonden
        </motion.p>

        {/* Mijn-recepten lege staat */}
        {activeCategory === 'Mijn recepten' && customRecipes.length === 0 && (
          <div className="bg-warm-bg/60 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">📒</div>
            <p className="text-espresso font-semibold text-sm">
              Nog geen eigen recepten
            </p>
            <p className="text-muted text-xs mt-1 leading-relaxed">
              Maak een berekening in de calculator en klik op{' '}
              <strong>&quot;Opslaan als eigen recept&quot;</strong> om hem hier
              te zien.
            </p>
          </div>
        )}

        {/* Recipe cards */}
        <div className="space-y-4">
          {filtered.map((recipe, i) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              index={i}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {customRecipes.length === 0 && activeCategory === 'Alle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-warm-bg rounded-2xl p-4 flex items-center gap-3"
          >
            <span className="text-2xl">📒</span>
            <p className="text-espresso text-xs leading-relaxed">
              <span className="text-warm font-bold">Tip: </span>
              Maak je eigen recepten in de calculator en sla ze op om ze hier
              terug te vinden.
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}
