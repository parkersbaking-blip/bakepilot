'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import BackBar from '@/components/BackBar'
import Button from '@/components/Button'
import Input from '@/components/Input'
import IngredientRow from '@/components/IngredientRow'
import NumberField from '@/components/NumberField'
import ResultCard from '@/components/ResultCard'
import Footer from '@/components/Footer'
import ProUpsellModal from '@/components/ProUpsellModal'
import BreadProfileSelector, { detectFlourGrams } from '@/components/BreadProfileSelector'
import { calculate, formatCurrency } from '@/lib/calculations'
import {
  getSelectedRecipe,
  clearSelectedRecipe,
  saveCalculation,
  getSelectedCalculation,
  clearSelectedCalculation,
} from '@/lib/storage'
import { generateCalculationPDF } from '@/lib/pdf'
import { getSettings } from '@/lib/settings'
import { saveCustomRecipe, newCustomRecipeId } from '@/lib/customRecipes'
import type { Ingredient, Calculation, CalculationResult, Recipe } from '@/lib/types'

function newIngredient(): Ingredient {
  return {
    id: crypto.randomUUID(),
    name: '',
    quantity: 0,
    unit: 'gram',
    pricePerUnit: 0,
  }
}

const DEFAULT_FORM = {
  productName: '',
  baseYield: 12,
  desiredYield: 12,
  packagingCost: 0.15,
  laborMinutes: 60,
  laborCostPerHour: 15,
  marginPercentage: 40,
  vatPercentage: 9,
}

export default function CalculatorPage() {
  const [isNewRecipeMode, setIsNewRecipeMode] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsNewRecipeMode(
        new URLSearchParams(window.location.search).get('nieuw') === '1'
      )
    }
  }, [])

  const [form, setForm] = useState(DEFAULT_FORM)
  const [ingredients, setIngredients] = useState<Ingredient[]>([newIngredient()])
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [saved, setSaved] = useState(false)
  const [proModalOpen, setProModalOpen] = useState(false)
  const [proModalFeature, setProModalFeature] = useState('Download als PDF')
  const [recipeSaveFlash, setRecipeSaveFlash] = useState(false)

  const flourInRecipe = detectFlourGrams(ingredients)

  const handleAddIngredientFromProfile = (ing: Ingredient) => {
    setIngredients((prev) => [...prev, ing])
  }

  const handleShowProUpsellForBreadPowder = () => {
    setProModalFeature('Broodverbeteraar suggesties')
    setProModalOpen(true)
  }

  // Load user settings + selected recipe/calculation on mount
  useEffect(() => {
    const settings = getSettings()
    const savedCalc = getSelectedCalculation()
    const recipe = getSelectedRecipe()

    // Prioriteit: opgeslagen berekening → recept → settings
    if (savedCalc) {
      setForm({
        productName: savedCalc.productName,
        baseYield: savedCalc.baseYield,
        desiredYield: savedCalc.desiredYield,
        packagingCost: savedCalc.packagingCost,
        laborMinutes: savedCalc.laborMinutes,
        laborCostPerHour: savedCalc.laborCostPerHour,
        marginPercentage: savedCalc.marginPercentage,
        vatPercentage: savedCalc.vatPercentage,
      })
      setIngredients(
        savedCalc.ingredients.map((ing) => ({
          ...ing,
          id: crypto.randomUUID(),
        }))
      )
      clearSelectedCalculation()
      return
    }

    setForm((f) => ({
      ...f,
      // Gebruiker-instellingen als basis
      laborCostPerHour: settings.laborCostPerHour,
      marginPercentage: settings.marginPercentage,
      vatPercentage: settings.vatPercentage,
      packagingCost: settings.packagingCost,
      // Recept overschrijft, indien aanwezig
      ...(recipe && {
        productName: recipe.name,
        baseYield: recipe.baseYield,
        desiredYield: recipe.baseYield,
        laborMinutes: recipe.activeLaborMinutes ?? f.laborMinutes,
        packagingCost:
          recipe.suggestedPackagingCost ?? settings.packagingCost,
      }),
    }))

    if (recipe) {
      setIngredients(
        recipe.ingredients.map((ing) => ({
          ...ing,
          id: crypto.randomUUID(),
        }))
      )
      clearSelectedRecipe()
    }
  }, [])

  // Recalculate on every change
  useEffect(() => {
    const hasValidIngredients = ingredients.some((i) => i.name && i.quantity > 0)
    if (!hasValidIngredients || form.baseYield <= 0 || form.desiredYield <= 0) {
      setResult(null)
      return
    }
    const res = calculate({
      ...form,
      ingredients,
    })
    setResult(res)
  }, [form, ingredients])

  const updateIngredient = useCallback((id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing) => ing.id === id ? { ...ing, [field]: value } : ing)
    )
  }, [])

  const removeIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id))
  }, [])

  const addIngredient = () => {
    setIngredients((prev) => [...prev, newIngredient()])
  }

  const handleReset = () => {
    setForm(DEFAULT_FORM)
    setIngredients([newIngredient()])
    setResult(null)
    setSaved(false)
  }

  const handleSave = () => {
    if (!result) return
    const calc: Calculation = {
      id: crypto.randomUUID(),
      ...form,
      ingredients,
      result,
      savedAt: new Date().toISOString(),
    }
    saveCalculation(calc)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateForm = (field: keyof typeof DEFAULT_FORM, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  const handleSaveAsRecipe = () => {
    if (!form.productName.trim()) {
      alert('Geef je recept eerst een naam.')
      return
    }
    const recipe: Recipe = {
      id: newCustomRecipeId(),
      name: form.productName.trim(),
      category: 'Eigen recepten',
      baseYield: form.baseYield,
      yieldUnit: 'stuks',
      ingredients: ingredients.map((ing) => ({ ...ing })),
      difficulty: 'Makkelijk',
      prepTime: form.laborMinutes,
      activeLaborMinutes: form.laborMinutes,
      suggestedPackagingCost: form.packagingCost,
    }
    saveCustomRecipe(recipe)
    setRecipeSaveFlash(true)
    setTimeout(() => setRecipeSaveFlash(false), 2500)
  }

  const handlePdfDownload = () => {
    if (!result) return
    // PDF download is gratis — Optie A (eerlijke paywall: print kan toch al naar PDF)
    generateCalculationPDF({
      ...form,
      ingredients,
      result,
      savedAt: new Date().toISOString(),
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title="Calculator" />
      <BackBar />

      <div className="px-4 pt-6 pb-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className="text-espresso text-2xl font-bold">
            {isNewRecipeMode ? 'Nieuw recept' : 'Berekening'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {isNewRecipeMode
              ? 'Vul ingrediënten in en klik onderaan op "Opslaan als eigen recept"'
              : 'Vul je recept in voor een kostprijs berekening'}
          </p>
        </motion.div>

        {isNewRecipeMode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="bg-warm/10 border border-warm/30 rounded-2xl p-4 flex items-start gap-3"
          >
            <span className="text-2xl flex-shrink-0">📒</span>
            <div className="text-sm">
              <p className="text-warm font-bold mb-0.5">Eigen recept maken</p>
              <p className="text-espresso text-xs leading-relaxed">
                Geef je recept een naam, vul ingrediënten in en klik onderaan op
                <strong> &quot;Opslaan als eigen recept&quot;</strong>. Daarna staat hij in jouw
                receptenboek.
              </p>
            </div>
          </motion.div>
        )}

        {/* Product info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
          className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4"
        >
          <h2 className="text-warm text-sm font-bold uppercase tracking-wider">Product</h2>
          <Input
            label="Productnaam"
            placeholder="bijv. Cinnamon Rolls"
            value={form.productName}
            onChange={(e) => updateForm('productName', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Basisopbrengst"
              unit="stuks"
              allowDecimals={false}
              min={1}
              value={form.baseYield}
              onChange={(v) => updateForm('baseYield', v || 1)}
            />
            <NumberField
              label="Gewenste opbrengst"
              unit="stuks"
              allowDecimals={false}
              min={1}
              value={form.desiredYield}
              onChange={(v) => updateForm('desiredYield', v || 1)}
            />
          </div>
          {form.baseYield > 0 && form.desiredYield > 0 && (
            <div className="bg-warm/10 rounded-xl px-3 py-2 text-warm text-xs font-medium">
              Schaalfactor: ×{(form.desiredYield / form.baseYield).toFixed(2)}
            </div>
          )}
        </motion.div>

        {/* Ingredients */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-warm text-sm font-bold uppercase tracking-wider">Ingrediënten</h2>
            <span className="text-muted text-xs">{ingredients.length} ingrediënten</span>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <IngredientRow
                key={ing.id}
                ingredient={ing}
                index={i}
                onChange={updateIngredient}
                onRemove={removeIngredient}
                canRemove={ingredients.length > 1}
              />
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={addIngredient}
          >
            + Nieuw ingrediënt toevoegen
          </Button>
        </motion.div>

        {/* Broodtype-profiel met broodpoeder suggesties */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.13, ease: 'easeOut' }}
        >
          <BreadProfileSelector
            flourGrams={flourInRecipe}
            onAddIngredient={handleAddIngredientFromProfile}
            onShowProUpsell={handleShowProUpsellForBreadPowder}
          />
        </motion.div>

        {/* Costs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
          className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4"
        >
          <h2 className="text-warm text-sm font-bold uppercase tracking-wider">Kosten & Arbeid</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Verpakkingskosten"
              unit="€/st"
              value={form.packagingCost}
              onChange={(v) => updateForm('packagingCost', v)}
            />
            <NumberField
              label="Arbeidskosten"
              unit="€/uur"
              value={form.laborCostPerHour}
              onChange={(v) => updateForm('laborCostPerHour', v)}
            />
          </div>
          <NumberField
            label="Werktijd"
            unit="min"
            allowDecimals={false}
            value={form.laborMinutes}
            onChange={(v) => updateForm('laborMinutes', v)}
          />
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
          className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4"
        >
          <h2 className="text-warm text-sm font-bold uppercase tracking-wider">Prijsstelling</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Marge"
              unit="%"
              value={form.marginPercentage}
              onChange={(v) => updateForm('marginPercentage', v)}
            />
            <NumberField
              label="BTW tarief"
              unit="%"
              value={form.vatPercentage}
              onChange={(v) => updateForm('vatPercentage', v)}
            />
          </div>
          <div className="bg-warm-bg/60 rounded-xl px-3 py-2">
            <p className="text-muted text-xs">9% = laag tarief (voedingsmiddelen) · 21% = hoog tarief</p>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Hero price */}
              <div className="bg-warm-bg border border-warm/20 rounded-3xl p-6 text-center">
                <p className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                  Aanbevolen verkoopprijs incl. btw
                </p>
                <motion.p
                  key={result.salesPriceInclVat}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="text-warm text-5xl font-bold tabular-nums tracking-tight"
                >
                  {formatCurrency(result.salesPriceInclVat)}
                </motion.p>
                <p className="text-muted text-xs mt-1">per stuk</p>
              </div>

              <h2 className="text-espresso/70 text-xs font-semibold uppercase tracking-wider px-1">
                Resultaten
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <ResultCard
                  label="Excl. btw"
                  value={result.salesPriceExVat}
                  index={0}
                />
                <ResultCard
                  label="Kostprijs p/st"
                  value={result.costPerPiece}
                  index={1}
                />
                <ResultCard
                  label="Winst per stuk"
                  value={result.profitPerPiece}
                  highlight
                  index={2}
                />
                <ResultCard
                  label="Totale winst"
                  value={result.totalProfit}
                  highlight
                  index={3}
                />
              </div>

              <div className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-3">
                <h3 className="text-warm text-xs font-bold uppercase tracking-wider">Kostenverdeling</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Ingrediënten', value: result.totalIngredientCost },
                    { label: 'Verpakking', value: result.totalPackagingCost },
                    { label: 'Arbeid', value: result.totalLaborCost },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1 border-b border-espresso-light/30 last:border-0">
                      <span className="text-muted text-sm">{row.label}</span>
                      <span className="text-espresso text-sm font-medium tabular-nums">{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-espresso text-sm font-semibold">Totale kosten</span>
                    <span className="text-espresso text-sm font-bold tabular-nums">{formatCurrency(result.totalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleSave}
                  >
                    {saved ? '✓ Opgeslagen' : 'Opslaan'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleReset}
                  >
                    Wissen
                  </Button>
                </div>
                <button
                  onClick={handleSaveAsRecipe}
                  className="w-full flex items-center justify-center gap-2 bg-warm-bg text-warm font-semibold py-3 rounded-full active:scale-[0.98] transition-transform border border-warm/20"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>{recipeSaveFlash ? '✓ Recept opgeslagen' : 'Opslaan als eigen recept'}</span>
                </button>
                <button
                  onClick={handlePdfDownload}
                  className="w-full flex items-center justify-center gap-2 bg-warm-bg text-warm font-semibold py-3 rounded-full active:scale-[0.98] transition-transform border border-warm/20"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download als PDF</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-warm-bg shadow-sm rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="text-warm flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-muted text-sm">Voeg ingrediënten toe om de berekening te starten.</p>
          </motion.div>
        )}
      </div>

      <Footer />

      <ProUpsellModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        feature={proModalFeature}
      />
    </div>
  )
}
