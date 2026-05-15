'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import BackBar from '@/components/BackBar'
import Button from '@/components/Button'
import Input from '@/components/Input'
import NumberField from '@/components/NumberField'
import Footer from '@/components/Footer'
import ProUpsellModal from '@/components/ProUpsellModal'
import {
  EU_ALLERGENS,
  detectAllergens,
  buildIngredientListHTML,
  calculateBestBeforeDate,
  generateLotNumber,
  type AllergenId,
} from '@/lib/labelGenerator'
import { isProUser } from '@/lib/pro'
import { getSettings } from '@/lib/settings'
import { STARTER_RECIPES } from '@/lib/recipes'
import { getCustomRecipes } from '@/lib/customRecipes'
import type { Recipe } from '@/lib/types'
import { calculateRecipeNutrition } from '@/lib/nutrition'
import NutritionTable from '@/components/NutritionTable'

type Mode = 'eenvoudig' | 'eu'

export default function LabelsPage() {
  const [mode, setMode] = useState<Mode>('eenvoudig')
  const [pro, setPro] = useState(false)
  const [proModalOpen, setProModalOpen] = useState(false)

  // Eenvoudig mode state (oude functionaliteit, ongewijzigd)
  const [productName, setProductName] = useState('')
  const [ingredientsText, setIngredientsText] = useState('')
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [shelfLifeDays, setShelfLifeDays] = useState(3)
  const [copied, setCopied] = useState(false)

  // EU mode state
  const [recipeId, setRecipeId] = useState<string>('')
  const [bakeryName, setBakeryName] = useState('')
  const [bakeryAddress, setBakeryAddress] = useState('')
  const [netWeight, setNetWeight] = useState('')
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [lotNumber, setLotNumber] = useState('')
  const [manualAllergens, setManualAllergens] = useState<AllergenId[]>([])
  const [showNutrition, setShowNutrition] = useState(true)
  const [waterLossPercent, setWaterLossPercent] = useState(0)

  useEffect(() => {
    setPro(isProUser())
    const interval = setInterval(() => setPro(isProUser()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const settings = getSettings()
    setBakeryName(settings.bakeryName ?? '')
    setLotNumber(generateLotNumber())
  }, [])

  const allRecipes: Recipe[] = useMemo(
    () => [...getCustomRecipes(), ...STARTER_RECIPES],
    []
  )
  const selectedRecipe = useMemo(
    () => allRecipes.find((r) => r.id === recipeId),
    [allRecipes, recipeId]
  )

  // ────── EENVOUDIG MODE (origineel) ──────
  const SIMPLE_ALLERGENS = [
    { id: 'gluten', label: 'Gluten' },
    { id: 'melk', label: 'Melk' },
    { id: 'eieren', label: 'Eieren' },
    { id: 'noten', label: 'Noten' },
    { id: 'soja', label: 'Soja' },
    { id: 'sesamzaad', label: 'Sesamzaad' },
    { id: 'pinda', label: "Pinda's" },
  ]

  function toggleSimpleAllergen(id: string) {
    setSelectedAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const simpleAllergenLabels = SIMPLE_ALLERGENS.filter((a) =>
    selectedAllergens.includes(a.id)
  ).map((a) => a.label)

  const simpleLabelText = useMemo(() => {
    const ingredientsList = ingredientsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ')
    const lines: string[] = []
    if (productName) lines.push(productName.toUpperCase())
    lines.push('')
    lines.push(`Ingrediënten: ${ingredientsList || '—'}`)
    lines.push('')
    if (simpleAllergenLabels.length > 0) {
      lines.push(`Allergenen: Bevat ${simpleAllergenLabels.join(', ')}.`)
    } else {
      lines.push('Allergenen: Geen bekende allergenen.')
    }
    lines.push('')
    lines.push('Ten minste houdbaar tot: DD-MM-JJJJ')
    lines.push(
      `Bewaaradvies: Bewaar op een koele, droge plaats. Na opening ${shelfLifeDays} ${shelfLifeDays === 1 ? 'dag' : 'dagen'} houdbaar.`
    )
    lines.push('')
    lines.push(
      `Geproduceerd door: ${bakeryName || 'Vul je bakkerij-naam in via Instellingen'}`
    )
    return lines.join('\n')
  }, [productName, ingredientsText, simpleAllergenLabels, shelfLifeDays, bakeryName])

  async function handleCopySimple() {
    try {
      await navigator.clipboard.writeText(simpleLabelText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = simpleLabelText
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ────── EU MODE ──────
  const detectedAllergens = useMemo(() => {
    if (!selectedRecipe) return []
    return detectAllergens(selectedRecipe.ingredients)
  }, [selectedRecipe])

  // Combineer auto-gedetecteerd + handmatig
  const allDeclaredAllergens = useMemo(() => {
    const fromDetection = detectedAllergens.map((d) => d.id)
    return Array.from(new Set([...fromDetection, ...manualAllergens]))
  }, [detectedAllergens, manualAllergens])

  function toggleManualAllergen(id: AllergenId) {
    setManualAllergens((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const ingredientListHTML = useMemo(() => {
    if (!selectedRecipe) return ''
    return buildIngredientListHTML(selectedRecipe.ingredients)
  }, [selectedRecipe])

  const bestBeforeDate = useMemo(() => {
    if (!productionDate || !shelfLifeDays) return 'DD-MM-JJJJ'
    return calculateBestBeforeDate(productionDate, shelfLifeDays)
  }, [productionDate, shelfLifeDays])

  const nutrition = useMemo(() => {
    if (!selectedRecipe) return null
    return calculateRecipeNutrition(selectedRecipe.ingredients, waterLossPercent)
  }, [selectedRecipe, waterLossPercent])

  function handleSwitchMode(newMode: Mode) {
    if (newMode === 'eu' && !pro) {
      setProModalOpen(true)
      return
    }
    setMode(newMode)
  }

  function handlePrintEu() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title="Etiketten" />
      <BackBar />

      <div className="px-4 pt-6 pb-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="print:hidden"
        >
          <h1 className="text-espresso text-2xl font-bold">Etiket generator</h1>
          <p className="text-muted text-sm mt-1">
            Genereer een Nederlandse producttekst voor je etiket
          </p>
        </motion.div>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 gap-2 bg-warm-bg/40 rounded-2xl p-1 print:hidden">
          <button
            onClick={() => handleSwitchMode('eenvoudig')}
            className={`text-xs font-bold py-2.5 rounded-xl transition-colors ${
              mode === 'eenvoudig' ? 'bg-white text-warm shadow-sm' : 'text-muted'
            }`}
          >
            Eenvoudig
          </button>
          <button
            onClick={() => handleSwitchMode('eu')}
            className={`text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'eu' ? 'bg-white text-warm shadow-sm' : 'text-muted'
            }`}
          >
            EU-conform
            {!pro && (
              <span className="text-[9px] bg-warm text-white px-1.5 py-0.5 rounded font-bold">
                PRO
              </span>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'eenvoudig' && (
            <motion.div
              key="simple"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Form (oude versie) */}
              <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4 print:hidden">
                <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
                  Productinformatie
                </h2>
                <Input
                  label="Productnaam"
                  placeholder="bijv. Kaneelbroodjes"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted uppercase tracking-wider">
                    Ingrediënten (komma gescheiden)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="bijv. Tarwebloem, suiker, boter, eieren, kaneel"
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso placeholder-muted/60 focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30 text-sm resize-none"
                  />
                </div>
                <NumberField
                  label="Houdbaar na opening"
                  unit="dagen"
                  allowDecimals={false}
                  min={1}
                  value={shelfLifeDays}
                  onChange={(v) => setShelfLifeDays(v || 1)}
                />
              </div>

              <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4 print:hidden">
                <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
                  Allergenen
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {SIMPLE_ALLERGENS.map((allergen) => {
                    const isSelected = selectedAllergens.includes(allergen.id)
                    return (
                      <button
                        key={allergen.id}
                        type="button"
                        onClick={() => toggleSimpleAllergen(allergen.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-warm/15 border-warm/50 text-warm'
                            : 'bg-warm-bg/60 border-warm-bg text-muted'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            isSelected
                              ? 'border-warm bg-warm'
                              : 'border-muted/40'
                          }`}
                        >
                          {isSelected && (
                            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="#1C1410"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        {allergen.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-espresso/70 text-xs font-semibold uppercase tracking-wider print:hidden">
                  Voorbeeld etikettekst
                </h2>
                <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5">
                  <pre className="text-espresso text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {simpleLabelText}
                  </pre>
                </div>
                <Button variant="primary" size="md" fullWidth onClick={handleCopySimple}>
                  {copied ? '✓ Gekopieerd!' : 'Kopieer etikettekst'}
                </Button>
              </div>
            </motion.div>
          )}

          {mode === 'eu' && pro && (
            <motion.div
              key="eu"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Recept selecteren */}
              <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4 print:hidden">
                <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
                  1. Kies recept
                </h2>
                <p className="text-muted text-xs">
                  Ingrediënten en allergenen worden automatisch ingevuld op basis van het recept.
                </p>
                <select
                  value={recipeId}
                  onChange={(e) => setRecipeId(e.target.value)}
                  className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30 text-sm"
                >
                  <option value="">— Selecteer een recept —</option>
                  {allRecipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRecipe && (
                <>
                  {/* Bakkerij info */}
                  <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4 print:hidden">
                    <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
                      2. Bakkerij & product
                    </h2>
                    <Input
                      label="Bakkerij-naam"
                      placeholder="bijv. Parker's Baking"
                      value={bakeryName}
                      onChange={(e) => setBakeryName(e.target.value)}
                    />
                    <Input
                      label="Bakkerij-adres (verplicht volgens FIC)"
                      placeholder="bijv. Hoofdstraat 12, 1234 AB Plaats"
                      value={bakeryAddress}
                      onChange={(e) => setBakeryAddress(e.target.value)}
                    />
                    <Input
                      label="Nettogewicht (verplicht)"
                      placeholder="bijv. 500 g of 12 stuks à 80 g"
                      value={netWeight}
                      onChange={(e) => setNetWeight(e.target.value)}
                    />
                  </div>

                  {/* Datums */}
                  <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4 print:hidden">
                    <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
                      3. Datum & batchnummer
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-muted uppercase tracking-wider">
                          Productiedatum
                        </label>
                        <input
                          type="date"
                          value={productionDate}
                          onChange={(e) => setProductionDate(e.target.value)}
                          className="w-full bg-warm-bg border border-warm-bg rounded-xl px-4 py-3 text-espresso focus:outline-none focus:border-warm text-sm"
                        />
                      </div>
                      <NumberField
                        label="Houdbaarheid"
                        unit="dagen"
                        allowDecimals={false}
                        min={1}
                        value={shelfLifeDays}
                        onChange={(v) => setShelfLifeDays(v || 1)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        label="Lotnummer"
                        value={lotNumber}
                        onChange={(e) => setLotNumber(e.target.value)}
                        className="flex-1"
                      />
                      <button
                        onClick={() => setLotNumber(generateLotNumber(productionDate))}
                        className="self-end px-4 py-3 rounded-xl bg-warm-bg text-warm text-xs font-bold hover:bg-warm-bg/80"
                        title="Nieuw lotnummer"
                      >
                        🔄
                      </button>
                    </div>
                  </div>

                  {/* Auto-gedetecteerde allergenen */}
                  <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4 print:hidden">
                    <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
                      4. Allergenen
                    </h2>
                    {detectedAllergens.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-amber-900 text-xs font-bold uppercase mb-2">
                          ⚠️ Automatisch gedetecteerd:
                        </p>
                        <ul className="space-y-1">
                          {detectedAllergens.map((d) => (
                            <li key={d.id} className="text-amber-900 text-xs">
                              <strong>{d.label}</strong> — door:{' '}
                              {d.triggeredBy.join(', ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-muted text-xs">
                      Vink eventuele extra allergenen aan die niet automatisch
                      gedetecteerd zijn (bv. sporen):
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {EU_ALLERGENS.map((allergen) => {
                        const isAuto = detectedAllergens.some(
                          (d) => d.id === allergen.id
                        )
                        const isManual = manualAllergens.includes(allergen.id)
                        const isSelected = isAuto || isManual
                        return (
                          <button
                            key={allergen.id}
                            type="button"
                            onClick={() => !isAuto && toggleManualAllergen(allergen.id)}
                            disabled={isAuto}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors text-left ${
                              isAuto
                                ? 'bg-amber-50 border-amber-200 text-amber-900 cursor-default'
                                : isSelected
                                  ? 'bg-warm/15 border-warm/50 text-warm'
                                  : 'bg-warm-bg/60 border-warm-bg text-muted'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                isSelected
                                  ? 'border-warm bg-warm'
                                  : 'border-muted/40'
                              }`}
                            >
                              {isSelected && (
                                <svg width="7" height="7" viewBox="0 0 12 12" fill="none">
                                  <path
                                    d="M2 6l3 3 5-5"
                                    stroke="white"
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="leading-tight">{allergen.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Voedingswaarde sectie */}
                  <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4 print:hidden">
                    <div className="flex items-center justify-between">
                      <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
                        5. Voedingswaarde
                      </h2>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showNutrition}
                          onChange={(e) => setShowNutrition(e.target.checked)}
                          className="w-4 h-4 accent-warm"
                        />
                        <span className="text-xs text-muted font-medium">
                          Toon op etiket
                        </span>
                      </label>
                    </div>

                    {showNutrition && nutrition && (
                      <>
                        <NumberField
                          label="Gewichtsverlies bij bakken"
                          unit="%"
                          min={0}
                          value={waterLossPercent}
                          onChange={(v) => setWaterLossPercent(Math.min(Math.max(v || 0, 0), 30))}
                        />
                        <div className="bg-warm-bg/60 rounded-xl p-3 text-xs text-espresso leading-relaxed">
                          <p className="font-bold text-warm mb-1">💡 Richtlijnen</p>
                          <p className="text-muted">
                            <strong>Brood:</strong> ~10% (water verdampt)<br />
                            <strong>Cake/gebak:</strong> ~5%<br />
                            <strong>Koekjes:</strong> ~3-5%<br />
                            <strong>Geen baking:</strong> 0%
                          </p>
                        </div>

                        {nutrition.unmatchedIngredients.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-amber-900 text-xs font-bold uppercase mb-1">
                              ⚠️ Niet gevonden in database
                            </p>
                            <p className="text-amber-900 text-xs">
                              {nutrition.unmatchedIngredients.join(', ')}
                            </p>
                            <p className="text-amber-800 text-[10px] mt-2 italic">
                              Deze ingrediënten tellen niet mee in de berekening.
                              De waarden zijn dus een onderschatting.
                            </p>
                          </div>
                        )}

                        <div className="bg-warm-bg/40 rounded-xl p-3">
                          <NutritionTable nutrition={nutrition} compact />
                        </div>

                        <p className="text-muted text-[10px] italic leading-relaxed">
                          ⚠️ Waarden zijn geschat o.b.v. NEVO/USDA-database.
                          Voor commerciële verkoop op grote schaal raden we
                          lab-analyse aan. Bakker blijft eindverantwoordelijk
                          voor declaratie op het etiket.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Etiket-preview (print-target) */}
                  <div className="space-y-3">
                    <h2 className="text-espresso/70 text-xs font-semibold uppercase tracking-wider print:hidden">
                      Etiket-voorbeeld
                    </h2>
                    <div className="bg-white border-2 border-espresso rounded-2xl p-6 print:border-2 print:rounded-none">
                      <div className="space-y-3">
                        <p className="text-espresso text-xl font-bold uppercase tracking-tight">
                          {selectedRecipe.name}
                        </p>
                        {netWeight && (
                          <p className="text-espresso text-sm font-semibold">
                            {netWeight}
                          </p>
                        )}

                        <div>
                          <p className="text-espresso text-xs font-bold uppercase mb-1">
                            Ingrediënten:
                          </p>
                          <p
                            className="text-espresso text-xs leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: ingredientListHTML }}
                          />
                          <p className="text-muted text-[10px] mt-1 italic">
                            Allergenen <strong>vetgedrukt</strong> volgens EU 1169/2011.
                          </p>
                        </div>

                        {allDeclaredAllergens.length > 0 && (
                          <div>
                            <p className="text-espresso text-xs font-bold uppercase mb-1">
                              Allergeneninfo:
                            </p>
                            <p className="text-espresso text-xs">
                              Bevat:{' '}
                              {allDeclaredAllergens
                                .map(
                                  (id) =>
                                    EU_ALLERGENS.find((a) => a.id === id)?.label
                                )
                                .filter(Boolean)
                                .join(', ')}
                              .
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-warm-bg">
                          <div>
                            <p className="text-muted text-[10px] uppercase font-bold">
                              Ten minste houdbaar tot
                            </p>
                            <p className="text-espresso text-sm font-semibold">
                              {bestBeforeDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted text-[10px] uppercase font-bold">
                              Lotnummer
                            </p>
                            <p className="text-espresso text-sm font-semibold tabular-nums">
                              {lotNumber}
                            </p>
                          </div>
                        </div>

                        <p className="text-espresso text-xs">
                          Bewaaradvies: koel en droog bewaren. Na opening{' '}
                          {shelfLifeDays} {shelfLifeDays === 1 ? 'dag' : 'dagen'}{' '}
                          houdbaar.
                        </p>

                        {showNutrition && nutrition && (
                          <NutritionTable nutrition={nutrition} compact />
                        )}

                        <div className="pt-2 border-t border-warm-bg">
                          <p className="text-espresso text-xs font-bold">
                            {bakeryName || '— bakkerij-naam —'}
                          </p>
                          {bakeryAddress && (
                            <p className="text-muted text-xs">{bakeryAddress}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={handlePrintEu}
                    >
                      🖨️ Print etiket
                    </Button>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-warm-bg/60 border border-warm/20 rounded-2xl p-4 print:hidden">
                    <p className="text-warm text-xs font-bold uppercase tracking-wider mb-2">
                      ⚠️ Belangrijke disclaimer
                    </p>
                    <p className="text-espresso text-xs leading-relaxed">
                      Dit etiket is een <strong>hulpmiddel</strong> en geen
                      juridisch advies. De bakker blijft eindverantwoordelijk
                      voor juiste declaratie volgens EU-verordening 1169/2011
                      (FIC) en eventuele andere geldende wetgeving.
                      Allergenen-detectie is gebaseerd op ingrediëntnamen en
                      kan kruisbesmetting niet vaststellen. Controleer altijd
                      de actuele wetgeving bij{' '}
                      <a
                        href="https://www.nvwa.nl/onderwerpen/etikettering-van-levensmiddelen"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-warm font-semibold"
                      >
                        NVWA
                      </a>
                      .
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      <ProUpsellModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        feature="EU-conforme etiketten"
      />
    </div>
  )
}
