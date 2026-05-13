/**
 * Wachtlijst — verzamel interesse vóór echte launch.
 * Bewaard in localStorage; later vervangen door Supabase tabel.
 */

export type UserSegment = 'hobby' | 'bijverdienste' | 'professioneel' | 'onbekend'

export interface WaitlistEntry {
  id: string
  email: string
  name?: string
  segment?: UserSegment
  joinedAt: string // ISO datum
}

const KEY = 'bakepilot_waitlist'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getWaitlist(): WaitlistEntry[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as WaitlistEntry[]) : []
  } catch {
    return []
  }
}

export function addToWaitlist(entry: Omit<WaitlistEntry, 'id' | 'joinedAt'>): boolean {
  if (!isClient()) return false
  const existing = getWaitlist()
  // Niet dubbel toevoegen op email
  if (existing.some((e) => e.email.toLowerCase() === entry.email.toLowerCase())) {
    return false
  }
  const newEntry: WaitlistEntry = {
    id: `wl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    joinedAt: new Date().toISOString(),
    ...entry,
  }
  localStorage.setItem(KEY, JSON.stringify([...existing, newEntry]))
  return true
}

export function isOnWaitlist(email: string): boolean {
  return getWaitlist().some((e) => e.email.toLowerCase() === email.toLowerCase())
}

export function getWaitlistCount(): number {
  return getWaitlist().length
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
