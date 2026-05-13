import type { BreadPowder } from './types'

/**
 * Broodpoeder-database.
 *
 * BELANGRIJKE REGELS:
 * - Geen vaste grammen — alleen bakkerspercentages (bloem = 100%).
 * - Schaling formule:    gram = bloemgewicht × bakerPercentage / 100
 *
 * Voorbeelden:
 *   1000 g bloem × 3%  = 30 g witbroodpoeder
 *   5000 g bloem × 3%  = 150 g witbroodpoeder
 *   1000 g bloem × 15% = 150 g kleinbroodpoeder
 *   1000 g bloem × 20% = 200 g vruchtenbroodpoeder
 */
export const BREAD_POWDERS: BreadPowder[] = [
  {
    id: 'witbroodpoeder',
    name: 'Witbroodpoeder',
    category: 'broodpoeder',
    type: 'verbeteraar',
    defaultBakerPercentage: 3,
    unit: 'percentage_of_flour',
    usedFor: [
      'witbrood',
      'zachte-bolletjes',
      'puntjes',
      'sandwichbrood',
      'hamburgerbroodjes',
    ],
    description:
      'Voor wit brood en zachte broodjes. Geeft meer volume, zachtere kruim en betere verwerking.',
    defaultPricePerKg: 6.50,
  },
  {
    id: 'bruinbroodpoeder',
    name: 'Bruinbroodpoeder',
    category: 'broodpoeder',
    type: 'verbeteraar',
    defaultBakerPercentage: 3,
    unit: 'percentage_of_flour',
    usedFor: [
      'bruinbrood',
      'halfbruin-brood',
      'tarwebrood',
      'bruine-bolletjes',
    ],
    description:
      'Voor bruin en halfbruin brood. Verbetert structuur, volume en kruimkleur bij tarwemelen.',
    defaultPricePerKg: 6.80,
  },
  {
    id: 'hardbroodpoeder',
    name: 'Hardbroodpoeder',
    category: 'broodpoeder',
    type: 'verbeteraar',
    defaultBakerPercentage: 3,
    unit: 'percentage_of_flour',
    usedFor: [
      'kaiserbroodjes',
      'harde-broodjes',
      'italiaanse-bollen',
      'pistolets',
      'stokbrood',
      'kleinbrood-krokant',
    ],
    description:
      'Voor harde broodjes (pistolets, kaiserbroodjes), stokbrood (Frans en Nederlands), knapperige korstbroden met brosse buitenkant en klein krokant brood.',
    defaultPricePerKg: 7.20,
  },
  {
    id: 'kleinbroodpoeder',
    name: 'Kleinbroodpoeder',
    category: 'broodpoeder',
    type: 'basis-mix',
    defaultBakerPercentage: 15,
    unit: 'percentage_of_flour',
    usedFor: ['kleinbrood', 'zachte-broodjes', 'luxe-broodjes'],
    description:
      'Voor kleinbrood en luxe zachte broodjes. Wordt hoger gedoseerd dan gewone broodverbeteraar.',
    defaultPricePerKg: 5.80,
  },
  {
    id: 'vruchtenbroodpoeder',
    name: 'Vruchtenbroodpoeder',
    category: 'broodpoeder',
    type: 'basis-mix',
    defaultBakerPercentage: 20,
    unit: 'percentage_of_flour',
    usedFor: [
      'krentenbrood',
      'rozijnenbrood',
      'vruchtenbrood',
      'vruchtenbolletjes',
      'krentenbollen',
      'rozijnenbollen',
    ],
    description:
      'Voor brood met vulling zoals krentenbrood, rozijnenbrood en vruchtenbolletjes.',
    defaultPricePerKg: 6.80,
  },
  {
    id: 'melkbroodpoeder',
    name: 'Melkbroodpoeder',
    category: 'broodpoeder',
    type: 'basis-mix',
    // OPMERKING: staat nu op 3% (gelijk aan witbroodpoeder).
    // Pas deze waarde aan in deze file als je later een andere standaard wilt.
    defaultBakerPercentage: 3,
    unit: 'percentage_of_flour',
    usedFor: ['melkbrood', 'zachte-broodjes', 'luxe-brood', 'zoete-broodjes'],
    description:
      'Voor zachte melkbroden en luxe broodjes met een rijkere kruim.',
    defaultPricePerKg: 7.50,
  },
]

export function getPowderById(id: string): BreadPowder | undefined {
  return BREAD_POWDERS.find((p) => p.id === id)
}

/**
 * Bereken de hoeveelheid broodpoeder in gram op basis van het bloemgewicht.
 * Formule: gram = bloemgewicht × bakerPercentage / 100
 */
export function calculatePowderGrams(
  flourWeightGrams: number,
  bakerPercentage: number
): number {
  if (flourWeightGrams <= 0 || bakerPercentage <= 0) return 0
  return Math.round((flourWeightGrams * bakerPercentage) / 100)
}
