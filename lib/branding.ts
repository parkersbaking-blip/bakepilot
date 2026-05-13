/**
 * Eigen branding (logo) — Pro feature.
 * Opgeslagen als data URI in localStorage, gecomprimeerd naar max 600x600.
 */

const KEY = 'bakepilot_brand_logo'

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getCustomLogo(): string | null {
  if (!isClient()) return null
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setCustomLogo(dataUri: string): void {
  if (!isClient()) return
  try {
    localStorage.setItem(KEY, dataUri)
  } catch (e) {
    console.error('Logo kon niet worden opgeslagen', e)
    throw new Error('Opslagruimte vol — verwijder een eigen foto om ruimte vrij te maken.')
  }
}

export function deleteCustomLogo(): void {
  if (!isClient()) return
  localStorage.removeItem(KEY)
}

/**
 * Lees + comprimeer logo naar max 600x600 PNG met transparantie behouden.
 */
export async function compressLogoImage(file: File, maxSize = 600, quality = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
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
          // PNG voor transparantie (logo's hebben vaak transparante achtergrond)
          // Als file PNG was → PNG output; anders JPEG (kleiner)
          const isPng = file.type === 'image/png'
          const dataUri = isPng
            ? canvas.toDataURL('image/png')
            : canvas.toDataURL('image/jpeg', quality)
          resolve(dataUri)
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('Kan logo niet inladen'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Kan bestand niet lezen'))
    reader.readAsDataURL(file)
  })
}
