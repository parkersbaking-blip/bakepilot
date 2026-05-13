/**
 * EU-conforme etiketten generator volgens verordening 1169/2011 (FIC).
 *
 * BELANGRIJK: dit is een hulpmiddel. De bakker blijft eindverantwoordelijk
 * voor juiste declaratie. Altijd controleren met actuele wetgeving.
 */

import type { Ingredient } from './types'

// 14 verplichte EU-allergenen volgens verordening 1169/2011 bijlage II
export const EU_ALLERGENS = [
  { id: 'gluten', label: 'Gluten', keywords: ['tarwe', 'rogge', 'gerst', 'haver', 'spelt', 'kamut', 'bloem', 'meel', 'griesmeel'] },
  { id: 'schaaldieren', label: 'Schaaldieren', keywords: ['garnaal', 'krab', 'kreeft', 'rivierkreeft'] },
  { id: 'eieren', label: 'Eieren', keywords: ['ei', 'eiwit', 'eidooier', 'eipoeder'] },
  { id: 'vis', label: 'Vis', keywords: ['vis', 'ansjovis', 'haring', 'zalm', 'tonijn'] },
  { id: 'pinda', label: "Pinda's", keywords: ['pinda', 'arachide'] },
  { id: 'soja', label: 'Soja', keywords: ['soja', 'sojaolie', 'sojamelk', 'lecithine van soja', 'tofu'] },
  { id: 'melk', label: 'Melk (incl. lactose)', keywords: ['melk', 'boter', 'kaas', 'room', 'yoghurt', 'karnemelk', 'wei'] },
  { id: 'noten', label: 'Noten', keywords: ['amandel', 'hazelnoot', 'walnoot', 'cashew', 'pecan', 'paranoot', 'pistache', 'macadamia'] },
  { id: 'selderij', label: 'Selderij', keywords: ['selderij', 'bleekselderij', 'knolselderij'] },
  { id: 'mosterd', label: 'Mosterd', keywords: ['mosterd'] },
  { id: 'sesam', label: 'Sesam', keywords: ['sesam', 'sesamzaad', 'tahini'] },
  { id: 'sulfiet', label: 'Zwaveldioxide & sulfieten', keywords: ['sulfiet', 'zwaveldioxide', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'] },
  { id: 'lupine', label: 'Lupine', keywords: ['lupine'] },
  { id: 'weekdier', label: 'Weekdieren', keywords: ['weekdier', 'mossel', 'oester', 'inktvis', 'octopus'] },
] as const

export type AllergenId = typeof EU_ALLERGENS[number]['id']

export interface LabelInput {
  productName: string
  bakeryName?: string
  bakeryAddress?: string
  ingredients: Ingredient[]
  manualAllergens?: AllergenId[] // door gebruiker handmatig aangevinkt
  netWeight?: string
  shelfLifeDays?: number
  productionDate?: string // YYYY-MM-DD
  lotNumber?: string
}

export interface DetectedAllergen {
  id: AllergenId
  label: string
  triggeredBy: string[] // ingredient names die de detectie veroorzaakten
}

/**
 * Detecteer allergenen automatisch op basis van ingredient-namen.
 * Niet 100% sluitend — maar handig als hulpmiddel.
 */
export function detectAllergens(ingredients: Ingredient[]): DetectedAllergen[] {
  const detected: DetectedAllergen[] = []
  for (const allergen of EU_ALLERGENS) {
    const triggers: string[] = []
    for (const ing of ingredients) {
      const name = ing.name.toLowerCase()
      if (allergen.keywords.some((k) => name.includes(k))) {
        triggers.push(ing.name)
      }
    }
    if (triggers.length > 0) {
      detected.push({
        id: allergen.id,
        label: allergen.label,
        triggeredBy: triggers,
      })
    }
  }
  return detected
}

/**
 * Sorteer ingrediënten op gewicht (aflopend) — verplicht volgens FIC.
 * Eieren in stuks krijgen ~50g per stuk geschat.
 */
function ingredientWeightInGrams(ing: Ingredient): number {
  if (ing.unit === 'kg') return ing.quantity * 1000
  if (ing.unit === 'liter') return ing.quantity * 1000
  if (ing.unit === 'stuk') return ing.quantity * 50 // schatting voor eieren etc.
  return ing.quantity
}

export function sortIngredientsByWeight(ingredients: Ingredient[]): Ingredient[] {
  return [...ingredients].sort(
    (a, b) => ingredientWeightInGrams(b) - ingredientWeightInGrams(a)
  )
}

/**
 * Maak een ingrediëntenlijst met allergenen vetgedrukt (volgens FIC).
 * Output is HTML-fragment met <strong> rondom allergenen.
 */
export function buildIngredientListHTML(
  ingredients: Ingredient[]
): string {
  const sorted = sortIngredientsByWeight(ingredients)
  const detected = detectAllergens(ingredients)
  const allergenIngredientNames = new Set(
    detected.flatMap((d) => d.triggeredBy.map((n) => n.toLowerCase()))
  )

  return sorted
    .map((ing) => {
      const isAllergen = allergenIngredientNames.has(ing.name.toLowerCase())
      return isAllergen ? `<strong>${ing.name}</strong>` : ing.name
    })
    .join(', ')
}

/**
 * Bereken THT-datum op basis van productiedatum + houdbaarheid.
 */
export function calculateBestBeforeDate(
  productionDate: string,
  shelfLifeDays: number
): string {
  const date = new Date(productionDate)
  date.setDate(date.getDate() + shelfLifeDays)
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Genereer automatisch een lot-/batchnummer op basis van datum.
 * Format: YYMMDD-NNN (jaar-maand-dag + volgnummer)
 */
export function generateLotNumber(productionDate?: string): string {
  const date = productionDate ? new Date(productionDate) : new Date()
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `${yy}${mm}${dd}-${seq}`
}
