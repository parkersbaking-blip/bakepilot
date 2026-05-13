'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  getSavedCalculations,
  setSelectedCalculation,
  deleteCalculation,
} from '@/lib/storage'
import { formatCurrency } from '@/lib/calculations'
import { getWeeklyRecipe, getWeekLabel } from '@/lib/weeklyRecipe'
import type { Calculation, Recipe } from '@/lib/types'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Goedemorgen'
  if (hour < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

const CATEGORIES = [
  { label: 'Zoet gebak', emoji: '🧁' },
  { label: 'Koekjes', emoji: '🍪' },
  { label: 'Brood', emoji: '🥐' },
  { label: 'Cake', emoji: '🎂' },
]

const FEATURED = [
  {
    title: 'Kaneelbroodjes',
    subtitle: 'Zoet gebak',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  },
  {
    title: 'Chocoladekoekjes',
    subtitle: 'Koekjes',
    rating: 4.8,
    photo: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [savedCalcs, setSavedCalcs] = useState<Calculation[]>([])
  const [weeklyRecipe, setWeeklyRecipe] = useState<Recipe | null>(null)
  const [weekLabel, setWeekLabel] = useState('')

  useEffect(() => {
    setSavedCalcs(getSavedCalculations().slice(0, 3))
    setWeeklyRecipe(getWeeklyRecipe())
    setWeekLabel(getWeekLabel())
  }, [])

  function handleOpenCalculation(calc: typeof savedCalcs[number]) {
    setSelectedCalculation(calc)
    router.push('/calculator')
  }

  function handleDeleteCalculation(
    id: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.stopPropagation()
    if (!confirm('Weet je zeker dat je deze berekening wilt verwijderen?')) return
    deleteCalculation(id)
    setSavedCalcs(getSavedCalculations().slice(0, 3))
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title="BakePilot" />

      <div className="px-4 pt-5 pb-4 space-y-6">
        {/* Warm-bruin header card met begroeting */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-warm rounded-3xl p-5 text-white shadow-md"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-xs font-medium">{getGreeting()}</p>
              <p className="text-white text-lg font-semibold mt-0.5">
                Welkom terug 👋
              </p>
            </div>
            <button
              onClick={() => router.push('/pro')}
              className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 active:scale-95 transition-transform"
              aria-label="Pro"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={1}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => router.push('/calculator')}
            className="w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-muted text-sm flex-1 text-left">
              Start een nieuwe berekening...
            </span>
          </button>
        </motion.div>

        {/* RECEPT VAN DE WEEK */}
        {weeklyRecipe && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-espresso text-base font-bold">
                Recept van de week
              </h2>
              <span className="text-muted text-[10px] uppercase tracking-wider">
                {weekLabel}
              </span>
            </div>

            <button
              onClick={() => router.push(`/recepten/${weeklyRecipe.id}`)}
              className="w-full bg-white border-2 border-warm-bg shadow-md rounded-3xl overflow-hidden active:scale-[0.99] transition-transform text-left group"
            >
              <div className="relative aspect-[5/3] bg-warm-bg overflow-hidden">
                {weeklyRecipe.photo ? (
                  <Image
                    src={weeklyRecipe.photo}
                    alt={weeklyRecipe.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 512px) 100vw, 512px"
                    unoptimized={weeklyRecipe.photo.startsWith('http')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl text-warm/40">
                    🥖
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/80 to-transparent p-4 pt-12">
                  <span className="inline-block bg-warm text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                    ⭐ Deze week
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-warm text-[10px] uppercase tracking-widest font-bold mb-1">
                  {weeklyRecipe.subcategory || weeklyRecipe.category}
                </p>
                <p className="text-espresso text-xl font-bold leading-tight">
                  {weeklyRecipe.name}
                </p>
                {weeklyRecipe.description && (
                  <p className="text-muted text-xs mt-2 line-clamp-2 leading-relaxed">
                    {weeklyRecipe.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-muted text-xs">
                    {weeklyRecipe.prepTime} min · {weeklyRecipe.difficulty}
                  </span>
                  <span className="text-warm text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Bekijk recept →
                  </span>
                </div>
              </div>
            </button>
          </motion.section>
        )}

        {/* Special Offer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-espresso text-base font-bold">Aanbiedingen</h2>
          </div>

          <div className="bg-warm-bg rounded-3xl overflow-hidden flex shadow-sm">
            <div className="flex-1 p-5 flex flex-col justify-center">
              <span className="inline-block bg-white text-warm text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 self-start">
                Beperkte tijd!
              </span>
              <p className="text-espresso font-bold text-base leading-tight">
                Tijdelijke aanbieding
              </p>
              <p className="text-warm text-2xl font-extrabold mt-1">
                Tot 40<span className="text-base">%</span>
              </p>
              <button
                onClick={() => router.push('/pro')}
                className="bg-warm text-white text-xs font-semibold rounded-full px-4 py-2 mt-3 self-start active:scale-95 transition-transform"
              >
                Bekijk nu
              </button>
            </div>
            <div className="relative w-32 h-auto">
              <Image
                src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80"
                alt="Special offer"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-espresso text-base font-bold">Categorieën</h2>
            <button
              onClick={() => router.push('/recepten')}
              className="text-warm text-xs font-semibold"
            >
              Bekijk alles
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() =>
                  router.push(`/recepten?cat=${encodeURIComponent(cat.label)}`)
                }
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 bg-warm-bg rounded-full flex items-center justify-center text-2xl shadow-sm">
                  {cat.emoji}
                </div>
                <span className="text-espresso text-[11px] font-semibold text-center leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Featured */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-espresso text-base font-bold">Populaire recepten</h2>
            <button
              onClick={() => router.push('/recepten')}
              className="text-warm text-xs font-semibold"
            >
              Bekijk alles
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURED.map((item) => (
              <button
                key={item.title}
                onClick={() => router.push('/recepten')}
                className="bg-white rounded-2xl overflow-hidden border border-warm-bg shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div className="relative w-full h-28">
                  <Image
                    src={item.photo}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 512px) 50vw, 256px"
                  />
                  <div className="absolute top-2 left-2 bg-white/95 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <span className="text-[10px]">⭐</span>
                    <span className="text-espresso text-[10px] font-bold">
                      {item.rating}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-espresso text-sm font-semibold leading-tight">
                    {item.title}
                  </p>
                  <p className="text-muted text-[11px] mt-0.5">{item.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Opgeslagen berekeningen */}
        {savedCalcs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-espresso text-base font-bold">
                Opgeslagen berekeningen
              </h2>
              <button
                onClick={() => router.push('/berekeningen')}
                className="text-warm text-xs font-semibold"
              >
                Bekijk alles
              </button>
            </div>
            <div className="space-y-2">
              {savedCalcs.map((calc) => (
                <div
                  key={calc.id}
                  className="w-full bg-white rounded-2xl border border-warm-bg p-2 flex items-center gap-2 shadow-sm"
                >
                  <button
                    onClick={() => handleOpenCalculation(calc)}
                    className="flex-1 flex items-center justify-between gap-3 p-2 rounded-xl active:bg-warm-bg/40 transition-colors text-left min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-warm-bg flex items-center justify-center text-xl flex-shrink-0">
                        🧁
                      </div>
                      <div className="min-w-0">
                        <p className="text-espresso font-semibold text-sm truncate">
                          {calc.productName || 'Naamloos product'}
                        </p>
                        <p className="text-muted text-xs mt-0.5">
                          {calc.desiredYield} stuks ·{' '}
                          {new Date(calc.savedAt).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    {calc.result && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-warm font-bold text-sm">
                          {formatCurrency(calc.result.salesPriceInclVat)}
                        </p>
                        <p className="text-muted text-[10px]">per stuk</p>
                      </div>
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDeleteCalculation(calc.id, e)}
                    aria-label="Verwijder berekening"
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-warm-bg/40 hover:bg-red-50 hover:text-red-600 text-muted flex items-center justify-center transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {savedCalcs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-warm-bg rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="text-3xl">💡</div>
            <p className="text-espresso text-xs leading-relaxed">
              <span className="text-warm font-bold">Tip: </span>
              Start je eerste berekening en gebruik 9% BTW voor voedingsmiddelen.
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}
