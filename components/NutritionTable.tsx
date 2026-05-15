'use client'

import type { RecipeNutrition } from '@/lib/nutrition'

interface Props {
  nutrition: RecipeNutrition
  /** Zonder rand (voor in etiket-preview). Default true (compact tabel). */
  compact?: boolean
}

/**
 * EU-conforme voedingswaarde-tabel volgens verordening 1169/2011 bijlage XV.
 * Per 100g — verplichte volgorde: energie, vet, verzadigd vet, koolhydraten,
 * suikers, eiwitten, zout.
 */
export default function NutritionTable({ nutrition, compact = false }: Props) {
  const rows: { label: string; value: string; indent?: boolean }[] = [
    {
      label: 'Energie',
      value: `${nutrition.energyKj} kJ / ${nutrition.energyKcal} kcal`,
    },
    { label: 'Vetten', value: `${fmt(nutrition.fat)} g` },
    {
      label: 'waarvan verzadigde vetzuren',
      value: `${fmt(nutrition.saturatedFat)} g`,
      indent: true,
    },
    { label: 'Koolhydraten', value: `${fmt(nutrition.carbs)} g` },
    {
      label: 'waarvan suikers',
      value: `${fmt(nutrition.sugars)} g`,
      indent: true,
    },
    { label: 'Eiwitten', value: `${fmt(nutrition.protein)} g` },
    { label: 'Zout', value: `${fmt(nutrition.salt)} g` },
  ]

  if (nutrition.fiber !== undefined && nutrition.fiber > 0) {
    rows.splice(6, 0, {
      label: 'Vezels',
      value: `${fmt(nutrition.fiber)} g`,
    })
  }

  const cellPad = compact ? 'py-1' : 'py-1.5'

  return (
    <div className={compact ? '' : 'border-t border-warm-bg pt-3'}>
      <p className="text-espresso text-xs font-bold uppercase mb-1">
        Voedingswaarde per 100 g
      </p>
      <table className="w-full text-espresso text-xs">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-warm-bg/40 last:border-0">
              <td className={`${cellPad} ${r.indent ? 'pl-3 italic' : ''}`}>
                {r.label}
              </td>
              <td className={`${cellPad} text-right tabular-nums font-semibold`}>
                {r.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function fmt(n: number): string {
  // 1 decimaal voor alles behalve zout (2 decimalen voor sub-1g waarden)
  if (n < 1) return n.toFixed(2)
  if (n < 10) return n.toFixed(1)
  return Math.round(n).toString()
}
