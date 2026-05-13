/**
 * Gebruikers-instellingen.
 * Worden gebruikt als default-waardes in de calculator zodat de gebruiker
 * niet bij elke berekening uurloon, BTW, marge etc. opnieuw hoeft in te vullen.
 *
 * Opslag: localStorage (key: bakepilot_settings).
 */

export type UserType = 'hobby' | 'side-hustle' | 'professional'
export type BakingFrequency = 'dagelijks' | 'wekelijks' | 'maandelijks' | 'incidenteel'

export interface UserSettings {
  bakeryName: string
  laborCostPerHour: number
  marginPercentage: number
  vatPercentage: number
  packagingCost: number
  // Profielinformatie uit onboarding
  userType?: UserType
  bakingFrequency?: BakingFrequency
}

const SETTINGS_KEY = 'bakepilot_settings'

export const DEFAULT_SETTINGS: UserSettings = {
  bakeryName: '',
  laborCostPerHour: 15,
  marginPercentage: 40,
  vatPercentage: 9,
  packagingCost: 0.10,
}

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getSettings(): UserSettings {
  if (!isClient()) return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<UserSettings>
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<UserSettings>): void {
  if (!isClient()) return
  const current = getSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
}

export function resetSettings(): void {
  if (!isClient()) return
  localStorage.removeItem(SETTINGS_KEY)
}
