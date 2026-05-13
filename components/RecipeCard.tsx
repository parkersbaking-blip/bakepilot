'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getCustomPhoto } from '@/lib/recipePhotos'
import type { Recipe } from '@/lib/types'

interface RecipeCardProps {
  recipe: Recipe
  index?: number
  onSelect: (recipe: Recipe) => void
}

const difficultyColor = {
  Makkelijk: 'text-emerald-700 bg-emerald-100',
  Gemiddeld: 'text-amber-700 bg-amber-100',
  Moeilijk: 'text-red-700 bg-red-100',
}

const categoryEmoji: Record<string, string> = {
  'Brood': '🥖',
  'Zoet gebak': '🧁',
  'Cake': '🎂',
  'Koekjes': '🍪',
}

export default function RecipeCard({ recipe, index = 0, onSelect }: RecipeCardProps) {
  const [imgError, setImgError] = useState(false)
  const [customPhoto, setCustomPhotoState] = useState<string | null>(null)

  useEffect(() => {
    setCustomPhotoState(getCustomPhoto(recipe.id))
  }, [recipe.id])

  const photoSrc = customPhoto || recipe.photo
  const showImage = photoSrc && !imgError
  const fallbackEmoji = categoryEmoji[recipe.category] ?? '🍞'

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(recipe)}
      className="w-full bg-white border border-warm-bg rounded-3xl overflow-hidden shadow-sm text-left"
    >
      <div className="relative w-full h-44 overflow-hidden bg-warm-bg flex items-center justify-center">
        {showImage ? (
          <Image
            src={photoSrc!}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            onError={() => setImgError(true)}
            unoptimized={!!customPhoto}
          />
        ) : (
          <span className="text-6xl">{fallbackEmoji}</span>
        )}
        <div className="absolute top-3 left-3 bg-white/95 rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
          <span className="text-xs">⭐</span>
          <span className="text-espresso text-xs font-bold">4.8</span>
        </div>
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyColor[recipe.difficulty]}`}
        >
          {recipe.difficulty}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-espresso font-bold text-lg leading-tight">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted text-xs">{recipe.category}</p>
            {recipe.subcategory && (
              <span className="bg-warm-bg text-warm text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {recipe.subcategory}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted text-xs">
          <div className="flex items-center gap-1">
            <span>⏱</span>
            <span>{recipe.prepTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📦</span>
            <span>
              {recipe.baseYield} {recipe.yieldUnit}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>🧂</span>
            <span>{recipe.ingredients.length} ingr.</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-warm-bg">
          <span className="text-warm text-sm font-semibold">
            Gebruik in calculator
          </span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8B4513"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </motion.button>
  )
}
