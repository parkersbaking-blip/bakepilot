'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  getSavedCalculations,
  setSelectedCalculation,
  deleteCalculation,
} from '@/lib/storage'
import { formatCurrency } from '@/lib/calculations'
import type { Calculation } from '@/lib/types'

type SortMode = 'recent' | 'name' | 'price'

export default function BerekeningenPage() {
  const router = useRouter()
  const [calcs, setCalcs] = useState<Calculation[]>([])
  const [sort, setSort] = useState<SortMode>('recent')
  const [search, setSearch] = useState('')

  function refresh() {
    setCalcs(getSavedCalculations())
  }

  useEffect(() => {
    refresh()
  }, [])

  function handleOpen(calc: Calculation) {
    setSelectedCalculation(calc)
    router.push('/calculator')
  }

  function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je deze berekening wilt verwijderen?')) return
    deleteCalculation(id)
    refresh()
  }

  // Filter + sort
  const filtered = calcs.filter((c) =>
    (c.productName || '').toLowerCase().includes(search.toLowerCase())
  )
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'recent') {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    }
    if (sort === 'name') {
      return (a.productName || '').localeCompare(b.productName || '')
    }
    if (sort === 'price') {
      return (
        (b.result?.salesPriceInclVat ?? 0) - (a.result?.salesPriceInclVat ?? 0)
      )
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title="Berekeningen" />

      <div className="px-4 pt-6 pb-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-espresso text-2xl font-bold">Mijn berekeningen</h1>
          <p className="text-muted text-sm mt-1">
            {calcs.length === 0
              ? 'Nog geen berekeningen — sla er een op in de calculator'
              : `${calcs.length} ${calcs.length === 1 ? 'berekening' : 'berekeningen'} bewaard`}
          </p>
        </motion.div>

        {calcs.length > 0 && (
          <>
            {/* Zoek */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Zoek op productnaam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-warm-bg border border-warm-bg rounded-xl pl-9 pr-4 py-2.5 text-espresso placeholder-muted/60 focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30 text-sm"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              {(
                [
                  { id: 'recent', label: 'Meest recent' },
                  { id: 'name', label: 'Naam' },
                  { id: 'price', label: 'Prijs' },
                ] as { id: SortMode; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSort(opt.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    sort === opt.id
                      ? 'bg-warm text-white'
                      : 'bg-warm-bg text-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Lijst */}
            <div className="space-y-2">
              {sorted.length === 0 ? (
                <div className="bg-warm-bg/60 rounded-2xl p-6 text-center">
                  <p className="text-muted text-sm">
                    Geen resultaten voor &quot;{search}&quot;
                  </p>
                </div>
              ) : (
                sorted.map((calc) => (
                  <div
                    key={calc.id}
                    className="w-full bg-white rounded-2xl border border-warm-bg p-2 flex items-center gap-2 shadow-sm"
                  >
                    <button
                      onClick={() => handleOpen(calc)}
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
                              year: 'numeric',
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
                      onClick={() => handleDelete(calc.id)}
                      aria-label="Verwijder"
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
                ))
              )}
            </div>
          </>
        )}

        {calcs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-warm-bg/60 rounded-2xl p-6 text-center"
          >
            <div className="text-4xl mb-2">🧮</div>
            <p className="text-espresso font-semibold text-sm">
              Nog geen berekeningen
            </p>
            <p className="text-muted text-xs mt-1 leading-relaxed mb-4">
              Maak een berekening en klik op <strong>&quot;Opslaan&quot;</strong> om
              hem hier terug te vinden.
            </p>
            <button
              onClick={() => router.push('/calculator')}
              className="bg-warm text-white text-sm font-bold px-5 py-2.5 rounded-full active:scale-95 transition-transform"
            >
              Naar calculator →
            </button>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}
