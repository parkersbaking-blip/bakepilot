/**
 * Houdt bij of de gebruiker de welkomst-flow al heeft afgerond.
 */
const KEY = 'bakepilot_onboarded'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function isOnboarded(): boolean {
  if (!isClient()) return true // server-side: altijd 'klaar'
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    return true
  }
}

export function setOnboarded(): void {
  if (!isClient()) return
  try {
    localStorage.setItem(KEY, 'true')
  } catch {
    /* no-op */
  }
}
