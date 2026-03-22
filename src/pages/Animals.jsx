import { useState } from 'react'

const ANIMALS = [
  {
    name: 'Shadow', type: 'equine', emoji: '🐴',
    breed: 'Horse', notes: 'The biggest equine on the ranch.',
    likes: 'Carrots (sliced), hay',
    dislikes: null,
    odd_but_ok: null,
    special: [
      '🚨 LOAD FIRST during evacuation. Once Shadow is in, the others usually follow.',
      'Needs a full 1 flake of hay at night check (others only get ½).',
    ],
    badge: 'badge-orange',
  },
  {
    name: 'Luke', type: 'equine', emoji: '🐴',
    breed: 'Horse', notes: 'Sweet and gentle disposition.',
    likes: 'Carrots (sliced)',
    dislikes: null,
    odd_but_ok: null,
    special: [
      '💊 Morning pellets contain medication — always give him his "breakfast" labeled bag.',
      'Load LAST during evacuation.',
    ],
    badge: 'badge-red',
  },
  {
    name: 'Snowy', type: 'equine', emoji: '🐴',
    breed: 'Horse', notes: 'Calm and cooperative.',
    likes: 'Carrots (sliced)',
    dislikes: null,
    odd_but_ok: null,
    special: [
      'Will load into trailer if Shadow refuses. Try Snowy second if Shadow won\'t go.',
      'Load second in evacuation sequence.',
    ],
    badge: 'badge-blue',
  },
  {
    name: 'Shiloh', type: 'dog', emoji: '🐕',
    breed: 'Dog', notes: 'Sweet girl.',
    likes: 'Dentastix after breakfast',
    dislikes: 'Too much water in the evening',
    odd_but_ok: 'Wets the bed — this is normal and known.',
    special: [
      '⚠️ NO water after 6:00 PM or she wets the bed.',
    ],
    badge: 'badge-red',
  },
  {
    name: 'Chickens', type: 'chicken', emoji: '🐔',
    breed: 'Mixed flock', notes: 'Free-ranging during the day.',
    likes: 'Mealworms and scratch from the cabinet',
    dislikes: null,
    odd_but_ok: 'Auto coop door — opens at 6am, closes at 9pm. Do your check at ~8:30pm.',
    special: [
      'Check all hens are inside at night check (~8:30pm). Close coop door if open.',
      'Treat: 2 measuring cup scoops each of mealworms and scratch.',
    ],
    badge: 'badge-green',
  },
  {
    name: 'Cats', type: 'cat', emoji: '🐈',
    breed: 'Ranch cats', notes: 'Outdoor / Mud Room cats.',
    likes: null,
    dislikes: 'Being inside the house',
    odd_but_ok: null,
    special: [
      '🚫 Cats are NOT allowed in the house. They are allowed in the Mud Room only.',
      'Check gravity feeder daily and fill if empty.',
    ],
    badge: 'badge-pink',
  },
]

const TYPE_COLORS = {
  equine: '#E67E22',
  dog: '#4A90E2',
  cat: '#9B59B6',
  chicken: '#27AE60',
}

export default function Animals() {
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <div className="page-title">🐾 Animals</div>
      <div className="page-subtitle">Profiles, personalities, and special notes</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {ANIMALS.map(animal => (
          <div
            key={animal.name}
            className="card"
            style={{ cursor: 'pointer', padding: 14, marginBottom: 0, borderTop: `3px solid ${TYPE_COLORS[animal.type]}` }}
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

      {/* Animal detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 48 }}>{selected.emoji}</div>
              <div>
                <div className="modal-title" style={{ marginBottom: 2 }}>{selected.name}</div>
                <span className={`badge ${selected.badge}`}>{selected.breed}</span>
              </div>
            </div>

            {selected.notes && (
              <div style={{ marginBottom: 16 }}>
                <div className="form-label">About</div>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{selected.notes}</p>
              </div>
            )}

            {selected.special && selected.special.length > 0 && (
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
