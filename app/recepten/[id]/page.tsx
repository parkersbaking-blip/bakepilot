'use client'

import { useEffect, useState } from 'react'

const CATEGORY_EMOJI: Record<string, string> = {
  Brood: '🥖',
  'Zoet gebak': '🧁',
  Cake: '🎂',
  Koekjes: '🍪',
}
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NumberField from '@/components/NumberField'
import Button from '@/components/Button'
import { STARTER_RECIPES } from '@/lib/recipes'
import { setSelectedRecipe } from '@/lib/storage'
import {
  getCustomRecipeById,
  deleteCustomRecipe,
  isCustomRecipeId,
  saveCustomRecipe,
  newCustomRecipeId,
} from '@/lib/customRecipes'
import {
  getCustomPhoto,
  setCustomPhoto,
  deleteCustomPhoto,
  compressAndReadImage,
} from '@/lib/recipePhotos'
import { isProUser } from '@/lib/pro'
import ProUpsellModal from '@/components/ProUpsellModal'
import {
  scaleByFlour,
  computeSourdoughTotals,
  flourFromTotalDough,
} from '@/lib/sourdoughScaling'
import type { Recipe } from '@/lib/types'

type ScaleMode = 'flour' | 'loaves' | 'dough'

export default function RecipeDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    if (isCustomRecipeId(params.id)) {
      setRecipe(getCustomRecipeById(params.id))
    } else {
      setRecipe(STARTER_RECIPES.find((r) => r.id === params.id))
    }
    setCustomPhotoState(getCustomPhoto(params.id))
    setPro(isProUser())
    setLoading(false)
  }, [params.id])

  const [mode, setMode] = useState<ScaleMode>('flour')
  const [imgError, setImgError] = useState(false)
  const [flourGrams, setFlourGrams] = useState(500)
  const [loaves, setLoaves] = useState(1)
  const [doughGrams, setDoughGrams] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editInstructions, setEditInstructions] = useState<string[]>([])
  const [editNotes, setEditNotes] = useState('')
  const [saveFlash, setSaveFlash] = useState(false)
  const [customPhoto, setCustomPhotoState] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [proModalOpen, setProModalOpen] = useState(false)
  const [pro, setPro] = useState(false)

  // Sync flourGrams en loaves wanneer recept (asynchroon) is geladen
  useEffect(() => {
    if (!recipe) return
    setFlourGrams(recipe.baseFlourGrams ?? 500)
    setLoaves(recipe.baseYield ?? 1)
  }, [recipe])

  // Recompute flour when mode-source changes
  useEffect(() => {
    if (!recipe) return
    if (mode === 'loaves' && recipe.baseFlourGrams && recipe.baseYield > 0) {
      setFlourGrams(
        Math.round((recipe.baseFlourGrams / recipe.baseYield) * loaves)
      )
    } else if (mode === 'dough' && doughGrams > 0) {
      const totalPct = recipe.ingredients.reduce(
        (s, i) => s + (i.bakerPercentage ?? 0),
        0
      )
      setFlourGrams(Math.round(flourFromTotalDough(doughGrams, totalPct)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, loaves, doughGrams])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header showLogo title="Laden..." />
        <div className="p-6 text-center">
          <div className="inline-block w-8 h-8 border-2 border-warm border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-white">
        <Header showLogo title="Recept" />
        <div className="p-6 text-center">
          <p className="text-muted">Recept niet gevonden.</p>
          <Button
            variant="ghost"
            size="md"
            onClick={() => router.push('/recepten')}
            className="mt-4"
          >
            ← Terug naar recepten
          </Button>
        </div>
      </div>
    )
  }

  const hasBakerPercentages = recipe.ingredients.some(
    (i) => i.bakerPercentage != null
  )
  const scaledIngredients = hasBakerPercentages
    ? scaleByFlour(recipe.ingredients, flourGrams)
    : recipe.ingredients
  const totals = hasBakerPercentages
    ? computeSourdoughTotals(recipe.ingredients, flourGrams)
    : null

  function openInCalculator() {
    if (!recipe) return
    const scaled: Recipe = {
      ...recipe,
      ingredients: scaledIngredients,
      baseYield:
        mode === 'loaves'
          ? loaves
          : recipe.baseYield,
    }
    setSelectedRecipe(scaled)
    router.push('/calculator')
  }

  function handlePrint() {
    window.print()
  }

  async function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!recipe) return
    if (!pro) {
      setProModalOpen(true)
      e.target.value = ''
      return
    }
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Kies een afbeelding (JPG of PNG).')
      return
    }
    setUploading(true)
    try {
      const dataUri = await compressAndReadImage(file)
      setCustomPhoto(recipe.id, dataUri)
      setCustomPhotoState(dataUri)
      setImgError(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Foto uploaden mislukt')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handleRemoveCustomPhoto() {
    if (!recipe) return
    if (!confirm('Eigen foto verwijderen en terug naar standaard foto?')) return
    deleteCustomPhoto(recipe.id)
    setCustomPhotoState(null)
  }

  function handleTriggerUpload() {
    if (!pro) {
      setProModalOpen(true)
      return
    }
    document.getElementById('photo-upload-input')?.click()
  }

  function handleDelete() {
    if (!recipe) return
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      setTimeout(() => setDeleteConfirm(false), 4000)
      return
    }
    deleteCustomRecipe(recipe.id)
    router.push('/recepten')
  }

  function handleMakeMyVersion() {
    if (!recipe) return
    const myCopy: Recipe = {
      ...recipe,
      id: newCustomRecipeId(),
      name: `${recipe.name} (mijn versie)`,
      ingredients: recipe.ingredients.map((ing) => ({ ...ing })),
      instructions: recipe.instructions ? [...recipe.instructions] : undefined,
    }
    saveCustomRecipe(myCopy)
    router.push(`/recepten/${myCopy.id}`)
  }

  function startEditing() {
    if (!recipe) return
    setEditName(recipe.name)
    setEditInstructions(recipe.instructions ? [...recipe.instructions] : [])
    setEditNotes(recipe.notes ?? '')
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
  }

  function saveEdits() {
    if (!recipe) return
    const updated: Recipe = {
      ...recipe,
      name: editName.trim() || recipe.name,
      instructions: editInstructions.filter((s) => s.trim().length > 0),
      notes: editNotes.trim() || undefined,
    }
    saveCustomRecipe(updated)
    setRecipe(updated)
    setEditing(false)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 2000)
  }

  function updateInstructionStep(index: number, value: string) {
    setEditInstructions((prev) =>
      prev.map((s, i) => (i === index ? value : s))
    )
  }

  function addInstructionStep() {
    setEditInstructions((prev) => [...prev, ''])
  }

  function removeInstructionStep(index: number) {
    setEditInstructions((prev) => prev.filter((_, i) => i !== index))
  }

  const isCustom = recipe ? isCustomRecipeId(recipe.id) : false

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title={recipe.name} />

      <div className="pb-4">
        {/* Hero foto — eigen upload heeft prio over standaard foto */}
        <div className="relative w-full h-56 bg-warm-bg flex items-center justify-center group">
          {(customPhoto || (recipe.photo && !imgError)) ? (
            <Image
              src={customPhoto || recipe.photo!}
              alt={recipe.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 512px) 100vw, 512px"
              onError={() => setImgError(true)}
              unoptimized={!!customPhoto}
            />
          ) : (
            <span className="text-7xl">
              {CATEGORY_EMOJI[recipe.category] ?? '🍞'}
            </span>
          )}

          {/* Photo upload knoppen — overlay rechtsboven */}
          <div className="absolute top-3 right-3 flex gap-2 print:hidden">
            <input
              id="photo-upload-input"
              type="file"
              accept="image/*"
              onChange={handleUploadPhoto}
              className="hidden"
            />
            <button
              onClick={handleTriggerUpload}
              disabled={uploading}
              className="bg-white/95 backdrop-blur-sm text-warm font-semibold text-xs px-3 py-2 rounded-full shadow-md flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              {uploading ? (
                <>⏳ Bezig...</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {customPhoto ? 'Vervang foto' : 'Eigen foto'}
                  {!pro && <span className="text-[9px] bg-warm text-white px-1 py-0.5 rounded font-bold">PRO</span>}
                </>
              )}
            </button>
            {customPhoto && (
              <button
                onClick={handleRemoveCustomPhoto}
                className="bg-white/95 backdrop-blur-sm text-red-600 font-semibold text-xs px-3 py-2 rounded-full shadow-md active:scale-95 transition-transform"
                aria-label="Verwijder eigen foto"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="px-4 pt-5 space-y-5">
          {/* Titel + meta */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-warm text-xs font-bold uppercase tracking-wider">
                {recipe.category}
              </span>
              {recipe.subcategory && (
                <>
                  <span className="text-muted/60 text-xs">·</span>
                  <span className="bg-warm-bg text-warm text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {recipe.subcategory}
                  </span>
                </>
              )}
            </div>
            {editing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-warm-bg border border-warm/30 rounded-xl px-3 py-2 text-espresso text-2xl font-bold focus:outline-none focus:border-warm"
                placeholder="Recept-naam"
              />
            ) : (
              <h1 className="text-espresso text-2xl font-bold leading-tight">
                {recipe.name}
                {isCustom && (
                  <span className="ml-2 text-[10px] bg-warm/15 text-warm px-2 py-0.5 rounded-full font-bold align-middle">
                    EIGEN
                  </span>
                )}
              </h1>
            )}
            {recipe.description && !editing && (
              <p className="text-muted text-sm mt-2 leading-relaxed">
                {recipe.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-4 text-muted text-xs">
              <div className="flex items-center gap-1">
                <span>⏱</span>
                <span>{recipe.prepTime} min totaal</span>
              </div>
              <div className="flex items-center gap-1">
                <span>📦</span>
                <span>
                  {recipe.baseYield} {recipe.yieldUnit}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>📊</span>
                <span>{recipe.difficulty}</span>
              </div>
            </div>
          </motion.div>

          {/* Schalen */}
          {hasBakerPercentages && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="bg-warm-bg rounded-3xl p-4 space-y-3"
            >
              <h2 className="text-warm text-xs font-bold uppercase tracking-wider">
                Schalen
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {(['flour', 'loaves', 'dough'] as ScaleMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`text-xs font-semibold py-2 rounded-full transition-colors ${
                      mode === m
                        ? 'bg-warm text-white'
                        : 'bg-white text-muted'
                    }`}
                  >
                    {m === 'flour' && 'Bloem'}
                    {m === 'loaves' && 'Broden'}
                    {m === 'dough' && 'Deeg'}
                  </button>
                ))}
              </div>

              {mode === 'flour' && (
                <NumberField
                  label="Bloemgewicht"
                  unit="g"
                  allowDecimals={false}
                  min={50}
                  value={flourGrams}
                  onChange={(v) => setFlourGrams(v || 50)}
                />
              )}
              {mode === 'loaves' && (
                <NumberField
                  label="Aantal broden"
                  unit="st"
                  allowDecimals={false}
                  min={1}
                  value={loaves}
                  onChange={(v) => setLoaves(v || 1)}
                />
              )}
              {mode === 'dough' && (
                <NumberField
                  label="Totaal deeggewicht"
                  unit="g"
                  allowDecimals={false}
                  min={100}
                  value={doughGrams}
                  onChange={(v) => setDoughGrams(v)}
                />
              )}
            </motion.section>
          )}

          {/* Ingrediënten */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5"
          >
            <h2 className="text-warm text-sm font-bold uppercase tracking-wider mb-3">
              Ingrediënten
            </h2>
            <div className="space-y-1.5">
              <div className="flex items-center text-muted text-[10px] font-semibold uppercase tracking-wider pb-2 border-b border-warm-bg">
                <span className="flex-1">Naam</span>
                <span className="w-16 text-right">Gram</span>
                {hasBakerPercentages && (
                  <span className="w-12 text-right">%</span>
                )}
              </div>
              {scaledIngredients.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-center text-sm py-1.5"
                >
                  <span className="flex-1 text-espresso">{ing.name}</span>
                  <span className="w-16 text-right tabular-nums text-espresso font-semibold">
                    {ing.quantity} {ing.unit === 'gram' ? 'g' : ing.unit}
                  </span>
                  {hasBakerPercentages && (
                    <span className="w-12 text-right tabular-nums text-warm font-semibold">
                      {ing.bakerPercentage != null
                        ? `${ing.bakerPercentage}%`
                        : '—'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {totals && (
              <div className="mt-4 pt-4 border-t border-warm-bg space-y-2">
                <div className="flex justify-between text-xs text-muted">
                  <span>Totaal deeggewicht</span>
                  <span className="text-espresso font-semibold tabular-nums">
                    {totals.totalDoughGrams} g
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Totaal bloem (incl. starter)</span>
                  <span className="text-espresso font-semibold tabular-nums">
                    {totals.totalFlourIncStarter} g
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>Totaal water (incl. starter)</span>
                  <span className="text-espresso font-semibold tabular-nums">
                    {totals.totalWaterIncStarter} g
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-warm-bg">
                  <span className="text-warm font-bold">
                    Echte hydratatie
                  </span>
                  <span className="text-warm font-bold tabular-nums">
                    {totals.realHydration}%
                  </span>
                </div>
              </div>
            )}
          </motion.section>

          {/* Werkwijze */}
          {(recipe.instructions && recipe.instructions.length > 0) || editing ? (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5"
            >
              <h2 className="text-warm text-sm font-bold uppercase tracking-wider mb-3">
                Werkwijze
              </h2>

              {editing ? (
                <div className="space-y-3">
                  {editInstructions.map((step, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warm text-white text-xs font-bold flex items-center justify-center mt-1">
                        {i + 1}
                      </span>
                      <textarea
                        value={step}
                        onChange={(e) =>
                          updateInstructionStep(i, e.target.value)
                        }
                        rows={2}
                        className="flex-1 bg-warm-bg/60 border border-warm-bg rounded-xl px-3 py-2 text-espresso text-sm focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30"
                        placeholder={`Stap ${i + 1}...`}
                      />
                      <button
                        type="button"
                        onClick={() => removeInstructionStep(i)}
                        className="flex-shrink-0 text-muted hover:text-red-500 p-1 mt-1"
                        aria-label="Stap verwijderen"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addInstructionStep}
                    className="w-full bg-warm-bg/60 text-warm font-semibold text-sm py-2.5 rounded-xl border border-warm/20 hover:bg-warm-bg active:scale-[0.99] transition-all"
                  >
                    + Stap toevoegen
                  </button>
                </div>
              ) : (
                <ol className="space-y-3">
                  {recipe.instructions!.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-warm text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-espresso text-sm leading-relaxed">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </motion.section>
          ) : null}

          {/* Notities (alleen bij eigen recepten) */}
          {(isCustom && (recipe.notes || editing)) && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.18 }}
              className="bg-warm-bg/60 rounded-3xl p-5"
            >
              <h2 className="text-warm text-sm font-bold uppercase tracking-wider mb-3">
                Mijn notities
              </h2>
              {editing ? (
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  placeholder="Bv. ik bak deze 5 min korter omdat mijn oven heet is..."
                  className="w-full bg-white border border-warm-bg rounded-xl px-3 py-2 text-espresso text-sm focus:outline-none focus:border-warm focus:ring-1 focus:ring-warm/30"
                />
              ) : (
                <p className="text-espresso text-sm whitespace-pre-wrap leading-relaxed">
                  {recipe.notes}
                </p>
              )}
            </motion.section>
          )}

          {/* Fermentatie + Baktijd */}
          {(recipe.fermentation || recipe.baking) && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid gap-3"
            >
              {recipe.fermentation && (
                <div className="bg-warm-bg rounded-2xl p-4">
                  <p className="text-warm text-xs font-bold uppercase tracking-wider mb-1">
                    Fermentatie
                  </p>
                  <p className="text-espresso text-sm leading-relaxed">
                    {recipe.fermentation}
                  </p>
                </div>
              )}
              {recipe.baking && (
                <div className="bg-warm-bg rounded-2xl p-4">
                  <p className="text-warm text-xs font-bold uppercase tracking-wider mb-1">
                    Bakken
                  </p>
                  <p className="text-espresso text-sm leading-relaxed">
                    {recipe.baking}
                  </p>
                </div>
              )}
            </motion.section>
          )}

          {/* CTA + Edit + Print + Delete */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="pt-2 space-y-3 print:hidden"
          >
            {editing ? (
              <>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={saveEdits}
                  >
                    {saveFlash ? '✓ Opgeslagen' : 'Wijzigingen opslaan'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={cancelEditing}
                  >
                    Annuleer
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={openInCalculator}
                >
                  Open in calculator →
                </Button>

                {/* Starter recept: maak je eigen versie */}
                {!isCustom && (
                  <button
                    onClick={handleMakeMyVersion}
                    className="w-full flex items-center justify-center gap-2 bg-warm/10 text-warm font-semibold py-3 rounded-full active:scale-[0.98] transition-transform border border-warm/30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Maak mijn versie</span>
                  </button>
                )}

                {/* Eigen recept: bewerken */}
                {isCustom && (
                  <button
                    onClick={startEditing}
                    className="w-full flex items-center justify-center gap-2 bg-warm/10 text-warm font-semibold py-3 rounded-full active:scale-[0.98] transition-transform border border-warm/30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Recept bewerken</span>
                  </button>
                )}

                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 bg-warm-bg text-warm font-semibold py-3 rounded-full active:scale-[0.98] transition-transform border border-warm/20"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  <span>Print recept</span>
                </button>

                {isCustom && (
                  <button
                    onClick={handleDelete}
                    className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-full active:scale-[0.98] transition-colors ${
                      deleteConfirm
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'text-muted/70 hover:text-red-600'
                    }`}
                  >
                    {deleteConfirm
                      ? 'Klik nogmaals om te bevestigen'
                      : '🗑️ Eigen recept verwijderen'}
                  </button>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />

      <ProUpsellModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        feature="Eigen recept-foto's uploaden"
      />
    </div>
  )
}
