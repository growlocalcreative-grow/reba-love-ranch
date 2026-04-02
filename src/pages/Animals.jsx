import { useState, useEffect } from 'react'
import { getAnimals } from '../lib/ranchDataService'

const TYPE_COLORS = {
  equine: '#E67E22', dog: '#4A90E2', cat: '#9B59B6',
  chicken: '#27AE60', cow: '#8B6914', goat: '#7D5A3C', pig: '#E91E63',
}

const TYPE_BADGES = {
  equine: 'badge-orange', dog: 'badge-blue', cat: 'badge-pink',
  chicken: 'badge-green', cow: 'badge-orange', goat: 'badge-grey', pig: 'badge-pink',
}

/**
 * Defensively parse the special field.
 * Handles three real-world cases found in the database:
 *   1. Already a JS array              -> return as-is
 *   2. JSON string ["note1","note2"]   -> parse once
 *   3. Double/triple encoded string    -> parse repeatedly until array
 */
function parseSpecial(raw) {
  if (Array.isArray(raw)) return raw
  if (!raw) return []
  let value = raw
  for (let i = 0; i < 4; i++) {
    if (Array.isArray(value)) return value
    if (typeof value !== 'string') return []
    try { value = JSON.parse(value) }
    catch { return [value] }
  }
  return Array.isArray(value) ? value : []
}

function hasWarning(special) {
  return special.some(s => s.includes('💊') || s.includes('⚠️') || s.includes('🚨'))
}

export default function Animals() {
  const [animals, setAnimals] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const docs = await getAnimals()
      const active = (docs || []).filter(a => a.archived !== true && a.archived !== 'true')
      setAnimals(active)
    } catch (e) {
      console.error('Failed to load animals', e)
      setAnimals([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div>
      <div className="page-title">🐾 Animals</div>
      <div className="page-subtitle">Profiles, personalities, and special notes</div>
      <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--slate-grey)' }}>
        Loading animals...
      </div>
    </div>
  )

  if (animals.length === 0) return (
    <div>
      <div className="page-title">🐾 Animals</div>
      <div className="page-subtitle">Profiles, personalities, and special notes</div>
      <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--slate-grey)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🐾</div>
        <div>No animals found. Ask the owner to add animals in the Admin Panel.</div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-title">🐾 Animals</div>
      <div className="page-subtitle">Profiles, personalities, and special notes</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {animals.map(animal => {
          const special = parseSpecial(animal.special)
          return (
            <div
              key={animal.$id}
              className="card"
              style={{ cursor: 'pointer', padding: 14, marginBottom: 0, borderTop: `3px solid ${TYPE_COLORS[animal.type] || 'var(--sky-blue)'}` }}
              onClick={() => setSelected(animal)}
            >
              <div style={{ fontSize: 32, marginBottom: 6 }}>{animal.emoji}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>{animal.name}</div>
              <div style={{ fontSize: 11, color: 'var(--slate-grey)', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', letterSpacing: '0.06em' }}>
                {animal.breed}
              </div>
              {hasWarning(special) && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                  ⚠️ SPECIAL NOTES
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selected && (() => {
        const special = parseSpecial(selected.special)
        return (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ fontSize: 48 }}>{selected.emoji}</div>
                <div>
                  <div className="modal-title" style={{ marginBottom: 2 }}>{selected.name}</div>
                  <span className={`badge ${TYPE_BADGES[selected.type] || 'badge-grey'}`}>{selected.breed}</span>
                </div>
              </div>

              {selected.notes && (
                <div style={{ marginBottom: 16 }}>
                  <div className="form-label">About</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>{selected.notes}</p>
                </div>
              )}

              {special.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="form-label">⭐ Special Care Notes</div>
                  {special.map((s, i) => {
                    const isWarning = s.includes('💊') || s.includes('⚠️') || s.includes('🚨')
                    return (
                      <div key={i} style={{ background: isWarning ? 'rgba(211,47,47,0.06)' : 'rgba(74,144,226,0.06)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontSize: 14, lineHeight: 1.5, borderLeft: `3px solid ${isWarning ? 'var(--danger)' : 'var(--sky-blue)'}` }}>
                        {s}
                      </div>
                    )
                  })}
                </div>
              )}

              {selected.likes && (
                <div style={{ marginBottom: 12 }}>
                  <div className="form-label">😍 Likes</div>
                  <p style={{ fontSize: 14 }}>{selected.likes}</p>
                </div>
              )}

              {selected.dislikes && (
                <div style={{ marginBottom: 12 }}>
                  <div className="form-label">😒 Dislikes</div>
                  <p style={{ fontSize: 14 }}>{selected.dislikes}</p>
                </div>
              )}

              {selected.odd_but_ok && (
                <div style={{ marginBottom: 12 }}>
                  <div className="form-label">🤔 Odd But OK</div>
                  <p style={{ fontSize: 14, color: 'var(--slate-grey)', fontStyle: 'italic' }}>{selected.odd_but_ok}</p>
                </div>
              )}

              <button className="btn btn-ghost btn-full" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
