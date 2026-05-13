import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './calculations'
import { getCustomLogo } from './branding'
import { getSettings } from './settings'
import type { Calculation, Ingredient, CalculationResult } from './types'

interface PDFInput {
  productName: string
  baseYield: number
  desiredYield: number
  ingredients: Ingredient[]
  packagingCost: number
  laborMinutes: number
  laborCostPerHour: number
  marginPercentage: number
  vatPercentage: number
  result: CalculationResult
  savedAt?: string
}

const WARM = '#8B4513'
const ESPRESSO = '#1C1410'
const MUTED = '#8A7968'

/**
 * Genereer een mooie PDF van een berekening en download deze direct.
 */
export function generateCalculationPDF(raw: PDFInput | Calculation): void {
  if (!raw.result) {
    throw new Error('Berekeningsresultaat ontbreekt — kan geen PDF genereren.')
  }
  const input: PDFInput = {
    productName: raw.productName,
    baseYield: raw.baseYield,
    desiredYield: raw.desiredYield,
    ingredients: raw.ingredients,
    packagingCost: raw.packagingCost,
    laborMinutes: raw.laborMinutes,
    laborCostPerHour: raw.laborCostPerHour,
    marginPercentage: raw.marginPercentage,
    vatPercentage: raw.vatPercentage,
    result: raw.result,
    savedAt: raw.savedAt,
  }
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  const customLogo = getCustomLogo()
  const userSettings = getSettings()
  const bakeryName = userSettings.bakeryName || "Parker's Baking"

  // ── Header met merkbalk
  doc.setFillColor(WARM)
  doc.rect(0, 0, pageWidth, 70, 'F')

  // Logo links bovenin (als aanwezig)
  if (customLogo) {
    try {
      // Detect formaat van data URI
      const format = customLogo.startsWith('data:image/png') ? 'PNG' : 'JPEG'
      doc.addImage(customLogo, format, margin, 12, 46, 46)
      // Tekst naast logo
      doc.setTextColor('#FFFFFF')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.text(bakeryName, margin + 60, 35)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Kostprijsberekening · BakePilot`, margin + 60, 50)
    } catch {
      // Fallback bij logo-fout
      doc.setTextColor('#FFFFFF')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('BakePilot', margin, 35)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Kostprijsberekening · ${bakeryName}`, margin, 53)
    }
  } else {
    doc.setTextColor('#FFFFFF')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('BakePilot', margin, 35)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Kostprijsberekening · ${bakeryName}`, margin, 53)
  }

  // datum rechts
  const date = input.savedAt
    ? new Date(input.savedAt).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
  doc.setFontSize(9)
  doc.text(date, pageWidth - margin, 35, { align: 'right' })

  // ── Productnaam
  let y = 100
  doc.setTextColor(ESPRESSO)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(input.productName || 'Naamloos product', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(MUTED)
  y += 18
  doc.text(
    `Basis: ${input.baseYield} stuks · Gewenst: ${input.desiredYield} stuks · BTW ${input.vatPercentage}%`,
    margin,
    y
  )
  y += 25

  // ── Ingrediënten tabel
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(WARM)
  doc.text('INGREDIËNTEN', margin, y)
  y += 10

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Ingrediënt', 'Hoeveelheid', 'Prijs', 'Subtotaal']],
    body: input.ingredients.map((ing) => {
      const unitLabel =
        ing.unit === 'gram' ? 'g'
        : ing.unit === 'kg' ? 'kg'
        : ing.unit === 'liter' ? 'L'
        : ing.unit
      const priceUnit =
        ing.unit === 'gram' || ing.unit === 'kg' ? '€/kg'
        : ing.unit === 'ml' || ing.unit === 'liter' ? '€/L'
        : '€/st'
      const factor =
        ing.unit === 'gram' || ing.unit === 'ml' ? 1000 : 1
      const subtotal = (ing.quantity * ing.pricePerUnit) / factor
      return [
        ing.name || '—',
        `${ing.quantity} ${unitLabel}`,
        `${formatCurrency(ing.pricePerUnit)} ${priceUnit}`,
        formatCurrency(subtotal * (input.desiredYield / Math.max(input.baseYield, 1))),
      ]
    }),
    headStyles: {
      fillColor: [139, 69, 19],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [28, 20, 16],
    },
    alternateRowStyles: { fillColor: [253, 246, 238] },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  })

  // @ts-expect-error autoTable plugin attaches lastAutoTable to doc instance at runtime
  y = doc.lastAutoTable.finalY + 30

  // ── Kostenoverzicht
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(WARM)
  doc.text('KOSTEN & ARBEID', margin, y)
  y += 10

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: [
      ['Ingrediëntkosten', formatCurrency(input.result.totalIngredientCost)],
      [
        `Verpakking (${formatCurrency(input.packagingCost)} × ${input.desiredYield})`,
        formatCurrency(input.result.totalPackagingCost),
      ],
      [
        `Arbeid (${input.laborMinutes} min × ${formatCurrency(input.laborCostPerHour)}/uur)`,
        formatCurrency(input.result.totalLaborCost),
      ],
      [
        { content: 'Totale kosten', styles: { fontStyle: 'bold' } },
        {
          content: formatCurrency(input.result.totalCost),
          styles: { fontStyle: 'bold' },
        },
      ],
      ['Kostprijs per stuk', formatCurrency(input.result.costPerPiece)],
    ],
    bodyStyles: { fontSize: 10, textColor: [28, 20, 16] },
    columnStyles: {
      1: { halign: 'right', cellWidth: 120 },
    },
    theme: 'plain',
  })

  // @ts-expect-error autoTable plugin attaches lastAutoTable to doc instance at runtime
  y = doc.lastAutoTable.finalY + 30

  // ── Verkoopprijs hero
  doc.setFillColor('#FDF6EE')
  doc.roundedRect(margin, y, pageWidth - margin * 2, 100, 8, 8, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(MUTED)
  doc.text(
    `Verkoopprijs (marge ${input.marginPercentage}%, btw ${input.vatPercentage}%)`,
    margin + 20,
    y + 25
  )

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(WARM)
  doc.text(formatCurrency(input.result.salesPriceInclVat), margin + 20, y + 60)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(MUTED)
  doc.text(
    `per stuk · ex btw: ${formatCurrency(input.result.salesPriceExVat)}`,
    margin + 20,
    y + 80
  )

  // Winst rechts
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(MUTED)
  doc.text('Winst per stuk', pageWidth - margin - 20, y + 25, {
    align: 'right',
  })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(ESPRESSO)
  doc.text(formatCurrency(input.result.profitPerPiece), pageWidth - margin - 20, y + 55, {
    align: 'right',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(MUTED)
  doc.text(
    `Totaal: ${formatCurrency(input.result.totalProfit)}`,
    pageWidth - margin - 20,
    y + 75,
    { align: 'right' }
  )

  // ── Footer
  const footerY = doc.internal.pageSize.getHeight() - 30
  doc.setFontSize(8)
  doc.setTextColor(MUTED)
  doc.text(
    `Berekend met BakePilot · ${bakeryName}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  )

  // ── Download
  const safeName = (input.productName || 'berekening')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  doc.save(`bakepilot-${safeName || 'berekening'}.pdf`)
}
