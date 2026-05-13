import type { Ingredient, Calculation, CalculationResult, Unit, PriceUnit } from './types'

/**
 * Default-prijs-eenheid per hoeveelheids-eenheid (voor terugwaartse compatibiliteit).
 */
function defaultPriceUnit(unit: Unit): PriceUnit {
  switch (unit) {
    case 'gram':
    case 'kg':
      return 'per_kg'
    case 'ml':
    case 'liter':
      return 'per_liter'
    case 'stuk':
      return 'per_stuk'
  }
}

/**
 * Zet hoeveelheid om naar de basis-eenheid van de prijs.
 * Bv. 250 gram → 0.25 kg, of 250 gram → 2.5 (eenheden van 100g)
 */
function quantityInPriceUnit(qty: number, qtyUnit: Unit, priceUnit: PriceUnit): number {
  // Eerst alles naar de basis (g, ml, of stuk)
  let qtyBase = qty
  if (qtyUnit === 'kg') qtyBase = qty * 1000        // → g
  if (qtyUnit === 'liter') qtyBase = qty * 1000     // → ml
  // (gram, ml, stuk blijven zoals ze zijn)

  switch (priceUnit) {
    case 'per_kg':     return qtyBase / 1000   // g → kg
    case 'per_100g':   return qtyBase / 100    // g → 100g eenheden
    case 'per_g':      return qtyBase          // g → g
    case 'per_liter':  return qtyBase / 1000   // ml → L
    case 'per_100ml':  return qtyBase / 100    // ml → 100ml eenheden
    case 'per_stuk':   return qtyBase          // stuk → stuk
  }
}

function calcIngredientCost(ingredient: Ingredient, scaledQty: number): number {
  const priceUnit = ingredient.priceUnit ?? defaultPriceUnit(ingredient.unit)
  const qty = quantityInPriceUnit(scaledQty, ingredient.unit, priceUnit)
  return qty * ingredient.pricePerUnit
}

export function calculate(
  calc: Omit<Calculation, 'id' | 'savedAt' | 'result'>
): CalculationResult {
  if (calc.baseYield <= 0 || calc.desiredYield <= 0) {
    return {
      totalIngredientCost: 0,
      totalPackagingCost: 0,
      totalLaborCost: 0,
      totalCost: 0,
      costPerPiece: 0,
      salesPriceExVat: 0,
      salesPriceInclVat: 0,
      profitPerPiece: 0,
      totalProfit: 0,
    }
  }

  const scaleFactor = calc.desiredYield / calc.baseYield

  const totalIngredientCost = calc.ingredients.reduce((sum, ing) => {
    const scaledQty = ing.quantity * scaleFactor
    return sum + calcIngredientCost(ing, scaledQty)
  }, 0)

  const totalPackagingCost = calc.desiredYield * calc.packagingCost
  const totalLaborCost = (calc.laborMinutes / 60) * calc.laborCostPerHour
  const totalCost = totalIngredientCost + totalPackagingCost + totalLaborCost
  const costPerPiece = totalCost / calc.desiredYield

  const marginFactor = 1 - calc.marginPercentage / 100
  const salesPriceExVat = marginFactor > 0 ? costPerPiece / marginFactor : 0
  const salesPriceInclVat = salesPriceExVat * (1 + calc.vatPercentage / 100)
  const profitPerPiece = salesPriceExVat - costPerPiece
  const totalProfit = profitPerPiece * calc.desiredYield

  return {
    totalIngredientCost,
    totalPackagingCost,
    totalLaborCost,
    totalCost,
    costPerPiece,
    salesPriceExVat,
    salesPriceInclVat,
    profitPerPiece,
    totalProfit,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
