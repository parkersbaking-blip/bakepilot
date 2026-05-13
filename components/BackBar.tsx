'use client'

/**
 * Universele terug-balk — verschijnt bovenaan elke sub-pagina,
 * vlak onder de Header. Niet op /home (daar is geen "vorige").
 *
 * Stijl: subtiel, lichte cream achtergrond, dunne lijn-icoon + tekst.
 * Klik = browser.back() (intelligenter dan altijd vaste route).
 */

import { useRouter, usePathname } from 'next/navigation'

interface BackBarProps {
  /** Optionele override-label, default "Terug" */
  label?: string
  /** Optionele override-route ipv browser.back() */
  href?: string
}

const HIDE_ON = ['/', '/home', '/welkom']

export default function BackBar({ label = 'Terug', href }: BackBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  if (HIDE_ON.includes(pathname || '')) return null

  function handleClick() {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <div className="sticky top-[60px] z-30 bg-cream/95 backdrop-blur-sm border-b border-warm-bg print:hidden">
      <div className="max-w-lg mx-auto px-4 py-2.5">
        <button
          onClick={handleClick}
          className="flex items-center gap-2 text-espresso/70 hover:text-warm transition-colors text-sm font-medium group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>{label}</span>
        </button>
      </div>
    </div>
  )
}
