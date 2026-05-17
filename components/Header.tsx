'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface HeaderProps {
  title?: string
  showLogo?: boolean
  right?: React.ReactNode
  /** Forceer terug-knop verbergen (bv. op /home, /welkom, /). Default: auto. */
  hideBack?: boolean
}

// Pagina's waar GEEN terug-knop nodig is (top-level routes)
const NO_BACK_PATHS = ['/', '/home', '/welkom']

export default function Header({
  title,
  showLogo = true,
  right,
  hideBack = false,
}: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const onSettingsPage = pathname === '/instellingen'
  const showBack = !hideBack && !NO_BACK_PATHS.includes(pathname || '')

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-warm-bg px-4 py-3 print:hidden">
      <div className="flex items-center justify-between max-w-lg mx-auto gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              onClick={() => router.back()}
              aria-label="Terug"
              className="w-9 h-9 rounded-full bg-warm-bg/60 hover:bg-warm-bg active:scale-95 flex items-center justify-center transition-all flex-shrink-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B4513"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {showLogo && !showBack && (
            <Link href="/home" className="flex-shrink-0">
              <Image
                src="/image-1777594035959.jpg"
                alt="Parker's Baking logo"
                width={80}
                height={36}
                className="drop-shadow-sm object-contain"
              />
            </Link>
          )}
          {title && (
            <span className="text-espresso font-semibold text-base truncate">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {right}
          {!onSettingsPage && (
            <Link
              href="/instellingen"
              aria-label="Instellingen"
              className="w-9 h-9 rounded-full bg-warm-bg/60 hover:bg-warm-bg flex items-center justify-center transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B4513"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
