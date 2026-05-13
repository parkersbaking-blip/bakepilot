export type Unit = 'gram' | 'kg' | 'ml' | 'liter' | 'stuk'

// Aparte eenheid voor de prijsinvoer (€ per …).
// Hierdoor kun je bv. 250g boter invoeren met prijs €2,13 per pakje (€/250g)
// of €0,85 per €/100g, of €8,50 per €/kg — afhankelijk van wat op je bonnetje staat.
export type PriceUnit =
  | 'per_kg'      // €/kg
  | 'per_100g'    // €/100g
  | 'per_g'       // €/g
  | 'per_liter'   // €/L
  | 'per_100ml'   // €/100ml
  | 'per_stuk'    // €/stuk

export type Difficulty = 'Makkelijk' | 'Gemiddeld' | 'Moeilijk'

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: Unit
  pricePerUnit: number
  // Optioneel: per welke eenheid de prijs is. Default afgeleid van `unit`.
  priceUnit?: PriceUnit
  // Bakkerspercentage (bloem = 100). Optioneel, gebruikt door zuurdesem-/broodrecepten.
  bakerPercentage?: number
  // Markeer als zuurdesemstarter (100% hydratatie → splits intern 50/50).
  isStarter?: boolean
}

export interface Recipe {
  id: string
  name: string
  category: string
  subcategory?: string
  baseYield: number
  yieldUnit: string
  ingredients: Ingredient[]
  difficulty: Difficulty
  prepTime: number
  photo?: string
  description?: string
  instructions?: string[]
  fermentation?: string
  baking?: string
  // Voor schaalbare brooddegen: standaard bloemgewicht waarop ingrediënten zijn gebaseerd.
  baseFlourGrams?: number
  // Suggesties voor calculator (overschrijft default als aanwezig)
  activeLaborMinutes?: number
  suggestedPackagingCost?: number
  // Persoonlijke notities (alleen bij eigen recepten)
  notes?: string
}

export interface CalculationResult {
  totalIngredientCost: number
  totalPackagingCost: number
  totalLaborCost: number
  totalCost: number
  costPerPiece: number
  salesPriceExVat: number
  salesPriceInclVat: number
  profitPerPiece: number
  totalProfit: number
}

export interface Calculation {
  id: string
  productName: string
  baseYield: number
  desiredYield: number
  ingredients: Ingredient[]
  packagingCost: number
  laborMinutes: number
  laborCostPerHour: number
  marginPercentage: number
  vatPercentage: number
  result?: CalculationResult
  savedAt: string
}

export interface Label {
  productName: string
  ingredients: string[]
  allergens: string[]
  shelfLifeDays: number
}

// ─── Basis brood-ingrediënten ──────────────────────────────
export type BaseIngredientCategory =
  | 'basis'
  | 'vocht'
  | 'smaak'
  | 'rijsmiddel'
  | 'vetstof'
  | 'zoetstof'
  | 'verrijking'

export interface BaseIngredient {
  id: string
  name: string
  category: BaseIngredientCategory
  defaultBakerPercentage: number
  unit: 'percentage_of_flour'
  defaultPricePerKg?: number
}

// ─── Broodpoeders & broodprofielen ─────────────────────────
// Broodpoeders worden ALTIJD geschaald op bakkerspercentage (bloem = 100%).
// Geen vaste grammen opgeslagen — formule: gram = bloemgewicht × % / 100
export type BreadPowderType = 'verbeteraar' | 'basis-mix'

export interface BreadPowder {
  id: string
  name: string
  category: 'broodpoeder'
  type: BreadPowderType
  defaultBakerPercentage: number
  unit: 'percentage_of_flour'
  usedFor: string[]
  description: string
  // Standaard winkelprijs (€/kg) voor calculatie. Aanpasbaar in calculator.
  defaultPricePerKg?: number
}

export interface BreadProfileSuggestion {
  ingredientId: string
  bakerPercentage: number
  enabledByDefault: boolean
}

export interface BreadProfile {
  id: string
  name: string
  category: string
  suggestedIngredients: BreadProfileSuggestion[]
  examples: string[]
  note?: string
}
