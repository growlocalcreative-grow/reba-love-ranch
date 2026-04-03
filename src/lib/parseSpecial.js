/**
 * Defensively parse the `special` field from animals_edit.
 * Real data has three encoding depths due to historical double/triple
 * JSON.stringify calls during early seeding.
 *
 *   Clean (Sunny/Teddy)  → already an array or single-encoded string
 *   Double (Luke/Snowy)  → needs two parses
 *   Triple (Shadow/Chix) → needs three parses
 */
export function parseSpecial(raw) {
  if (Array.isArray(raw)) return raw
  if (!raw) return []

  let value = raw
  let last = raw

  for (let i = 0; i < 5; i++) {
    if (Array.isArray(value)) return value
    if (typeof value !== 'string') break
    try {
      const parsed = JSON.parse(value)
      last = parsed
      value = parsed
    } catch {
      break
    }
  }

  if (Array.isArray(last)) return last
  if (typeof last === 'string' && last.trim()) return [last]
  return []
}
