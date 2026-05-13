'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import BackBar from '@/components/BackBar'
import Footer from '@/components/Footer'

const SECTIONS = [
  {
    title: '1. Intellectueel eigendom',
    content: 'BakePilot is een product van Parkersbaking. Alle content, berekeningen, recepten, designs, teksten en software zijn eigendom van Parkersbaking en beschermd door het auteursrecht. Het is niet toegestaan om enige inhoud van BakePilot te kopiëren, reproduceren, verspreiden of op andere wijze te gebruiken zonder voorafgaande schriftelijke toestemming van Parkersbaking.',
  },
  {
    title: '2. Verbod op scrapen en data-extractie',
    content: 'Het gebruik van geautomatiseerde middelen, bots, scrapers of andere tools om data, recepten of berekeningen uit BakePilot te extraheren is strikt verboden. Dit geldt ook voor gedeeltelijke extractie van content of het systematisch ophalen van informatie via welk middel dan ook.',
  },
  {
    title: '3. Verbod op reverse engineering',
    content: 'Het is niet toegestaan om BakePilot te decompileren, te disassembleren, te reverse engineeren of op enige andere wijze de broncode of onderliggende technologie te achterhalen of te reproduceren.',
  },
  {
    title: '4. Verbod op commercieel hergebruik',
    content: 'De content van BakePilot mag niet worden gebruikt voor commerciële doeleinden zonder uitdrukkelijke toestemming van Parkersbaking. Dit omvat, maar is niet beperkt tot, het verkopen, licentiëren of anderszins commercieel exploiteren van enige inhoud afkomstig van BakePilot.',
  },
  {
    title: '5. Gebruik van de applicatie',
    content: 'BakePilot is uitsluitend bedoeld voor persoonlijk gebruik door thuisbakkers en kleine bakkerijen als hulpmiddel bij het maken van indicatieve berekeningen. De resultaten zijn indicatief en vormen geen financieel of juridisch advies. Parkersbaking is niet aansprakelijk voor beslissingen die worden genomen op basis van de berekeningen in BakePilot.',
  },
  {
    title: '6. Disclaimer',
    content: 'BakePilot wordt aangeboden "as is" zonder enige garantie. De berekeningen zijn bedoeld als richtlijn en kunnen afwijken van de werkelijke kosten en prijzen. Parkersbaking is niet verantwoordelijk voor eventuele onjuistheden in de berekeningen of de gevolgen van het gebruik van de applicatie.',
  },
  {
    title: '7. Wijzigingen',
    content: 'Parkersbaking behoudt zich het recht voor om deze voorwaarden op elk moment te wijzigen. Het voortgezette gebruik van BakePilot na een wijziging van de voorwaarden houdt in dat u akkoord gaat met de gewijzigde voorwaarden.',
  },
]

export default function VoorwaardenPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header showLogo title="Voorwaarden" />
      <BackBar />

      <div className="px-4 pt-6 pb-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className="text-espresso text-2xl font-bold">Gebruiksvoorwaarden</h1>
          <p className="text-muted text-sm mt-1">
            BakePilot door Parkersbaking · Laatst bijgewerkt: mei 2026
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
          className="bg-espresso-card border border-champagne/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="text-champagne flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-muted text-xs leading-relaxed">
            Door BakePilot te gebruiken gaat u akkoord met deze voorwaarden. Lees ze aandachtig.
          </p>
        </motion.div>

        <div className="space-y-4">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.04, ease: 'easeOut' }}
              className="bg-espresso-card border border-espresso-light/40 rounded-2xl p-5 space-y-2"
            >
              <h2 className="text-champagne text-sm font-semibold">{section.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-2"
        >
          <p className="text-muted/60 text-xs">
            Vragen? Neem contact op via Parkersbaking.
          </p>
          <Link
            href="/home"
            className="text-champagne text-sm underline underline-offset-2 hover:text-champagne-light transition-colors"
          >
            ← Terug naar app
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
