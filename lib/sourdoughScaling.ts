import type { Ingredient, Recipe } from './types'

export interface SourdoughTotals {
  // Som van alle bakkerspercentages (incl. starter, zout, etc.)
  totalPercentage: number
  // Bloemgewicht waarop alles is geschaald
  flourGrams: number
  // Totaal deeggewicht (som van alle ingrediënten)
  totalDoughGrams: number
  // Echte hydratatie: (water_in_recept + starter_water) / (bloem_in_recept + starter_bloem)
  realHydration: number
  totalFlourIncStarter: number
  totalWaterIncStarter: number
}

function isFlour(name: string): boolean {
  const n = name.toLowerCase()
  return (
    n.includes('bloem') ||
    n.includes('meel') ||
    n.includes('flour')
  )
}

function isWater(name: string): boolean {
  const n = name.toLowerCase()
  return n === 'water' || n.startsWith('water')
}

/**
 * Schaal ingrediënten op basis van een gewenst bloemgewicht.
 * Gebruikt de bakerPercentage van elk ingrediënt: gram = bloem * % / 100
 */
export function scaleByFlour(
  ingredients: Ingredient[],
  flourGrams: number
): Ingredient[] {
  return ingredients.map((ing) => {
    if (ing.bakerPercentage == null) return ing
    return {
      ...ing,
      quantity: Math.round((flourGrams * ing.bakerPercentage) / 100),
    }
  })
}

/**
 * Bereken het bloemgewicht dat nodig is voor een gewenst totaal deeggewicht.
 * totalPercentage is de som van alle bakerPercentage waarden.
 */
export function flourFromTotalDough(
  totalDoughGrams: number,
  totalPercentage: number
): number {
  if (totalPercentage <= 0) return 0
  return totalDoughGrams / (totalPercentage / 100)
}

/**
 * Schaal naar een gewenst totaal deeggewicht.
 */
export function scaleByTotalDough(
  ingredients: Ingredient[],
  totalDoughGrams: number
): Ingredient[] {
  const totalPct = ingredients.reduce(
    (sum, i) => sum + (i.bakerPercentage ?? 0),
    0
  )
  const flour = flourFromTotalDough(totalDoughGrams, totalPct)
  return scaleByFlour(ingredients, flour)
}

/**
 * Bereken totalen incl. correcte hydratatie. Starter (100% hydr.) wordt 50/50 gesplitst.
 */
export function computeSourdoughTotals(
  ingredients: Ingredient[],
  flourGrams: number
): SourdoughTotals {
  let recipeFlour = 0
  let recipeWater = 0
  let starterGrams = 0
  let totalDough = 0
  let totalPct = 0

  for (const ing of ingredients) {
    const grams = ing.bakerPercentage != null
      ? (flourGrams * ing.bakerPercentage) / 100
      : ing.quantity
    totalDough += grams
    totalPct += ing.bakerPercentage ?? 0

    if (ing.isStarter) {
      starterGrams += grams
    } else if (isFlour(ing.name)) {
      recipeFlour += grams
    } else if (isWater(ing.name)) {
      recipeWater += grams
    }
  }

  const starterFlour = starterGrams / 2
  const starterWater = starterGrams / 2
  const totalFlourIncStarter = recipeFlour + starterFlour
  const totalWaterIncStarter = recipeWater + starterWater
  const realHydration =
    totalFlourIncStarter > 0
      ? (totalWaterIncStarter / totalFlourIncStarter) * 100
      : 0

  return {
    totalPercentage: totalPct,
    flourGrams,
    totalDoughGrams: Math.round(totalDough),
    realHydration: Math.round(realHydration * 10) / 10,
    totalFlourIncStarter: Math.round(totalFlourIncStarter),
    totalWaterIncStarter: Math.round(totalWaterIncStarter),
  }
}

/**
 * Helper: schaal een heel recept naar een nieuw bloemgewicht.
 */
export function scaleRecipeByFlour(recipe: Recipe, flourGrams: number): Recipe {
  return {
    ...recipe,
    ingredients: scaleByFlour(recipe.ingredients, flourGrams),
    baseFlourGrams: flourGrams,
  }
}

/**
 * Helper: schaal een recept op basis van het aantal broden.
 * Gaat uit van baseYield = aantal broden bij baseFlourGrams.
 */
export function scaleRecipeByLoaves(recipe: Recipe, loaves: number): Recipe {
  if (!recipe.baseFlourGrams || recipe.baseYield <= 0) return recipe
  const flourPerLoaf = recipe.baseFlourGrams / recipe.baseYield
  return scaleRecipeByFlour(recipe, flourPerLoaf * loaves)
}
