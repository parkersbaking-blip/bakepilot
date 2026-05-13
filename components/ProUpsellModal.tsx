'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface ProUpsellModalProps {
  open: boolean
  onClose: () => void
  feature?: string
}

const PRO_FEATURES = [
  { icon: '🏷️', label: 'EU-conforme etiketten met vetgedrukte allergenen' },
  { icon: '🥖', label: 'Broodverbeteraar-suggesties met automatische dosering' },
  { icon: '📷', label: "Eigen recept-foto's uploaden" },
  { icon: '☁️', label: 'Cloud sync over al je apparaten (binnenkort)' },
  { icon: '🎨', label: 'Eigen logo op PDF & etiketten' },
]

export default function ProUpsellModal({
  open,
  onClose,
  feature = 'PDF export',
}: ProUpsellModalProps) {
  const router = useRouter()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-espresso/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0, 0, 1] }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header met warm accent */}
            <div className="bg-warm p-6 text-center relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white"
                aria-label="Sluiten"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={1}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-white text-xs font-bold uppercase tracking-wider">Pro feature</span>
              </div>
              <h2 className="text-white text-xl font-bold">
                {feature} is een Pro feature
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Upgrade naar Pro en haal alles uit BakePilot
              </p>
            </div>

            <div className="p-6 space-y-5">
              <ul className="space-y-3">
                {PRO_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-warm-bg rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {f.icon}
                    </div>
                    <span className="text-espresso text-sm font-medium">{f.label}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-warm-bg rounded-2xl p-4 text-center">
                <p className="text-espresso text-sm">
                  <span className="text-warm text-2xl font-extrabold">€7,99</span>
                  <span className="text-muted text-sm"> / maand</span>
                </p>
                <p className="text-muted text-xs mt-1">Op elk moment opzegbaar</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose()
                    router.push('/pro')
                  }}
                  className="w-full bg-warm text-white text-base font-semibold rounded-full py-3.5 shadow-md active:scale-[0.98] transition-transform"
                >
                  Bekijk Pro
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-muted text-sm font-medium py-2 active:scale-95 transition-transform"
                >
                  Misschien later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
