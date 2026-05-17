'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SECTIONS = [
  {
    title: '1. Wie we zijn',
    content:
      'BakePilot is een product van Parkersbaking (hierna "wij"). Deze privacyverklaring beschrijft hoe wij omgaan met persoonsgegevens van gebruikers van de BakePilot-app. Wij respecteren je privacy en zijn transparant over welke gegevens we verzamelen en waarom.',
  },
  {
    title: '2. Welke gegevens we verzamelen',
    content:
      'BakePilot werkt grotendeels lokaal op je apparaat. Recepten, kostprijsberekeningen, instellingen, bestellingen en eigen logo worden uitsluitend opgeslagen in de localStorage van je browser — niet op onze servers. Als je je aanmeldt voor de wachtlijst slaan we je e-mailadres en (optioneel) je naam en gebruikerssegment lokaal op tot we naar een echte backend overstappen.',
  },
  {
    title: '3. Waarvoor we gegevens gebruiken',
    content:
      'Wachtlijst-gegevens gebruiken we uitsluitend om je te informeren wanneer accounts beschikbaar zijn en eventueel relevante updates over BakePilot te delen. We verkopen, verhuren of delen je gegevens nooit met derden voor commerciële doeleinden.',
  },
  {
    title: '4. Cookies en tracking',
    content:
      'BakePilot gebruikt geen tracking-cookies, geen analytics-cookies en geen advertentie-cookies. We gebruiken alleen technische localStorage om je voorkeuren en data te bewaren op je eigen apparaat. Er wordt geen profiel van je opgebouwd.',
  },
  {
    title: '5. Hosting en infrastructuur',
    content:
      'De app wordt gehost via Vercel (Vercel Inc., VS) — met servers in Amsterdam voor Nederlandse bezoekers. De code wordt versie-gecontroleerd via GitHub (Microsoft, VS). Beide partijen bieden gegevensbescherming volgens de AVG en hebben Data Processing Agreements voor EU-klanten.',
  },
  {
    title: '6. Jouw rechten',
    content:
      'Onder de AVG (Algemene Verordening Gegevensbescherming) heb je het recht om je gegevens in te zien, te corrigeren, te verwijderen of de verwerking te beperken. Omdat de meeste data lokaal op je apparaat staat, kun je deze zelf wissen via de instellingen-pagina ("Terugzetten naar standaard") of via je browser-instellingen. Voor wachtlijst-gegevens kun je contact met ons opnemen.',
  },
  {
    title: '7. Bewaartermijn',
    content:
      'Lokaal opgeslagen data blijft op je apparaat tot je het zelf verwijdert of de browser-storage leegt. Wachtlijst-gegevens bewaren we tot je een echt account aanmaakt of expliciet aangeeft van de wachtlijst af te willen.',
  },
  {
    title: '8. Beveiliging',
    content:
      'We nemen passende technische maatregelen om je gegevens te beschermen: HTTPS-verbinding voor alle data, geen onnodige logging, en lokale data-opslag waar mogelijk. Wachtlijst-inschrijvingen worden niet versleuteld in localStorage — gebruik geen gevoelige gegevens in vrije velden.',
  },
  {
    title: '9. Kinderen',
    content:
      'BakePilot is niet gericht op kinderen jonger dan 16 jaar. We verzamelen niet bewust gegevens van kinderen. Mocht je vermoeden dat een kind onder de 16 zich heeft aangemeld, neem dan contact met ons op zodat we de gegevens kunnen verwijderen.',
  },
  {
    title: '10. Wijzigingen',
    content:
      'Deze privacyverklaring kan in de toekomst worden bijgewerkt — bijvoorbeeld wanneer we cloud-accounts via Supabase introduceren. We zullen wezenlijke wijzigingen duidelijk communiceren in de app.',
  },
  {
    title: '11. Contact',
    content:
      'Heb je vragen, klachten of wil je je gegevens laten verwijderen? Neem contact op via Parkersbaking. Je hebt daarnaast altijd het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Header showLogo title="Privacyverklaring" />

      <div className="px-4 pt-6 pb-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <h1 className="text-espresso text-2xl font-bold">Privacyverklaring</h1>
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <p className="text-muted text-xs leading-relaxed">
            Bij BakePilot blijft je data zoveel mogelijk lokaal. We zijn duidelijk over wat we wel en niet doen.
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
