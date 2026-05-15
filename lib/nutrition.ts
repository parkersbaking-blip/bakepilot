/**
 * Voedingswaarde-database + berekening voor EU-conforme etiketten
 * volgens verordening 1169/2011 (FIC) bijlage XV.
 *
 * Waarden per 100g zijn standaard referentiewaarden voor ruwe
 * grondstoffen. Voor de meeste basisingrediënten zijn deze breed
 * gedocumenteerd en consistent — dit geeft een solide uitgangspunt
 * voor thuisbakkers en kleine bakkerijen.
 *
 * ⚠️  De bakker blijft eindverantwoordelijk voor wat op het etiket
 * komt. Voor commerciële verkoop op grote schaal raden we lab-analyse
 * van het eindproduct aan.
 */

import type { Ingredient } from './types'

/** Voedingswaarden per 100g grondstof. Allen in g, behalve energie. */
export interface NutritionPer100g {
  energyKcal: number
  energyKj: number
  fat: number
  saturatedFat: number
  carbs: number
  sugars: number
  protein: number
  salt: number
  fiber?: number
}

/** Resultaat per 100g van het hele recept. */
export interface RecipeNutrition extends NutritionPer100g {
  /** Hoeveel ingrediënten konden we matchen? */
  matchedCount: number
  /** Hoeveel niet gevonden? Toont de bakker dat 'ie iets moet aanvullen. */
  unmatchedIngredients: string[]
  /** Totaalgewicht recept in gram (voor info-vermelding). */
  totalWeightGrams: number
}

interface NutritionEntry extends NutritionPer100g {
  /** Naam zoals 'ie in onze database staat (kanonieke naam). */
  canonicalName: string
  /** Synoniemen / herkenning-keywords (lowercase). */
  keywords: string[]
  /** Dichtheid in g/ml — voor ingrediënten die in ml staan. Default 1.0. */
  densityGperMl?: number
  /** Standaardgewicht voor 'stuk' (bv. 1 ei = 60g). */
  gramsPerStuk?: number
}

/**
 * Database met ±40 meest-gebruikte bak-ingrediënten.
 * Waarden per 100g eetbaar deel.
 */
const DATABASE: NutritionEntry[] = [
  // ───────────── BLOEM & MEEL ─────────────
  {
    canonicalName: 'Tarwebloem (patentbloem)',
    keywords: ['tarwebloem', 'patentbloem', 'bloem', 'witte bloem', 'sterke tarwebloem'],
    energyKcal: 343, energyKj: 1456,
    fat: 1.0, saturatedFat: 0.2,
    carbs: 71, sugars: 0.6,
    protein: 11, salt: 0.01, fiber: 3.0,
  },
  {
    canonicalName: 'Volkorenmeel',
    keywords: ['volkorenmeel', 'volkoren', 'tarwemeel volkoren'],
    energyKcal: 339, energyKj: 1438,
    fat: 2.5, saturatedFat: 0.4,
    carbs: 65, sugars: 1.6,
    protein: 13, salt: 0.01, fiber: 10.7,
  },
  {
    canonicalName: 'Roggemeel',
    keywords: ['roggemeel', 'rogge'],
    energyKcal: 338, energyKj: 1432,
    fat: 1.5, saturatedFat: 0.2,
    carbs: 69, sugars: 1.0,
    protein: 11, salt: 0.01, fiber: 13.2,
  },
  {
    canonicalName: 'Speltmeel',
    keywords: ['spelt', 'speltmeel', 'speltbloem'],
    energyKcal: 338, energyKj: 1432,
    fat: 2.5, saturatedFat: 0.4,
    carbs: 65, sugars: 1.6,
    protein: 14, salt: 0.01, fiber: 10.0,
  },
  {
    canonicalName: 'Maizena (maïszetmeel)',
    keywords: ['maizena', 'maïszetmeel', 'maïsmeel', 'maizenameel'],
    energyKcal: 381, energyKj: 1610,
    fat: 0.1, saturatedFat: 0,
    carbs: 91, sugars: 0,
    protein: 0.3, salt: 0.01,
  },
  {
    canonicalName: 'Havermout',
    keywords: ['havermout', 'haver', 'haverkorrels', 'havervlokken'],
    energyKcal: 379, energyKj: 1606,
    fat: 7.0, saturatedFat: 1.2,
    carbs: 60, sugars: 1.1,
    protein: 13, salt: 0.01, fiber: 10.0,
  },

  // ───────────── SUIKERS ─────────────
  {
    canonicalName: 'Kristalsuiker',
    keywords: ['suiker', 'kristalsuiker', 'witte suiker', 'fijne kristalsuiker'],
    energyKcal: 400, energyKj: 1700,
    fat: 0, saturatedFat: 0,
    carbs: 100, sugars: 100,
    protein: 0, salt: 0,
  },
  {
    canonicalName: 'Basterdsuiker (wit)',
    keywords: ['basterdsuiker', 'witte basterdsuiker'],
    energyKcal: 396, energyKj: 1682,
    fat: 0, saturatedFat: 0,
    carbs: 99, sugars: 99,
    protein: 0, salt: 0,
  },
  {
    canonicalName: 'Bruine suiker',
    keywords: ['bruine suiker', 'donkere basterdsuiker', 'rietsuiker'],
    energyKcal: 380, energyKj: 1614,
    fat: 0, saturatedFat: 0,
    carbs: 97, sugars: 96,
    protein: 0.1, salt: 0.03,
  },
  {
    canonicalName: 'Poedersuiker',
    keywords: ['poedersuiker', 'icingsugar', 'icing sugar', 'banketbakkerssuiker'],
    energyKcal: 400, energyKj: 1700,
    fat: 0, saturatedFat: 0,
    carbs: 100, sugars: 100,
    protein: 0, salt: 0,
  },
  {
    canonicalName: 'Honing',
    keywords: ['honing'],
    energyKcal: 304, energyKj: 1290,
    fat: 0, saturatedFat: 0,
    carbs: 82, sugars: 82,
    protein: 0.3, salt: 0.01,
    densityGperMl: 1.42,
  },
  {
    canonicalName: 'Ahornsiroop',
    keywords: ['ahornsiroop', 'maple syrup', 'esdoornsiroop'],
    energyKcal: 260, energyKj: 1103,
    fat: 0.1, saturatedFat: 0,
    carbs: 67, sugars: 60,
    protein: 0, salt: 0.03,
    densityGperMl: 1.32,
  },

  // ───────────── VETTEN ─────────────
  {
    canonicalName: 'Roomboter (ongezouten)',
    keywords: ['boter', 'roomboter', 'ongezouten boter', 'ongezouten roomboter'],
    energyKcal: 717, energyKj: 2950,
    fat: 81, saturatedFat: 51,
    carbs: 0.7, sugars: 0.7,
    protein: 0.85, salt: 0.05,
  },
  {
    canonicalName: 'Roomboter (gezouten)',
    keywords: ['gezouten boter', 'gezouten roomboter'],
    energyKcal: 717, energyKj: 2950,
    fat: 81, saturatedFat: 51,
    carbs: 0.7, sugars: 0.7,
    protein: 0.85, salt: 1.55,
  },
  {
    canonicalName: 'Margarine (80% vet)',
    keywords: ['margarine', 'becel', 'blue band'],
    energyKcal: 700, energyKj: 2882,
    fat: 80, saturatedFat: 16,
    carbs: 0.4, sugars: 0.4,
    protein: 0.2, salt: 0.8,
  },
  {
    canonicalName: 'Zonnebloemolie',
    keywords: ['zonnebloemolie', 'plantaardige olie', 'bakolie'],
    energyKcal: 884, energyKj: 3640,
    fat: 100, saturatedFat: 11,
    carbs: 0, sugars: 0,
    protein: 0, salt: 0,
    densityGperMl: 0.92,
  },
  {
    canonicalName: 'Olijfolie',
    keywords: ['olijfolie'],
    energyKcal: 884, energyKj: 3640,
    fat: 100, saturatedFat: 14,
    carbs: 0, sugars: 0,
    protein: 0, salt: 0,
    densityGperMl: 0.92,
  },

  // ───────────── ZUIVEL ─────────────
  {
    canonicalName: 'Volle melk',
    keywords: ['volle melk', 'melk'],
    energyKcal: 64, energyKj: 268,
    fat: 3.5, saturatedFat: 2.3,
    carbs: 4.8, sugars: 4.8,
    protein: 3.4, salt: 0.1,
    densityGperMl: 1.03,
  },
  {
    canonicalName: 'Halfvolle melk',
    keywords: ['halfvolle melk'],
    energyKcal: 47, energyKj: 198,
    fat: 1.5, saturatedFat: 1.0,
    carbs: 4.8, sugars: 4.8,
    protein: 3.5, salt: 0.1,
    densityGperMl: 1.03,
  },
  {
    canonicalName: 'Karnemelk',
    keywords: ['karnemelk'],
    energyKcal: 38, energyKj: 161,
    fat: 0.5, saturatedFat: 0.3,
    carbs: 4.0, sugars: 4.0,
    protein: 3.5, salt: 0.1,
    densityGperMl: 1.03,
  },
  {
    canonicalName: 'Slagroom (35% vet)',
    keywords: ['slagroom', 'room'],
    energyKcal: 345, energyKj: 1419,
    fat: 35, saturatedFat: 22,
    carbs: 3.0, sugars: 3.0,
    protein: 2.0, salt: 0.07,
    densityGperMl: 0.99,
  },
  {
    canonicalName: 'Volle yoghurt',
    keywords: ['yoghurt', 'volle yoghurt'],
    energyKcal: 60, energyKj: 251,
    fat: 3.2, saturatedFat: 2.1,
    carbs: 4.5, sugars: 4.5,
    protein: 3.3, salt: 0.1,
    densityGperMl: 1.03,
  },
  {
    canonicalName: 'Magere kwark',
    keywords: ['kwark', 'magere kwark'],
    energyKcal: 60, energyKj: 254,
    fat: 0.2, saturatedFat: 0.1,
    carbs: 4.0, sugars: 4.0,
    protein: 11, salt: 0.1,
  },

  // ───────────── EI ─────────────
  // Standaard ei: 60g (kip, klasse M)
  {
    canonicalName: 'Heel ei',
    keywords: ['ei', 'eieren', 'kippenei', 'kippeneieren', 'eipoeder', 'heel ei'],
    energyKcal: 143, energyKj: 599,
    fat: 9.5, saturatedFat: 3.0,
    carbs: 0.7, sugars: 0.7,
    protein: 12.5, salt: 0.3,
    gramsPerStuk: 60,
  },
  {
    canonicalName: 'Eiwit',
    keywords: ['eiwit', 'eiwitten'],
    energyKcal: 50, energyKj: 211,
    fat: 0, saturatedFat: 0,
    carbs: 0.7, sugars: 0.7,
    protein: 11, salt: 0.4,
    gramsPerStuk: 35,
  },
  {
    canonicalName: 'Eidooier',
    keywords: ['eidooier', 'dooier', 'eigeel'],
    energyKcal: 322, energyKj: 1336,
    fat: 27, saturatedFat: 9,
    carbs: 3.6, sugars: 0.6,
    protein: 16, salt: 0.13,
    gramsPerStuk: 18,
  },

  // ───────────── GIST & RIJSMIDDEL ─────────────
  {
    canonicalName: 'Verse gist',
    keywords: ['verse gist', 'gist vers'],
    energyKcal: 105, energyKj: 440,
    fat: 1.5, saturatedFat: 0.2,
    carbs: 17, sugars: 0,
    protein: 12, salt: 0.05,
  },
  {
    canonicalName: 'Gedroogde gist',
    keywords: ['gedroogde gist', 'gist gedroogd', 'gist (gedroogd)', 'instant gist'],
    energyKcal: 295, energyKj: 1234,
    fat: 7, saturatedFat: 1,
    carbs: 41, sugars: 0,
    protein: 40, salt: 0.2,
  },
  {
    canonicalName: 'Bakpoeder',
    keywords: ['bakpoeder', 'rijzend bakpoeder'],
    energyKcal: 53, energyKj: 222,
    fat: 0, saturatedFat: 0,
    carbs: 28, sugars: 0,
    protein: 0, salt: 26,
  },
  {
    canonicalName: 'Baking soda',
    keywords: ['baking soda', 'zuiveringszout', 'natriumbicarbonaat'],
    energyKcal: 0, energyKj: 0,
    fat: 0, saturatedFat: 0,
    carbs: 0, sugars: 0,
    protein: 0, salt: 72,
  },

  // ───────────── KRUIDEN & SMAAKMAKERS ─────────────
  {
    canonicalName: 'Zout',
    keywords: ['zout', 'keukenzout', 'zeezout', 'tafelzout'],
    energyKcal: 0, energyKj: 0,
    fat: 0, saturatedFat: 0,
    carbs: 0, sugars: 0,
    protein: 0, salt: 100,
  },
  {
    canonicalName: 'Kaneel',
    keywords: ['kaneel', 'kaneelpoeder'],
    energyKcal: 247, energyKj: 1035,
    fat: 1.2, saturatedFat: 0.3,
    carbs: 81, sugars: 2.2,
    protein: 4.0, salt: 0.03, fiber: 53,
  },
  {
    canonicalName: 'Vanille-extract',
    keywords: ['vanille', 'vanille-extract', 'vanille extract', 'vanillesuiker'],
    energyKcal: 288, energyKj: 1209,
    fat: 0.1, saturatedFat: 0,
    carbs: 13, sugars: 13,
    protein: 0.1, salt: 0.03,
  },
  {
    canonicalName: 'Cacaopoeder (puur)',
    keywords: ['cacaopoeder', 'cacao', 'pure cacao'],
    energyKcal: 228, energyKj: 956,
    fat: 14, saturatedFat: 8.1,
    carbs: 58, sugars: 1.8,
    protein: 19, salt: 0.05, fiber: 33,
  },

  // ───────────── CHOCOLADE ─────────────
  {
    canonicalName: 'Pure chocolade (70%)',
    keywords: ['pure chocolade', 'pure choc', 'donkere chocolade', 'chocolade puur'],
    energyKcal: 580, energyKj: 2422,
    fat: 41, saturatedFat: 24,
    carbs: 46, sugars: 27,
    protein: 7.8, salt: 0.02,
  },
  {
    canonicalName: 'Melkchocolade',
    keywords: ['melkchocolade', 'melk chocolade', 'chocolade melk'],
    energyKcal: 535, energyKj: 2240,
    fat: 30, saturatedFat: 18,
    carbs: 59, sugars: 52,
    protein: 7.7, salt: 0.2,
  },
  {
    canonicalName: 'Witte chocolade',
    keywords: ['witte chocolade', 'chocolade wit'],
    energyKcal: 539, energyKj: 2256,
    fat: 32, saturatedFat: 19,
    carbs: 59, sugars: 59,
    protein: 6.0, salt: 0.16,
  },

  // ───────────── NOTEN & ZADEN ─────────────
  {
    canonicalName: 'Amandelen',
    keywords: ['amandel', 'amandelen', 'amandelschaafsel', 'amandelmeel'],
    energyKcal: 579, energyKj: 2418,
    fat: 50, saturatedFat: 3.8,
    carbs: 22, sugars: 4.4,
    protein: 21, salt: 0.01, fiber: 12,
  },
  {
    canonicalName: 'Hazelnoten',
    keywords: ['hazelnoot', 'hazelnoten'],
    energyKcal: 628, energyKj: 2629,
    fat: 61, saturatedFat: 4.5,
    carbs: 17, sugars: 4.3,
    protein: 15, salt: 0, fiber: 10,
  },
  {
    canonicalName: 'Walnoten',
    keywords: ['walnoot', 'walnoten'],
    energyKcal: 654, energyKj: 2738,
    fat: 65, saturatedFat: 6.1,
    carbs: 14, sugars: 2.6,
    protein: 15, salt: 0, fiber: 6.7,
  },
  {
    canonicalName: 'Pecannoten',
    keywords: ['pecannoot', 'pecannoten', 'pecan'],
    energyKcal: 691, energyKj: 2893,
    fat: 72, saturatedFat: 6.2,
    carbs: 14, sugars: 4.0,
    protein: 9.2, salt: 0, fiber: 9.6,
  },
  {
    canonicalName: 'Pistachenoten',
    keywords: ['pistache', 'pistachenoot', 'pistachenoten'],
    energyKcal: 562, energyKj: 2352,
    fat: 45, saturatedFat: 5.6,
    carbs: 28, sugars: 7.7,
    protein: 20, salt: 0.01, fiber: 10,
  },
  {
    canonicalName: 'Sesamzaad',
    keywords: ['sesam', 'sesamzaad', 'sesamzaadjes'],
    energyKcal: 573, energyKj: 2397,
    fat: 50, saturatedFat: 7.0,
    carbs: 23, sugars: 0.3,
    protein: 18, salt: 0.03, fiber: 12,
  },

  // ───────────── GEDROOGD FRUIT ─────────────
  {
    canonicalName: 'Rozijnen',
    keywords: ['rozijn', 'rozijnen', 'krenten'],
    energyKcal: 299, energyKj: 1265,
    fat: 0.5, saturatedFat: 0.1,
    carbs: 79, sugars: 65,
    protein: 3.1, salt: 0.03, fiber: 3.7,
  },
  {
    canonicalName: 'Gedroogde abrikozen',
    keywords: ['abrikoos', 'abrikozen', 'gedroogde abrikozen'],
    energyKcal: 241, energyKj: 1023,
    fat: 0.5, saturatedFat: 0,
    carbs: 53, sugars: 53,
    protein: 3.4, salt: 0.01, fiber: 7.3,
  },
  {
    canonicalName: 'Dadels',
    keywords: ['dadel', 'dadels'],
    energyKcal: 282, energyKj: 1196,
    fat: 0.4, saturatedFat: 0,
    carbs: 75, sugars: 63,
    protein: 2.5, salt: 0.01, fiber: 8.0,
  },

  // ───────────── OVERIG ─────────────
  {
    canonicalName: 'Water',
    keywords: ['water', 'koud water', 'lauw water', 'warm water'],
    energyKcal: 0, energyKj: 0,
    fat: 0, saturatedFat: 0,
    carbs: 0, sugars: 0,
    protein: 0, salt: 0,
    densityGperMl: 1.0,
  },
  {
    canonicalName: 'Citroensap',
    keywords: ['citroensap', 'citroen'],
    energyKcal: 22, energyKj: 92,
    fat: 0.2, saturatedFat: 0,
    carbs: 6.9, sugars: 2.5,
    protein: 0.4, salt: 0.02,
    densityGperMl: 1.03,
  },
]

/**
 * Zoek het beste passende ingredient in de database.
 * Matcht op naam (case-insensitive substring vs. keywords).
 */
export function findNutritionEntry(ingredientName: string): NutritionEntry | null {
  const needle = ingredientName.toLowerCase().trim()
  if (!needle) return null

  // Exacte keyword-match heeft prioriteit
  for (const entry of DATABASE) {
    if (entry.keywords.some((k) => needle === k.toLowerCase())) {
      return entry
    }
  }
  // Anders: substring match (langste keyword wint, voor specificiteit)
  let best: NutritionEntry | null = null
  let bestKeywordLen = 0
  for (const entry of DATABASE) {
    for (const k of entry.keywords) {
      if (needle.includes(k.toLowerCase()) && k.length > bestKeywordLen) {
        best = entry
        bestKeywordLen = k.length
      }
    }
  }
  return best
}

/**
 * Reken een ingredient om naar grammen, ongeacht eenheid.
 * Geeft `null` als we niet kunnen bepalen (bv. stuk zonder gramsPerStuk).
 */
function ingredientToGrams(
  ing: Ingredient,
  entry: NutritionEntry | null
): number | null {
  switch (ing.unit) {
    case 'gram':
      return ing.quantity
    case 'kg':
      return ing.quantity * 1000
    case 'ml':
      return ing.quantity * (entry?.densityGperMl ?? 1.0)
    case 'liter':
      return ing.quantity * 1000 * (entry?.densityGperMl ?? 1.0)
    case 'stuk':
      if (entry?.gramsPerStuk) {
        return ing.quantity * entry.gramsPerStuk
      }
      return null
    default:
      return null
  }
}

/**
 * Bereken voedingswaarden per 100g eindproduct.
 *
 * @param ingredients Lijst recept-ingrediënten
 * @param waterLossPercent Geschat gewichtsverlies bij bakken (default 0).
 *   Voor brood typisch 10%. Voor cake/gebak typisch 5%.
 */
export function calculateRecipeNutrition(
  ingredients: Ingredient[],
  waterLossPercent: number = 0
): RecipeNutrition {
  let totalGrams = 0
  let totalEnergyKcal = 0
  let totalEnergyKj = 0
  let totalFat = 0
  let totalSatFat = 0
  let totalCarbs = 0
  let totalSugars = 0
  let totalProtein = 0
  let totalSalt = 0
  let totalFiber = 0

  let matchedCount = 0
  const unmatched: string[] = []

  for (const ing of ingredients) {
    const entry = findNutritionEntry(ing.name)
    if (!entry) {
      unmatched.push(ing.name)
      continue
    }
    const grams = ingredientToGrams(ing, entry)
    if (grams === null || grams <= 0) {
      unmatched.push(ing.name)
      continue
    }

    matchedCount += 1
    totalGrams += grams

    const factor = grams / 100
    totalEnergyKcal += entry.energyKcal * factor
    totalEnergyKj += entry.energyKj * factor
    totalFat += entry.fat * factor
    totalSatFat += entry.saturatedFat * factor
    totalCarbs += entry.carbs * factor
    totalSugars += entry.sugars * factor
    totalProtein += entry.protein * factor
    totalSalt += entry.salt * factor
    totalFiber += (entry.fiber ?? 0) * factor
  }

  // Bij bakken verdampt water → eindproduct weegt minder dan de som ingrediënten
  const finalWeight = totalGrams * (1 - waterLossPercent / 100)

  // Voorkom delen door 0
  const per100Factor = finalWeight > 0 ? 100 / finalWeight : 0

  return {
    matchedCount,
    unmatchedIngredients: unmatched,
    totalWeightGrams: Math.round(finalWeight),
    energyKcal: round(totalEnergyKcal * per100Factor, 0),
    energyKj: round(totalEnergyKj * per100Factor, 0),
    fat: round(totalFat * per100Factor, 1),
    saturatedFat: round(totalSatFat * per100Factor, 1),
    carbs: round(totalCarbs * per100Factor, 1),
    sugars: round(totalSugars * per100Factor, 1),
    protein: round(totalProtein * per100Factor, 1),
    salt: round(totalSalt * per100Factor, 2),
    fiber: round(totalFiber * per100Factor, 1),
  }
}

function round(value: number, decimals: number): number {
  const f = Math.pow(10, decimals)
  return Math.round(value * f) / f
}

/** Lijst van alle ingrediënten in onze database (voor UI / docs). */
export function getKnownIngredients(): string[] {
  return DATABASE.map((e) => e.canonicalName).sort()
}
