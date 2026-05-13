/**
 * Pro-status storage. Voor nu een lokale flag in localStorage zodat we de
 * paywall kunnen testen. Bij echte uitrol vervang je dit door een check
 * tegen je auth/abonnement systeem (bv. Stripe customer status).
 */

const PRO_KEY = 'bakepilot_pro_user'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function isProUser(): boolean {
  if (!isClient()) return false
  try {
    return localStorage.getItem(PRO_KEY) === 'true'
  } catch {
    return false
  }
}

export function setProUser(active: boolean): void {
  if (!isClient()) return
  try {
    localStorage.setItem(PRO_KEY, active ? 'true' : 'false')
  } catch {
    /* no-op */
  }
}
