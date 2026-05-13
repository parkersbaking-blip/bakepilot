/**
 * Eigen recepten van de gebruiker (lokaal opgeslagen).
 * Hetzelfde format als STARTER_RECIPES, maar krijgt een 'isCustom: true' flag.
 */
import type { Recipe } from './types'

const KEY = 'bakepilot_custom_recipes'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getCustomRecipes(): Recipe[] {
  if (!isClient()) return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Recipe[]) : []
  } catch {
    return []
  }
}

export function saveCustomRecipe(recipe: Recipe): void {
  if (!isClient()) return
  const existing = getCustomRecipes()
  // Vervang bestaand recept met dezelfde id, of voeg toe
  const updated = [
    recipe,
    ...existing.filter((r) => r.id !== recipe.id),
  ]
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function deleteCustomRecipe(id: string): void {
  if (!isClient()) return
  const updated = getCustomRecipes().filter((r) => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(updated))
}

export function getCustomRecipeById(id: string): Recipe | undefined {
  return getCustomRecipes().find((r) => r.id === id)
}

export function isCustomRecipeId(id: string): boolean {
  return id.startsWith('custom-')
}

export function newCustomRecipeId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
