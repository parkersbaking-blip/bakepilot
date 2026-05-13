'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Input from '@/components/Input'
import Button from '@/components/Button'
import {
  addToWaitlist,
  isOnWaitlist,
  getWaitlistCount,
  isValidEmail,
  type UserSegment,
} from '@/lib/waitlist'

const SEGMENTS: { id: UserSegment; emoji: string; label: string }[] = [
  { id: 'hobby', emoji: '🏠', label: 'Hobby thuisbakker' },
  { id: 'bijverdienste', emoji: '🛍️', label: 'Bijverdienste' },
  { id: 'professioneel', emoji: '🥖', label: 'Professionele bakker' },
]

export default function AanmeldenPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [segment, setSegment] = useState<UserSegment | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle')
  const [count, setCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setCount(getWaitlistCount())
  }, [])

  function handleSubmit() {
    setErrorMsg('')

    if (!email.trim()) {
      setErrorMsg('Vul je email-adres in')
      return
    }
    if (!isValidEmail(email)) {
      setErrorMsg('Dit is geen geldig email-adres')
      return
    }

    if (isOnWaitlist(email)) {
      setStatus('duplicate')
      return
    }

    const ok = addToWaitlist({
      email: email.trim().toLowerCase(),
      name: name.trim() || undefined,
      segment: segment ?? undefined,
    })

    if (ok) {
      setStatus('success')
      setCount(getWaitlistCount())
    } else {
      setStatus('error')
      setErrorMsg('Er ging iets mis. Probeer het opnieuw.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-10 pb-6 flex flex-col items-center">
        <Image
          src="/image-1777594035959.jpg"
          alt="Parker's Baking"
          width={140}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      <div className="flex-1 px-6 pb-10 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <span className="inline-block bg-warm/15 text-warm text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  🚀 Coming soon
                </span>
                <h1 className="text-espresso text-3xl font-bold leading-tight">
                  Word lid van de <span className="text-warm">wachtlijst</span>
                </h1>
                <p className="text-muted text-sm mt-3 leading-relaxed">
                  Accounts en login komen binnenkort. Schrijf je hier in en je
                  bent als eerste op de hoogte zodra BakePilot officieel
                  beschikbaar is.
                </p>
                {count > 0 && (
                  <p className="text-warm text-xs mt-3 font-semibold">
                    ⭐ {count} {count === 1 ? 'persoon staat' : 'mensen staan'} al
                    op de wachtlijst
                  </p>
                )}
              </div>

              {/* Form */}
              <div className="space-y-4 bg-white border border-warm-bg rounded-3xl p-5 shadow-sm">
                <Input
                  label="Email-adres *"
                  type="email"
                  placeholder="naam@bakkerij.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Naam (optioneel)"
                  placeholder="Voornaam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider">
                    Wat ben je? (optioneel)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {SEGMENTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setSegment(segment === s.id ? null : s.id)
                        }
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-colors ${
                          segment === s.id
                            ? 'bg-warm/15 border-warm/50 text-warm'
                            : 'bg-warm-bg/60 border-warm-bg text-muted'
                        }`}
                      >
                        <span className="text-xl">{s.emoji}</span>
                        <span className="text-center leading-tight">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-700 text-xs">{errorMsg}</p>
                  </div>
                )}

                <Button variant="primary" size="lg" fullWidth onClick={handleSubmit}>
                  Schrijf me in →
                </Button>

                <p className="text-muted/60 text-[10px] text-center leading-relaxed">
                  Je email gebruiken we alleen om je te informeren over
                  BakePilot. We verkopen je gegevens nooit door.
                </p>
              </div>

              {/* Wat verwacht je */}
              <div className="bg-warm-bg/60 rounded-2xl p-4">
                <p className="text-espresso text-xs font-bold uppercase tracking-wider mb-2">
                  Wat krijg je?
                </p>
                <ul className="space-y-1.5 text-espresso/80 text-sm">
                  <li>✓ Als eerste een uitnodiging zodra accounts er zijn</li>
                  <li>✓ Vroege korting voor wachtlijst-leden</li>
                  <li>✓ Updates over nieuwe features (geen spam)</li>
                </ul>
              </div>

              {/* Terug-link */}
              <div className="text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-muted text-sm underline underline-offset-2"
                >
                  ← Terug naar de app
                </button>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-6 pt-12"
            >
              <div className="text-7xl">🎉</div>
              <div>
                <h1 className="text-espresso text-3xl font-bold leading-tight">
                  Je staat op de lijst!
                </h1>
                <p className="text-muted text-sm mt-3 leading-relaxed">
                  Bedankt voor je interesse in BakePilot. Zodra accounts
                  beschikbaar zijn, sturen we je een email op{' '}
                  <strong className="text-espresso">{email}</strong>.
                </p>
              </div>
              <div className="bg-warm-bg/60 rounded-2xl p-4">
                <p className="text-warm text-sm font-semibold">
                  ⭐ Jij bent #{count} op de wachtlijst
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push('/?intro')}
                >
                  Probeer BakePilot nu vast
                </Button>
                <button
                  onClick={() => router.push('/')}
                  className="text-muted text-sm underline underline-offset-2 py-2"
                >
                  Naar de app
                </button>
              </div>
            </motion.div>
          )}

          {status === 'duplicate' && (
            <motion.div
              key="duplicate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-6 pt-12"
            >
              <div className="text-6xl">📬</div>
              <div>
                <h1 className="text-espresso text-2xl font-bold leading-tight">
                  Je staat er al op
                </h1>
                <p className="text-muted text-sm mt-3 leading-relaxed">
                  Dit email-adres staat al op de wachtlijst. Je hoort van ons
                  zodra het zover is.
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-warm text-sm font-bold underline underline-offset-2"
              >
                Naar de app →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
