/**
 * Eigen recept-foto's (Pro feature).
 *
 * Gebruikers kunnen hun eigen foto uploaden voor een recept,
 * die vervangt dan de standaard foto. Opslag in localStorage als data URI.
 *
 * Beperkingen:
 * - Max 1MB per foto (na compressie)
 * - localStorage cap is ~5-10MB → max ~5-10 foto's
 */

const KEY = 'bakepilot_recipe_photos'

interface PhotoMap {
  [recipeId: string]: string // data URI
}

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getPhotoMap(): PhotoMap {
  if (!isClient()) return {}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PhotoMap) : {}
  } catch {
    return {}
  }
}

export function getCustomPhoto(recipeId: string): string | null {
  if (!isClient()) return null
  const map = getPhotoMap()
  return map[recipeId] ?? null
}

export function setCustomPhoto(recipeId: string, dataUri: string): void {
  if (!isClient()) return
  const map = getPhotoMap()
  map[recipeId] = dataUri
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch (e) {
    // Quota exceeded
    console.error('Foto kon niet worden opgeslagen — opslagruimte vol', e)
    throw new Error(
      'Opslagruimte vol. Verwijder een eigen foto om ruimte te maken.'
    )
  }
}

export function deleteCustomPhoto(recipeId: string): void {
  if (!isClient()) return
  const map = getPhotoMap()
  delete map[recipeId]
  localStorage.setItem(KEY, JSON.stringify(map))
}

/**
 * Lees een geüpload bestand en comprimeer naar max 1024×768 JPEG.
 * Resultaat: data URI string (data:image/jpeg;base64,...)
 */
export async function compressAndReadImage(
  file: File,
  maxWidth = 1024,
  maxHeight = 768,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Bereken resize-verhouding
        let { width, height } = img
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas niet beschikbaar'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        try {
          const dataUri = canvas.toDataURL('image/jpeg', quality)
          resolve(dataUri)
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('Kan foto niet inladen'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Kan bestand niet lezen'))
    reader.readAsDataURL(file)
  })
}
