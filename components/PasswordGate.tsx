'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

/**
 * Eenvoudige client-side wachtwoord gate.
 *
 * Beveiligt de hele app: pas als iemand de juiste toegangscode invult,
 * krijgt 'ie de inhoud te zien. De code wordt onthouden in localStorage
 * zodat je 'm maar één keer per apparaat hoeft in te voeren.
 *
 * ⚠️ Let op: dit is GEEN echte beveiliging (de code zit in de JS bundle).
 * Het is bedoeld om de app van onbevoegden weg te houden tijdens de
 * testfase — niet om geheime data te beschermen.
 *
 * Wachtwoord wijzigen? Pas `ACCESS_CODE` hieronder aan en push.
 */

const ACCESS_CODE = 'bakepilot2026'
const STORAGE_KEY = 'bakepilot_access_granted'

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  // 'loading' = bezig met checken localStorage (om flash te voorkomen)
  // 'locked'  = laat wachtwoord-scherm zien
  // 'open'    = laat app door
  const [state, setState] = useState<'loading' | 'locked' | 'open'>('loading')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const granted = localStorage.getItem(STORAGE_KEY) === 'yes'
    setState(granted ? 'open' : 'locked')
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim().toLowerCase() === ACCESS_CODE.toLowerCase()) {
      localStorage.setItem(STORAGE_KEY, 'yes')
      setState('open')
    } else {
      setError(true)
      setInput('')
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-warm border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (state === 'locked') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6 text-center">
          <Image
            src="/image-1777594035959.jpg"
            alt="Parker's Baking logo"
            width={140}
            height={60}
            priority
            className="object-contain mx-auto"
          />

          <div>
            <p className="text-warm text-xs uppercase tracking-[0.3em] font-bold mb-2">
              🔒 Privé voorvertoning
            </p>
            <h1 className="text-espresso text-3xl font-bold tracking-tight">
              <span className="text-warm">Bake</span>Pilot
            </h1>
            <p className="text-muted text-sm mt-3 leading-relaxed">
              Deze app is nog in ontwikkeling. Voer de toegangscode in om verder te gaan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              autoFocus
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (error) setError(false)
              }}
              placeholder="Toegangscode"
              className={`w-full px-4 py-3 rounded-xl border-2 text-center text-espresso text-base focus:outline-none transition-colors ${
                error
                  ? 'border-red-300 bg-red-50'
                  : 'border-warm-bg focus:border-warm bg-white'
              }`}
            />
            {error && (
              <p className="text-red-600 text-xs">
                Verkeerde code. Probeer opnieuw.
              </p>
            )}
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full bg-espresso text-cream font-bold rounded-full py-3.5 shadow-lg active:scale-[0.98] hover:bg-warm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Geef toegang →
            </button>
          </form>

          <p className="text-muted/60 text-xs">
            Heb je geen code? Neem contact op met Parker&apos;s Baking.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
