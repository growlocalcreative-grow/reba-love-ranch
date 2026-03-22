import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, X } from 'lucide-react'
import { ANIMAL_TYPES, CARE_TYPES } from '../data/ranchData'

const ANIMALS = ['Luke', 'Snowy', 'Belle', 'Shiloh', 'Dogs', 'Chickens', 'Cats']

const CARE_ITEMS = [
  // Snacks
  { id: 'luke_carrot', animal: 'Luke', type: 'snack', label: 'Carrot (sliced)', schedule: 'daily' },
  { id: 'snowy_carrot', animal: 'Snowy', type: 'snack', label: 'Carrot (sliced)', schedule: 'daily' },
  { id: 'belle_carrot', animal: 'Belle', type: 'snack', label: 'Carrot (sliced)', schedule: 'daily' },
  // Medication
  { id: 'luke_med', animal: 'Luke', type: 'medication', label: 'Morning medicine in breakfast pellets', schedule: 'daily', important: true },
  // Hygiene
  { id: 'dog_teeth', animal: 'Dogs', type: 'hygiene', label: 'Dentastix after breakfast', schedule: 'daily' },
  // Water
  { id: 'shiloh_water', animal: 'Shiloh', type: 'water', label: 'NO water after 6pm', schedule: 'reminder', important: true },
]

export default function DailyCare() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem(`rlr_care_${today}`)
    return saved ? JSON.parse(saved) : {}
  })
  const [notes, setNotes] = useState([])
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteForm, setNoteForm] = useState({ animal: '', type: 'observation', content: '' })
  const [selectedAnimal, setSelectedAnimal] = useState('all')

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    localStorage.setItem(`rlr_care_${today}`, JSON.stringify(next))
  }

  const addNote = () => {
    if (!noteForm.content.trim()) return
    setNotes(prev => [{ ...noteForm, id: Date.now(), time: new Date().toLocaleTimeString() }, ...prev])
    setNoteForm({ animal: '', type: 'observation', content: '' })
    setShowNoteModal(false)
  }

  const categories = [
    {
      title: 'Medication', icon: '💊', color: 'var(--danger)',
      items: CARE_ITEMS.filter(i => i.type === 'medication')
    },
    {
      title: 'Snacks & Treats', icon: '🥕', color: 'var(--warning)',
      items: CARE_ITEMS.filter(i => i.type === 'snack')
    },
    {
      title: 'Hygiene', icon: '🧼', color: 'var(--sky-blue)',
      items: CARE_ITEMS.filter(i => i.type === 'hygiene')
    },
    {
      title: 'Water Reminders', icon: '💧', color: '#0288D1',
      items: CARE_ITEMS.filter(i => i.type === 'water')
    },
  ]

  return (
    <div>
      <div className="page-title">❤️ Daily Care</div>
      <div className="page-subtitle">Snacks, hygiene, medication &amp; special care routines</div>

      {/* Care categories */}
      {categories.map(cat => (
        <div key={cat.title} className="card">
          <div className="card-header">
            <div className="card-title">
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </div>
          </div>
          {cat.items.map(item => (
            <div
              key={item.id}
              className="check-row"
              onClick={() => item.type !== 'water' && toggle(item.id)}
              style={{ cursor: item.type === 'water' ? 'default' : 'pointer' }}
            >
              {item.type !== 'water' ? (
                <div className={`check-box ${checked[item.id] ? 'checked' : ''}`}>
                  {checked[item.id] && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
              ) : (
                <span style={{ fontSize: 20, width: 26, textAlign: 'center' }}>⚠️</span>
              )}
              <div>
                <div className={`check-label ${checked[item.id] ? 'completed' : ''}`} style={item.important ? { color: item.type === 'medication' ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 } : {}}>
                  {ANIMAL_TYPES[item.animal?.toLowerCase()] ? ANIMAL_TYPES[item.animal.toLowerCase()].emoji : '🐾'} <strong>{item.animal}</strong>: {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Animal personality notes quick ref */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>🧠 Personality Notes</div>
        {[
          { name: 'Belle', emoji: '🐴', note: 'Biggest equine. Load first in evacuation.', badge: 'badge-orange' },
          { name: 'Luke', emoji: '🐴', note: 'Sweet and gentle. ⚠️ Needs medicine in morning pellets.', badge: 'badge-red' },
          { name: 'Snowy', emoji: '🐴', note: 'Will load if Belle won\'t. Load second in evacuation.', badge: 'badge-blue' },
          { name: 'Shiloh', emoji: '🐕', note: 'No water after 6pm — wets the bed.', badge: 'badge-red' },
          { name: 'Cats', emoji: '🐈', note: 'Not allowed in the house. Mud Room only.', badge: 'badge-grey' },
        ].map(a => (
          <div key={a.name} className="check-row" style={{ cursor: 'default' }}>
            <span style={{ fontSize: 22, width: 30 }}>{a.emoji}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>{a.name}</div>
              <div className="check-note">{a.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Grooming / hygiene schedule */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 10 }}>✂️ Grooming &amp; Hygiene</div>
        <div className="alert alert-info" style={{ marginBottom: 0 }}>
          <div className="alert-content">
            <div className="alert-body">Log grooming, hoof picking, or any hygiene events using the Notes page. Take photos and upload them for the owner.</div>
          </div>
        </div>
      </div>

      {/* Care log */}
      {notes.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>📋 Today's Care Notes</div>
          {notes.map(n => (
            <div key={n.id} className="check-row" style={{ cursor: 'default' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-grey)', marginBottom: 2 }}>
                  {n.animal || 'General'} · {n.time}
                </div>
                <div style={{ fontSize: 14 }}>{n.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowNoteModal(true)}>
        <Plus />
      </button>

      {/* Note modal */}
      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Add Care Note</div>

            <div className="form-group">
              <label className="form-label">Animal</label>
              <select className="form-select" value={noteForm.animal} onChange={e => setNoteForm({ ...noteForm, animal: e.target.value })}>
                <option value="">General</option>
                {ANIMALS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={noteForm.type} onChange={e => setNoteForm({ ...noteForm, type: e.target.value })}>
                <option value="observation">Observation</option>
                <option value="concern">Concern</option>
                <option value="grooming">Grooming</option>
                <option value="medication">Medication given</option>
                <option value="snack">Snack given</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Note</label>
              <textarea
                className="form-textarea"
                placeholder="Describe what you observed or did..."
                value={noteForm.content}
                onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowNoteModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={addNote}>Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
