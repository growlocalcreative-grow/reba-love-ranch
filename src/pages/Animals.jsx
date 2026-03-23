import { useState } from 'react'
import { RANCH_CONFIG } from '../data/ranch.config'

const TYPE_COLORS = {
  equine: '#E67E22', dog: '#4A90E2', cat: '#9B59B6',
  chicken: '#27AE60', cow: '#8B6914', goat: '#7D5A3C', pig: '#E91E63',
}

const TYPE_BADGES = {
  equine: 'badge-orange', dog: 'badge-blue', cat: 'badge-pink',
  chicken: 'badge-green', cow: 'badge-orange', goat: 'badge-grey', pig: 'badge-pink',
}

export default function Animals() {
  const [selected, setSelected] = useState(null)
  const { animals } = RANCH_CONFIG

  return (
    <div>
      <div className="page-title">🐾 Animals</div>
      <div className="page-subtitle">Profiles, personalities, and special notes</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {animals.map(animal => (
          <div
            key={animal.name}
            className="card"
            style={{ cursor: 'pointer', padding: 14, marginBottom: 0, borderTop: `3px solid ${TYPE_COLORS[animal.type] || 'var(--sky-blue)'}` }}
            onClick={() => setSelected(animal)}
          >
            <div style={{ fontSize: 32, marginBottom: 6 }}>{animal.emoji}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16 }}>{animal.name}</div>
            <div style={{ fontSize: 11, color: 'var(--slate-grey)', textTransform: 'uppercase', fontFamily: 'var(--font-heading)', letterSpacing: '0.06em' }}>{animal.breed}</div>
            {animal.special?.some(s => s.includes('💊') || s.includes('⚠️') || s.includes('🚨')) && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>⚠️ SPECIAL NOTES</div>
            )}
          </div>
        ))}
      </div>

      {selected && (
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

            {selected.special?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="form-label">⭐ Special Care Notes</div>
                {selected.special.map((s, i) => (
                  <div key={i} style={{ background: s.includes('💊') || s.includes('⚠️') || s.includes('🚨') ? 'rgba(211,47,47,0.06)' : 'rgba(74,144,226,0.06)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontSize: 14, lineHeight: 1.5, borderLeft: `3px solid ${s.includes('💊') || s.includes('⚠️') || s.includes('🚨') ? 'var(--danger)' : 'var(--sky-blue)'}` }}>
                    {s}
                  </div>
                ))}
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
      )}
    </div>
  )
}
