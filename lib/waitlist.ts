/**
 * Wachtlijst — verzamel interesse vóór echte launch.
 * Bewaard in localStorage; later vervangen door Supabase tabel.
 */

export type UserSegment = 'hobby' | 'kleinverkoop' | 'bakkerij' | 'onbekend'

function migrateSegment(value: unknown): UserSegment | undefined {
  if (value === 'bijverdienste') return 'kleinverkoop'
  if (value === 'professioneel') return 'bakkerij'
  if (value === 'hobby' || value === 'kleinverkoop' || value === 'bakkerij' || value === 'onbekend') {
    return value
  }
  return undefined
}

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
    if (!raw) return []
    const entries = JSON.parse(raw) as WaitlistEntry[]
    return entries.map((e) => ({ ...e, segment: migrateSegment(e.segment) }))
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
