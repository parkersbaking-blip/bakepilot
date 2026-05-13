'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Header from '@/components/Header'
import BackBar from '@/components/BackBar'
import Footer from '@/components/Footer'
import Input from '@/components/Input'
import NumberField from '@/components/NumberField'
import Button from '@/components/Button'
import ProUpsellModal from '@/components/ProUpsellModal'
import {
  getSettings,
  saveSettings,
  resetSettings,
  DEFAULT_SETTINGS,
  type UserSettings,
} from '@/lib/settings'
import {
  getCustomLogo,
  setCustomLogo,
  deleteCustomLogo,
  compressLogoImage,
} from '@/lib/branding'
import { isProUser } from '@/lib/pro'

export default function InstellingenPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [savedFlash, setSavedFlash] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [pro, setPro] = useState(false)
  const [proModalOpen, setProModalOpen] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
    setLogo(getCustomLogo())
    setPro(isProUser())
  }, [])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!pro) {
      setProModalOpen(true)
      e.target.value = ''
      return
    }
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Kies een afbeelding (PNG of JPG)')
      return
    }
    setUploadingLogo(true)
    try {
      const dataUri = await compressLogoImage(file)
      setCustomLogo(dataUri)
      setLogo(dataUri)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Logo uploaden mislukt')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  function handleRemoveLogo() {
    if (!confirm('Logo verwijderen?')) return
    deleteCustomLogo()
    setLogo(null)
  }

  function handleTriggerLogoUpload() {
    if (!pro) {
      setProModalOpen(true)
      return
    }
    document.getElementById('logo-upload-input')?.click()
  }

  function update<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  function handleSave() {
    saveSettings(settings)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2000)
  }

  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true)
      setTimeout(() => setResetConfirm(false), 4000)
      return
    }
    resetSettings()
    setSettings(DEFAULT_SETTINGS)
    setResetConfirm(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showLogo title="Instellingen" />
      <BackBar />

      <div className="px-4 pt-6 pb-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-espresso text-2xl font-bold">Mijn instellingen</h1>
          <p className="text-muted text-sm mt-1 leading-relaxed">
            Vul één keer je standaardwaarden in. De calculator gebruikt deze
            automatisch bij elke nieuwe berekening, dus je hoeft ze niet steeds
            opnieuw in te vullen.
          </p>
        </motion.div>

        {/* Bakkerij */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4"
        >
          <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
            Mijn bakkerij
          </h2>
          <Input
            label="Bakkerij-naam (optioneel)"
            placeholder="bijv. Parker's Baking"
            value={settings.bakeryName}
            onChange={(e) => update('bakeryName', e.target.value)}
          />
          <p className="text-muted text-xs">
            💡 Deze naam komt op de PDF-export bovenaan te staan.
          </p>

          {/* Logo upload */}
          <div className="pt-4 border-t border-warm-bg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Eigen logo
              </label>
              {!pro && (
                <span className="text-[9px] bg-warm text-white px-2 py-0.5 rounded-full font-bold">
                  PRO
                </span>
              )}
            </div>

            {logo ? (
              <div className="space-y-3">
                <div className="bg-warm-bg/40 rounded-xl p-4 flex items-center justify-center min-h-[120px]">
                  <Image
                    src={logo}
                    alt="Jouw logo"
                    width={200}
                    height={100}
                    className="object-contain max-h-24"
                    unoptimized
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleTriggerLogoUpload}
                    className="flex-1 bg-warm-bg text-warm font-bold py-2.5 rounded-xl text-sm hover:bg-warm-bg/80"
                  >
                    {uploadingLogo ? '⏳ Bezig...' : 'Vervang logo'}
                  </button>
                  <button
                    onClick={handleRemoveLogo}
                    className="bg-warm-bg text-red-600 font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleTriggerLogoUpload}
                disabled={uploadingLogo}
                className="w-full border-2 border-dashed border-warm-bg rounded-xl p-6 text-center hover:border-warm/40 transition-colors active:scale-[0.99]"
              >
                <p className="text-3xl mb-1">🎨</p>
                <p className="text-warm text-sm font-bold">
                  {uploadingLogo
                    ? 'Bezig met uploaden...'
                    : pro
                      ? 'Klik om je logo te uploaden'
                      : '🔒 Logo uploaden (Pro)'}
                </p>
                <p className="text-muted text-[10px] mt-1">
                  PNG of JPG, max 600×600 px aanbevolen
                </p>
              </button>
            )}
            <input
              id="logo-upload-input"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <p className="text-muted text-xs mt-2">
              💡 Je logo verschijnt op PDF-export, etiketten en in print-versies.
            </p>
          </div>
        </motion.section>

        {/* Arbeidskosten */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4"
        >
          <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
            Arbeid
          </h2>
          <NumberField
            label="Mijn uurloon"
            unit="€/uur"
            value={settings.laborCostPerHour}
            onChange={(v) => update('laborCostPerHour', v)}
          />
          <div className="bg-warm-bg/60 rounded-xl p-3 text-xs text-espresso leading-relaxed">
            <p className="font-bold text-warm mb-1">💡 Hoe kies je dit?</p>
            <p className="text-muted">
              <strong>Hobby/zelf bakken:</strong> €0–€10 (je rekent je eigen tijd
              niet of weinig)<br />
              <strong>Bijverdienste / verkopen:</strong> €12–€18<br />
              <strong>Professionele bakker:</strong> €18–€25 (zelf-werkgever)<br />
              <strong>Bakker met personeel:</strong> €22–€35 (incl. werkgeverslast)
            </p>
          </div>
        </motion.section>

        {/* Prijsstelling */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4"
        >
          <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
            Prijsstelling
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Standaard marge"
              unit="%"
              value={settings.marginPercentage}
              onChange={(v) => update('marginPercentage', v)}
            />
            <NumberField
              label="BTW tarief"
              unit="%"
              value={settings.vatPercentage}
              onChange={(v) => update('vatPercentage', v)}
            />
          </div>
          <div className="bg-warm-bg/60 rounded-xl p-3 text-xs text-espresso leading-relaxed">
            <p className="font-bold text-warm mb-1">💡 Tips</p>
            <p className="text-muted">
              <strong>Marge</strong> is de winst die op de kostprijs komt.
              30–40% is normaal voor bakkerij. Té lage marge = je verdient niks.<br />
              <strong>BTW:</strong> 9% voor voedingsmiddelen, 21% voor non-food.
            </p>
          </div>
        </motion.section>

        {/* Verpakking */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="bg-white border border-warm-bg shadow-sm rounded-3xl p-5 space-y-4"
        >
          <h2 className="text-warm text-sm font-bold uppercase tracking-wider">
            Verpakking
          </h2>
          <NumberField
            label="Standaard verpakkingskosten"
            unit="€/stuk"
            value={settings.packagingCost}
            onChange={(v) => update('packagingCost', v)}
          />
          <div className="bg-warm-bg/60 rounded-xl p-3 text-xs text-espresso leading-relaxed">
            <p className="font-bold text-warm mb-1">💡 Voorbeelden</p>
            <p className="text-muted">
              Papieren broodzak: €0,03–€0,08<br />
              Plastic boterham-/koekjeszak: €0,05–€0,10<br />
              Cake-doosje: €0,20–€0,40<br />
              Gebak-doosje met plakje: €0,30–€0,60
            </p>
          </div>
        </motion.section>

        {/* Acties */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
            {savedFlash ? '✓ Opgeslagen' : 'Instellingen opslaan'}
          </Button>
          <Button
            variant={resetConfirm ? 'danger' : 'ghost'}
            size="md"
            fullWidth
            onClick={handleReset}
          >
            {resetConfirm
              ? 'Klik nogmaals om te bevestigen'
              : 'Terugzetten naar standaard'}
          </Button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('bakepilot_onboarded')
                window.location.href = '/welkom'
              }
            }}
            className="w-full text-muted/60 text-xs underline underline-offset-2 py-2"
          >
            Welkomstscherm opnieuw bekijken
          </button>
        </motion.div>
      </div>

      <Footer />

      <ProUpsellModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        feature="Eigen logo uploaden"
      />
    </div>
  )
}
