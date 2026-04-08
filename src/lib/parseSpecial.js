/**
 * Parse the `special` field from animals_edit.
 *
 * After the April 2026 data migration all records are clean —
 * special is stored as a single JSON.stringify'd array.
 *
 * We keep a light defensive fallback for any future records
 * that might arrive double-encoded via the Admin Panel.
 */
export function parseSpecial(raw) {
  // Already a proper array — ideal case
  if (Array.isArray(raw)) return raw
  if (!raw) return []

  // Single parse — the normal case after migration
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    // Double-encoded edge case — parse once more
    if (typeof parsed === 'string') {
      try {
        const again = JSON.parse(parsed)
        if (Array.isArray(again)) return again
      } catch {}
    }
  } catch {}

  // Last resort — treat raw string as single item
  return typeof raw === 'string' && raw.trim() ? [raw] : []
}
