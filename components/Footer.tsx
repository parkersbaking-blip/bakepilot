'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/home', label: 'Home', icon: 'home' },
  { href: '/recepten', label: 'Recepten', icon: 'book' },
  { href: '/calculator', label: 'Bereken', icon: 'calc' },
  { href: '/labels', label: 'Labels', icon: 'tag' },
  { href: '/pro', label: 'Pro', icon: 'star' },
] as const

function Icon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? '#8B4513' : '#8A7968'
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (name === 'home')
    return (
      <svg {...props}>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    )
  if (name === 'book')
    return (
      <svg {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5H6.5A2.5 2.5 0 0 0 4 19.5z" />
      </svg>
    )
  if (name === 'calc')
    return (
      <svg {...props}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0M8 19h2M12 19h2M16 19h0" />
      </svg>
    )
  if (name === 'tag')
    return (
      <svg {...props}>
        <path d="M20 12V5a1 1 0 0 0-1-1h-7L3 13l8 8 9-9z" />
        <circle cx="7.5" cy="8.5" r="1.5" />
      </svg>
    )
  if (name === 'star')
    return (
      <svg {...props} fill={active ? '#8B4513' : 'none'}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  return null
}

export default function Footer() {
  const pathname = usePathname()
  return (
    <>
      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warm-bg">
        <div className="max-w-lg mx-auto px-2 py-2 grid grid-cols-5 safe-area-pb">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href) ?? false
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-1.5 active:scale-95 transition-transform"
              >
                <Icon name={item.icon} active={active} />
                <span
                  className={`text-[10px] font-semibold ${
                    active ? 'text-warm' : 'text-muted'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer + voorwaarden */}
      <div className="h-20" />
      <div className="px-4 pb-2 text-center">
        <Link
          href="/voorwaarden"
          className="text-muted/50 text-[11px] underline underline-offset-2 hover:text-muted transition-colors"
        >
          Voorwaarden · © 2026 BakePilot
        </Link>
      </div>
    </>
  )
}
