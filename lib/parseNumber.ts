/**
 * Parse een getal-string met Nederlandse of internationale opmaak.
 *
 * Voorbeelden:
 *   "2000"      → 2000
 *   "2.000"     → 2000   (NL duizendscheidings­teken)
 *   "2,000"     → 2000   (alternatief duizendscheidings­teken)
 *   "2,18"      → 2.18   (NL decimaal)
 *   "2.18"      → 2.18   (EN decimaal)
 *   "1.234,56"  → 1234.56 (NL mix)
 *   "1,234.56"  → 1234.56 (EN mix)
 *
 * Regels:
 *   - Als beide `.` en `,` voorkomen: laatste is decimaal, andere = duizendscheidings­teken
 *   - Eén soort scheidings­teken meerdere keren → allemaal duizendscheidings­teken
 *   - Eén scheidings­teken met exact 3 cijfers erna → duizendscheidings­teken
 *   - Anders → decimaalscheidings­teken
 */
export function parseLocaleNumber(raw: string): number {
  if (typeof raw !== 'string') return 0
  const trimmed = raw.trim()
  if (!trimmed) return 0

  const lastDot = trimmed.lastIndexOf('.')
  const lastComma = trimmed.lastIndexOf(',')

  // Beide aanwezig: laatste = decimaal
  if (lastDot >= 0 && lastComma >= 0) {
    const normalized =
      lastComma > lastDot
        ? trimmed.replace(/\./g, '').replace(',', '.')
        : trimmed.replace(/,/g, '')
    const n = parseFloat(normalized)
    return isNaN(n) ? 0 : n
  }

  const sep = lastDot >= 0 ? '.' : lastComma >= 0 ? ',' : null
  if (!sep) {
    const n = parseFloat(trimmed)
    return isNaN(n) ? 0 : n
  }

  const parts = trimmed.split(sep)
  if (parts.length > 2) {
    // Meerdere scheidings­tekens van zelfde soort → allemaal duizend
    const n = parseFloat(parts.join(''))
    return isNaN(n) ? 0 : n
  }

  const [before, after] = parts
  // Exact 3 cijfers erna + alleen-cijfers ervoor → duizendscheidings­teken
  if (/^\d+$/.test(before) && /^\d{3}$/.test(after)) {
    const n = parseFloat(before + after)
    return isNaN(n) ? 0 : n
  }

  // Anders: decimaal (komma → punt voor parseFloat)
  const n = parseFloat(trimmed.replace(',', '.'))
  return isNaN(n) ? 0 : n
}
