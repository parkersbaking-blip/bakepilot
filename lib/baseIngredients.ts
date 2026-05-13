import type { BaseIngredient } from './types'

/**
 * Basis brood-ingrediënten — beschikbaar voor zowel gratis als Pro gebruikers.
 *
 * Net als broodpoeders: GEEN vaste grammen, alleen bakkerspercentages.
 * Schaling: gram = bloemgewicht × bakerPercentage / 100
 */
export const BASE_INGREDIENTS: BaseIngredient[] = [
  {
    id: 'tarwebloem',
    name: 'Tarwebloem',
    category: 'basis',
    defaultBakerPercentage: 100,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 1.20,
  },
  {
    id: 'water',
    name: 'Water',
    category: 'vocht',
    defaultBakerPercentage: 58,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 0,
  },
  {
    id: 'zout',
    name: 'Zout',
    category: 'smaak',
    defaultBakerPercentage: 2,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 0.80,
  },
  {
    id: 'verse-gist',
    name: 'Verse gist',
    category: 'rijsmiddel',
    defaultBakerPercentage: 2,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 4.50,
  },
  {
    id: 'droge-gist',
    name: 'Droge gist / instant gist',
    category: 'rijsmiddel',
    defaultBakerPercentage: 0.7,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 15.00,
  },
  {
    id: 'boter',
    name: 'Boter',
    category: 'vetstof',
    defaultBakerPercentage: 5,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 8.50,
  },
  {
    id: 'suiker',
    name: 'Suiker',
    category: 'zoetstof',
    defaultBakerPercentage: 3,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 1.00,
  },
  {
    id: 'melk',
    name: 'Melk',
    category: 'vocht',
    defaultBakerPercentage: 60,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 1.10,
  },
  {
    id: 'ei',
    name: 'Ei',
    category: 'verrijking',
    defaultBakerPercentage: 10,
    unit: 'percentage_of_flour',
    defaultPricePerKg: 7.00,
  },
]

export function getBaseIngredientById(id: string): BaseIngredient | undefined {
  return BASE_INGREDIENTS.find((i) => i.id === id)
}

/**
 * Bereken gram op basis van bloemgewicht.
 * Formule: gram = bloemgewicht × bakerPercentage / 100
 */
export function calculateBaseIngredientGrams(
  flourWeightGrams: number,
  bakerPercentage: number
): number {
  if (flourWeightGrams <= 0 || bakerPercentage <= 0) return 0
  return Math.round((flourWeightGrams * bakerPercentage) / 100)
}
