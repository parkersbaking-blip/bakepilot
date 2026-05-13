import type { BreadProfile } from './types'

/**
 * Broodtype-profielen.
 * Per profiel staan welke broodpoeders standaard worden voorgesteld.
 * Percentages verwijzen naar bakerPercentage (bloem = 100%).
 *
 * Zuurdesem / rustiek brood gebruikt bewust géén broodpoeder.
 */
export const BREAD_PROFILES: BreadProfile[] = [
  {
    id: 'wit-zacht-brood',
    name: 'Wit / zacht brood',
    category: 'Brood',
    suggestedIngredients: [
      {
        ingredientId: 'witbroodpoeder',
        bakerPercentage: 3,
        enabledByDefault: true,
      },
    ],
    examples: ['witbrood', 'bolletjes', 'puntjes', 'sandwichbrood'],
  },
  {
    id: 'bruin-brood',
    name: 'Bruin brood',
    category: 'Brood',
    suggestedIngredients: [
      {
        ingredientId: 'bruinbroodpoeder',
        bakerPercentage: 3,
        enabledByDefault: true,
      },
    ],
    examples: ['bruinbrood', 'halfbruin', 'tarwebrood', 'bruine bolletjes'],
  },
  {
    id: 'hard-brood',
    name: 'Hard brood',
    category: 'Brood',
    suggestedIngredients: [
      {
        ingredientId: 'hardbroodpoeder',
        bakerPercentage: 3,
        enabledByDefault: true,
      },
    ],
    examples: [
      'kaiserbroodjes',
      'harde bollen',
      'Italiaanse bollen',
      'pistolets',
    ],
  },
  {
    id: 'kleinbrood',
    name: 'Kleinbrood',
    category: 'Brood',
    suggestedIngredients: [
      {
        ingredientId: 'kleinbroodpoeder',
        bakerPercentage: 15,
        enabledByDefault: true,
      },
    ],
    examples: ['kleine broodjes', 'luxe broodjes', 'zachte broodjes'],
  },
  {
    id: 'vruchtenbrood',
    name: 'Vruchtenbrood',
    category: 'Brood',
    suggestedIngredients: [
      {
        ingredientId: 'vruchtenbroodpoeder',
        bakerPercentage: 20,
        enabledByDefault: true,
      },
    ],
    examples: [
      'krentenbrood',
      'rozijnenbrood',
      'vruchtenbrood',
      'vruchtenbolletjes',
      'krentenbollen',
      'rozijnenbollen',
    ],
  },
  {
    id: 'melkbrood-luxe-brood',
    name: 'Melkbrood / luxe brood',
    category: 'Brood',
    suggestedIngredients: [
      {
        ingredientId: 'melkbroodpoeder',
        bakerPercentage: 3,
        enabledByDefault: true,
      },
    ],
    examples: ['melkbrood', 'luxe broodjes', 'zoete broodjes'],
  },
  {
    id: 'zuurdesem-rustiek',
    name: 'Zuurdesem / rustiek brood',
    category: 'Brood',
    suggestedIngredients: [],
    examples: ['zuurdesembrood', 'rustiek brood', 'artisan bread'],
    note: 'Gebruik standaard geen broodpoeder bij zuurdesem of rustiek brood.',
  },
]

export function getProfileById(id: string): BreadProfile | undefined {
  return BREAD_PROFILES.find((p) => p.id === id)
}
