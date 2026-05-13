import type { Calculation, Recipe } from './types'

const CALCULATIONS_KEY = 'bakepilot_calculations'
const SELECTED_RECIPE_KEY = 'bakepilot_selected_recipe'
const SELECTED_CALCULATION_KEY = 'bakepilot_selected_calculation'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getSavedCalculations(): Calculation[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(CALCULATIONS_KEY)
    return raw ? (JSON.parse(raw) as Calculation[]) : []
  } catch {
    return []
  }
}

export function saveCalculation(calc: Calculation): void {
  if (!isClient()) return
  const existing = getSavedCalculations()
  const updated = [calc, ...existing.filter((c) => c.id !== calc.id)]
  localStorage.setItem(CALCULATIONS_KEY, JSON.stringify(updated))
}

export function deleteCalculation(id: string): void {
  if (!isClient()) return
  const updated = getSavedCalculations().filter((c) => c.id !== id)
  localStorage.setItem(CALCULATIONS_KEY, JSON.stringify(updated))
}

export function setSelectedRecipe(recipe: Recipe): void {
  if (!isClient()) return
  localStorage.setItem(SELECTED_RECIPE_KEY, JSON.stringify(recipe))
}

export function getSelectedRecipe(): Recipe | null {
  if (!isClient()) return null
  try {
    const raw = localStorage.getItem(SELECTED_RECIPE_KEY)
    return raw ? (JSON.parse(raw) as Recipe) : null
  } catch {
    return null
  }
}

export function clearSelectedRecipe(): void {
  if (!isClient()) return
  localStorage.removeItem(SELECTED_RECIPE_KEY)
}

// ─── Geselecteerde berekening (om in calculator te laden) ──
export function setSelectedCalculation(calc: Calculation): void {
  if (!isClient()) return
  localStorage.setItem(SELECTED_CALCULATION_KEY, JSON.stringify(calc))
}

export function getSelectedCalculation(): Calculation | null {
  if (!isClient()) return null
  try {
    const raw = localStorage.getItem(SELECTED_CALCULATION_KEY)
    return raw ? (JSON.parse(raw) as Calculation) : null
  } catch {
    return null
  }
}

export function clearSelectedCalculation(): void {
  if (!isClient()) return
  localStorage.removeItem(SELECTED_CALCULATION_KEY)
}
