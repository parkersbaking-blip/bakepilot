'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Footer from '@/components/Footer'
import { isProUser, setProUser } from '@/lib/pro'

const PRO_FEATURES = [
  { label: 'EU-conforme etiketten (allergenen vet, alle wettelijke velden)', available: true },
  { label: 'Broodverbeteraar-suggesties met automatische dosering', available: true },
  { label: "Eigen recept-foto's uploaden", available: true },
  { label: 'Eigen logo op PDF & etiketten', available: true },
  { label: 'Onbeperkt eigen recepten opslaan', available: true },
  { label: 'Batch-export: meerdere recepten in één PDF', available: true },
  { label: 'Orderplanning & klantenbeheer', available: true },
  { label: 'Cloud sync — werk op meerdere apparaten', available: false, soon: true },
  { label: 'Voedingswaarde-tabel op etiket', available: false, soon: true },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0, 0, 1] } },
}

export default function ProPage() {
  const [pro, setPro] = useState(false)
  useEffect(() => {
    setPro(isProUser())
  }, [])

  function togglePro() {
    const next = !pro
    setProUser(next)
    setPro(next)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title="Pro" />

      <div className="px-4 pt-6 pb-4 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-warm border border-warm-light rounded-3xl p-6 text-center overflow-hidden relative"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 70% 30%, #C9A96E 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9A96E" stroke="#C9A96E" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-white text-xs font-bold uppercase tracking-wider">BakePilot Pro</span>
            </div>
            <div className="mb-2">
              <span className="text-white text-5xl font-bold">€7,99</span>
              <span className="text-white/70 text-lg font-light"> / maand</span>
            </div>
            <p className="text-white/80 text-sm">Alles wat je nodig hebt voor een professionele bakkerij</p>
          </div>
        </motion.div>

        {/* Features list */}
        <div>
          <h2 className="text-espresso/70 text-xs font-semibold uppercase tracking-wider mb-3">
            Inbegrepen in Pro
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-white border border-warm-bg shadow-sm rounded-3xl overflow-hidden"
          >
            {PRO_FEATURES.map((feature, i) => (
              <motion.div
                key={feature.label}
                variants={item}
                className={`flex items-center gap-3 px-5 py-3.5 ${
                  i < PRO_FEATURES.length - 1 ? 'border-b border-warm-bg' : ''
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-warm-bg flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="text-muted text-sm flex-1">{feature.label}</span>
                {feature.soon && (
                  <span className="text-xs text-warm bg-warm-bg px-2 py-0.5 rounded-full">Binnenkort</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.5, ease: 'easeOut' }}
          className="space-y-3"
        >
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled
          >
            Binnenkort beschikbaar
          </Button>
          <p className="text-muted/60 text-xs text-center">
            Betalingen komen binnenkort. Tot die tijd kun je Pro hieronder testen.
          </p>
        </motion.div>

        {/* Test-modus toggle — verwijder of verberg deze bij echte launch */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-warm-bg/60 border border-warm/20 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-espresso text-sm font-bold">
                Test-modus {pro ? '✓ actief' : ''}
              </p>
              <p className="text-muted text-xs mt-0.5">
                {pro
                  ? 'Pro is geactiveerd — PDF export werkt.'
                  : 'Activeer Pro lokaal om alle features te testen.'}
              </p>
            </div>
            <button
              onClick={togglePro}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                pro
                  ? 'bg-white text-warm border border-warm/30'
                  : 'bg-warm text-white'
              }`}
            >
              {pro ? 'Deactiveer' : 'Activeer Pro'}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link
            href="/voorwaarden"
            className="text-muted/50 text-xs underline underline-offset-2 hover:text-muted transition-colors"
          >
            Gebruiksvoorwaarden
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
