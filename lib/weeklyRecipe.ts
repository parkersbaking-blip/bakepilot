/**
 * Recept van de Week — kiest automatisch een recept op basis van het
 * huidige ISO-weeknummer en het Nederlandse bakkalender-seizoen.
 *
 * Roteert door alle beschikbare starter-recepten — zelfde week → zelfde recept.
 */

import { STARTER_RECIPES } from './recipes'
import type { Recipe } from './types'

/**
 * Bereken het ISO-weeknummer (1-53) voor een gegeven datum.
 */
export function getISOWeek(date: Date = new Date()): number {
  const target = new Date(date.valueOf())
  const dayNr = (date.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3)
  const firstThursday = target.valueOf()
  target.setMonth(0, 1)
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7)
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
}

/**
 * Seizoens-mapping: welke recepten passen bij welke periodes.
 * Gebruikt ISO-weeknummers (1-52).
 */
const SEASONAL_PREFERENCES: Record<number, string[]> = {
  // Winter (wk 1-9) — kerst-naverwerking, simpel comfortbrood
  1: ['krentenbollen', 'cake', 'koffiebroodjes'],
  2: ['zd-basis', 'cake', 'gevulde-koek'],
  3: ['zd-rustiek', 'koffiebroodjes'],
  4: ['gevulde-koek', 'zd-basis'],
  5: ['cake', 'zd-basis'],
  6: ['cake', 'gevulde-koek'],
  7: ['krentenbollen', 'koffiebroodjes'],
  8: ['zd-rustiek', 'cake'],
  9: ['gevulde-koek', 'zd-basis'],

  // Lente (wk 10-21) — Pasen rond wk 13-16, vrolijke broden
  10: ['cake', 'cinnamon-rolls'],
  11: ['cinnamon-rolls', 'koffiebroodjes'],
  12: ['krentenbollen', 'cinnamon-rolls'],
  13: ['krentenbollen', 'zd-rustiek'], // Pasen-week vaak
  14: ['krentenbollen', 'gevulde-koek'],
  15: ['cake', 'zd-basis'],
  16: ['cake', 'cinnamon-rolls'],
  17: ['zd-high-hydration', 'koffiebroodjes'],
  18: ['cake', 'zd-rustiek'],
  19: ['cinnamon-rolls', 'cake'],
  20: ['zd-basis', 'koffiebroodjes'],
  21: ['cake', 'gevulde-koek'],

  // Zomer (wk 22-35) — luchtig, vruchten
  22: ['cake', 'cinnamon-rolls'],
  23: ['zd-high-hydration', 'cake'],
  24: ['cake', 'zd-basis'],
  25: ['cinnamon-rolls', 'koffiebroodjes'],
  26: ['cake', 'zd-rustiek'],
  27: ['zd-high-hydration', 'cake'],
  28: ['cake', 'cinnamon-rolls'],
  29: ['gevulde-koek', 'cake'],
  30: ['cake', 'koffiebroodjes'],
  31: ['zd-rustiek', 'cake'],
  32: ['cake', 'gevulde-koek'],
  33: ['cinnamon-rolls', 'zd-basis'],
  34: ['cake', 'koffiebroodjes'],
  35: ['cake', 'zd-rustiek'],

  // Herfst (wk 36-48) — appel, kaneel, comfort
  36: ['appeltaart', 'cake'],
  37: ['appeltaart', 'cinnamon-rolls'],
  38: ['cinnamon-rolls', 'appeltaart'],
  39: ['appeltaart', 'gevulde-koek'],
  40: ['appeltaart', 'zd-rustiek'], // 4 oktober = Kanelbullens dag!
  41: ['cinnamon-rolls', 'appeltaart'],
  42: ['gevulde-koek', 'appeltaart'],
  43: ['zd-rustiek', 'krentenbollen'],
  44: ['krentenbollen', 'gevulde-koek'],
  45: ['gevulde-koek', 'cake'],
  46: ['zd-basis', 'koffiebroodjes'],
  47: ['gevulde-koek', 'krentenbollen'],
  48: ['krentenbollen', 'zd-rustiek'],

  // Winter (wk 49-52) — feestdagen, krenten, oliebollen
  49: ['krentenbollen', 'gevulde-koek'],
  50: ['krentenbollen', 'cinnamon-rolls'],
  51: ['krentenbollen', 'gevulde-koek'], // Kerst-week
  52: ['cake', 'krentenbollen'],
  53: ['krentenbollen', 'zd-basis'], // Schrikkel-week
}

/**
 * Geef het recept van deze week terug.
 * Roteert op basis van het ISO-weeknummer + seizoensvoorkeur.
 */
export function getWeeklyRecipe(date: Date = new Date()): Recipe | null {
  const week = getISOWeek(date)
  const preferred = SEASONAL_PREFERENCES[week] ?? []

  // Probeer eerst seizoens-voorkeur
  for (const id of preferred) {
    const r = STARTER_RECIPES.find((r) => r.id === id)
    if (r) return r
  }

  // Fallback: roteer door alle recepten
  if (STARTER_RECIPES.length === 0) return null
  const index = week % STARTER_RECIPES.length
  return STARTER_RECIPES[index]
}

/**
 * Geef de korte weekinfo terug (week-nummer + jaar).
 */
export function getWeekLabel(date: Date = new Date()): string {
  const week = getISOWeek(date)
  return `Week ${week}, ${date.getFullYear()}`
}
