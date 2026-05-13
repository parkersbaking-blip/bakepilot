'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isOnboarded } from '@/lib/onboarding'

const FEATURES = [
  {
    icon: '🧮',
    title: 'Kostprijs berekenen',
    text: 'Vul je recept in, krijg meteen je verkoopprijs incl. marge en BTW.',
  },
  {
    icon: '📒',
    title: 'Eigen recepten',
    text: 'Bewaar je recepten, schaal ze automatisch met bakkerspercentages.',
  },
  {
    icon: '🏷️',
    title: 'EU-conforme etiketten',
    text: 'Genereer etiketten met allergenen vetgedrukt — klaar voor je producten.',
  },
  {
    icon: '📅',
    title: 'Orderbeheer',
    text: 'Houd je bestellingen, klanten en planning bij in één agenda.',
  },
]

export default function SplashPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  // Terugkerende gebruikers (al onboarded) direct naar /home sturen.
  // Nieuwe bezoekers zien de marketing-pagina.
  // Met ?intro of ?marketing parameter altijd de splash tonen (handig om te delen).
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const forceShow = params.has('intro') || params.has('marketing')

    if (isOnboarded() && !forceShow) {
      router.replace('/home')
    } else {
      setReady(true)
    }
  }, [router])

  function handleStart() {
    // Al onboarded? → direct naar de app
    // Nieuw? → eerst het welkomstscherm (onboarding)
    if (isOnboarded()) {
      router.push('/home')
    } else {
      router.push('/welkom')
    }
  }

  // Toon niets terwijl we redirecten (voorkomt flash van splash voor terugkerende users)
  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-warm border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* TOP BAR — kleine login-link rechtsboven */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => router.push('/aanmelden')}
          className="text-espresso/70 hover:text-warm text-sm font-medium transition-colors"
        >
          Inloggen
        </button>
      </div>

      {/* HERO */}
      <section className="px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Hero foto */}
          <div className="relative w-full h-56 sm:h-64 mb-6 rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=90"
              alt="Verse cinnamon rolls"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 via-transparent to-transparent" />
          </div>

          {/* Logo */}
          <Image
            src="/image-1777594035959.jpg"
            alt="Parker's Baking logo"
            width={180}
            height={80}
            priority
            className="object-contain mb-6"
          />

          {/* Titel + tagline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="text-center space-y-2"
          >
            <h1 className="text-espresso text-4xl font-bold tracking-tight">
              <span className="text-warm">Bake</span>Pilot
            </h1>
            <p className="text-muted text-sm uppercase tracking-[0.3em] font-bold">
              Slimme assistent voor bakkers
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* INTRO TEKST */}
      <section className="px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-warm-bg/60 rounded-3xl p-6 text-center"
        >
          <p className="text-espresso text-lg font-semibold leading-snug mb-3">
            Wat kost mijn product écht?
          </p>
          <p className="text-espresso/80 text-sm leading-relaxed">
            BakePilot helpt thuisbakkers, bijverdieners en kleine bakkerijen
            om <strong>kostprijs te berekenen</strong>, recepten te beheren en
            <strong> producten klaar te maken voor verkoop</strong>. Geen
            ingewikkelde Excel meer — gewoon snel, mobiel en duidelijk.
          </p>
        </motion.div>
      </section>

      {/* FEATURES — 4 kaarten */}
      <section className="px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <p className="text-warm text-xs uppercase tracking-[0.3em] font-bold mb-4 text-center">
            — Wat krijg je —
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                className="bg-white border border-warm-bg shadow-sm rounded-2xl p-4"
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-espresso font-bold text-sm leading-tight mb-1">
                  {f.title}
                </p>
                <p className="text-muted text-xs leading-relaxed">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* PRICING TEASER */}
      <section className="px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.95 }}
          className="bg-warm rounded-3xl p-5 text-center text-white shadow-lg"
        >
          <p className="text-white/80 text-xs uppercase tracking-widest font-bold mb-2">
            ✓ Gratis te beginnen
          </p>
          <p className="text-white text-2xl font-bold mb-1">
            Probeer kosteloos
          </p>
          <p className="text-white/80 text-sm">
            Uitgebreide Pro vanaf <strong>€7,99/maand</strong> — etiketten,
            broodverbeteraars, eigen logo & meer.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 1.1 }}
          className="space-y-3"
        >
          <button
            onClick={handleStart}
            className="w-full bg-espresso text-cream text-base font-bold rounded-full py-4 shadow-lg active:scale-[0.98] hover:bg-warm transition-all"
          >
            Aan de slag →
          </button>
          <p className="text-muted text-xs text-center leading-relaxed">
            Geen creditcard nodig om te beginnen.
          </p>
        </motion.div>
      </section>

      {/* WACHTLIJST SECTIE — accounts binnenkort */}
      <section className="px-6 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.25 }}
          className="bg-warm-bg/60 border-2 border-dashed border-warm/30 rounded-3xl p-5 text-center"
        >
          <p className="text-warm text-xs uppercase tracking-widest font-bold mb-2">
            🚀 Binnenkort
          </p>
          <p className="text-espresso font-bold text-base mb-1">
            Wachtlijst voor accounts
          </p>
          <p className="text-muted text-xs leading-relaxed mb-4">
            Persoonlijke accounts met cloud sync over al je apparaten komen
            binnenkort. Schrijf je in en wees als eerste op de hoogte.
          </p>
          <button
            onClick={() => router.push('/aanmelden')}
            className="bg-warm text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md active:scale-95 transition-transform"
          >
            Schrijf me in →
          </button>
        </motion.div>
      </section>

      <p className="text-muted/60 text-xs text-center pb-6">
        © 2026 BakePilot by Parker&apos;s Baking
      </p>
    </div>
  )
}
