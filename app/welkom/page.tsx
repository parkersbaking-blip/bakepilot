'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import NumberField from '@/components/NumberField'
import Input from '@/components/Input'
import { saveSettings, type UserType, type BakingFrequency } from '@/lib/settings'
import { setOnboarded, isOnboarded } from '@/lib/onboarding'

const USER_TYPES: {
  id: UserType
  emoji: string
  title: string
  subtitle: string
  defaultLabor: number
  defaultMargin: number
}[] = [
  {
    id: 'hobby',
    emoji: '🏠',
    title: 'Hobby thuisbakker',
    subtitle: 'Ik bak voor mezelf en familie',
    defaultLabor: 0,
    defaultMargin: 0,
  },
  {
    id: 'kleinverkoop',
    emoji: '🛍️',
    title: 'Kleinverkoop',
    subtitle: 'Ik verkoop mijn baksels af en toe',
    defaultLabor: 12,
    defaultMargin: 30,
  },
  {
    id: 'bakkerij',
    emoji: '🥖',
    title: 'Bakkerij',
    subtitle: 'Ik run een bakkerij of patisserie',
    defaultLabor: 22,
    defaultMargin: 40,
  },
]

const FREQUENCIES: { id: BakingFrequency; emoji: string; title: string; subtitle: string }[] = [
  {
    id: 'dagelijks',
    emoji: '🔥',
    title: 'Bijna dagelijks',
    subtitle: 'Ik bak meerdere keren per week',
  },
  {
    id: 'wekelijks',
    emoji: '📆',
    title: 'Wekelijks',
    subtitle: 'Eén of twee keer per week',
  },
  {
    id: 'maandelijks',
    emoji: '🗓️',
    title: 'Maandelijks',
    subtitle: 'Een paar keer per maand',
  },
  {
    id: 'incidenteel',
    emoji: '✨',
    title: 'Bij gelegenheden',
    subtitle: 'Verjaardagen, feestdagen, soms',
  },
]

const TOTAL_STEPS = 4

export default function WelkomPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [frequency, setFrequency] = useState<BakingFrequency | null>(null)
  const [bakeryName, setBakeryName] = useState('')
  const [laborCost, setLaborCost] = useState(15)

  // Al onboarded? → direct naar de app, tenzij expliciet via instellingen
  // (param ?force) opnieuw bekijken gewenst is
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const force = params.has('force')
    if (isOnboarded() && !force) {
      router.replace('/home')
    }
  }, [router])

  function handlePickUserType(type: UserType) {
    const preset = USER_TYPES.find((u) => u.id === type)!
    setUserType(type)
    setLaborCost(preset.defaultLabor)
    setStep(2)
  }

  function handlePickFrequency(freq: BakingFrequency) {
    setFrequency(freq)
    setStep(3)
  }

  function handleFinish() {
    const preset = USER_TYPES.find((u) => u.id === userType)!
    saveSettings({
      bakeryName: bakeryName.trim(),
      laborCostPerHour: laborCost,
      marginPercentage: preset.defaultMargin,
      vatPercentage: 9,
      packagingCost: 0.10,
      userType: userType!,
      bakingFrequency: frequency!,
    })
    setOnboarded()
    router.push('/home')
  }

  function handleSkip() {
    setOnboarded()
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header met logo */}
      <div className="px-6 pt-10 pb-4 flex flex-col items-center">
        <Image
          src="/image-1777594035959.jpg"
          alt="Parker's Baking logo"
          width={140}
          height={60}
          className="object-contain"
          priority
        />
        <div className="flex gap-2 mt-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-10 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-warm' : 'bg-warm-bg'
              }`}
            />
          ))}
        </div>
        <p className="text-muted text-xs mt-2">
          Stap {step} van {TOTAL_STEPS}
        </p>
      </div>

      <div className="flex-1 px-6 py-6">
        <AnimatePresence mode="wait">
          {/* STAP 1: doelgroep */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-espresso text-2xl font-bold leading-tight">
                  Welkom bij <span className="text-warm">BakePilot</span> 👋
                </h1>
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  Vertel kort wie je bent zodat we de app op jou afstemmen.
                </p>
              </div>

              <div className="space-y-3">
                {USER_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handlePickUserType(type.id)}
                    className="w-full bg-white border-2 border-warm-bg hover:border-warm rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all text-left"
                  >
                    <div className="w-14 h-14 bg-warm-bg rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                      {type.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-espresso font-bold text-base">
                        {type.title}
                      </p>
                      <p className="text-muted text-xs mt-0.5">
                        {type.subtitle}
                      </p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAP 2: frequentie */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-espresso text-2xl font-bold leading-tight">
                  Hoe vaak bak je? 🥖
                </h1>
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  Geen verkeerd antwoord — dit helpt ons om relevante tips en
                  features voor je te tonen.
                </p>
              </div>

              <div className="space-y-3">
                {FREQUENCIES.map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => handlePickFrequency(freq.id)}
                    className="w-full bg-white border-2 border-warm-bg hover:border-warm rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-warm-bg rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {freq.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-espresso font-bold text-base">
                        {freq.title}
                      </p>
                      <p className="text-muted text-xs mt-0.5">
                        {freq.subtitle}
                      </p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-muted text-sm font-medium py-2"
              >
                ← Terug
              </button>
            </motion.div>
          )}

          {/* STAP 3: uurloon */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-espresso text-2xl font-bold leading-tight">
                  Wat is je uurloon? 💰
                </h1>
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  Hier reken je je eigen tijd mee in de prijs. We hebben alvast
                  een suggestie ingevuld op basis van wat je net koos. Je kunt
                  dit later altijd aanpassen.
                </p>
              </div>

              <div className="bg-white border-2 border-warm-bg rounded-2xl p-5">
                <NumberField
                  label="Mijn uurloon"
                  unit="€/uur"
                  value={laborCost}
                  onChange={setLaborCost}
                />
                <p className="text-muted text-xs mt-3 leading-relaxed">
                  💡 Stel laag in als je je tijd niet wilt meerekenen, of hoog
                  als je echt waarde aan je werk geeft.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="text-muted text-sm font-medium px-4 py-3"
                >
                  ← Terug
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-warm text-white font-semibold rounded-full py-3.5 active:scale-[0.98] transition-transform"
                >
                  Volgende →
                </button>
              </div>
            </motion.div>
          )}

          {/* STAP 4: bakkerij naam */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div>
                <h1 className="text-espresso text-2xl font-bold leading-tight">
                  Heeft je bakkerij een naam? ✨
                </h1>
                <p className="text-muted text-sm mt-2 leading-relaxed">
                  Optioneel — deze naam komt op je PDF-exports en in
                  print-versies van recepten.
                </p>
              </div>

              <div className="bg-white border-2 border-warm-bg rounded-2xl p-5">
                <Input
                  label="Bakkerij-naam (optioneel)"
                  placeholder="bijv. Parker's Baking"
                  value={bakeryName}
                  onChange={(e) => setBakeryName(e.target.value)}
                />
              </div>

              <div className="bg-warm-bg rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <p className="text-espresso text-sm">
                  Je bent helemaal klaar! Klik hieronder om de app te
                  ontdekken.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="text-muted text-sm font-medium px-4 py-3"
                >
                  ← Terug
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 bg-warm text-white font-semibold rounded-full py-3.5 active:scale-[0.98] transition-transform"
                >
                  Aan de slag →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip-link */}
      <div className="px-6 pb-8 text-center">
        <button
          onClick={handleSkip}
          className="text-muted/60 text-xs underline underline-offset-2"
        >
          Sla welkomstscherm over
        </button>
      </div>
    </div>
  )
}
