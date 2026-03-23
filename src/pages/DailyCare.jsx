import { useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { RANCH_CONFIG, ANIMAL_NAMES } from '../data/ranch.config'

export default function DailyCare() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { animals } = RANCH_CONFIG

  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem(`rlr_care_${today}`)
    return saved ? JSON.parse(saved) : {}
  })
  const [notes, setNotes] = useState([])
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteForm, setNoteForm] = useState({ animal: '', type: 'observation', content: '' })

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

  // Build care items dynamically from config
  const medicationItems = animals.flatMap(a =>
    a.special?.filter(s => s.includes('💊')).map(s => ({
      id: `med_${a.name}`, animal: a.name, type: 'medication',
      label: `${a.name}: ${s.replace('💊 ', '')}`, important: true,
    })) || []
  )

  const snackItems = animals
    .filter(a => a.likes && !a.likes.includes('after breakfast'))
    .map(a => ({ id: `snack_${a.name}`, animal: a.name, type: 'snack', label: `${a.name}: ${a.likes}` }))

  const hygieneItems = [
    { id: 'dog_teeth', animal: 'Dogs', type: 'hygiene', label: 'Dentastix after breakfast' },
  ]

  const waterItems = animals
    .filter(a => a.odd_but_ok?.toLowerCase().includes('water') || a.dislikes?.toLowerCase().includes('water'))
    .map(a => ({ id: `water_${a.name}`, animal: a.name, type: 'water', label: `${a.name}: ${a.odd_but_ok || a.dislikes}`, important: true }))

  const categories = [
    { title: 'Medication', icon: '💊', items: medicationItems },
    { title: 'Snacks & Treats', icon: '🥕', items: snackItems },
    { title: 'Hygiene', icon: '🧼', items: hygieneItems },
    { title: 'Water Reminders', icon: '💧', items: waterItems },
  ].filter(c => c.items.length > 0)

  return (
    <div>
      <div className="page-title">❤️ Daily Care</div>
      <div className="page-subtitle">Snacks, hygiene, medication &amp; special care routines</div>

      {categories.map(cat => (
        <div key={cat.title} className="card">
          <div className="card-header">
            <div className="card-title"><span>{cat.icon}</span><span>{cat.title}</span></div>
          </div>
          {cat.items.map(item => (
            <div key={item.id} className="check-row" onClick={() => item.type !== 'water' && toggle(item.id)} style={{ cursor: item.type === 'water' ? 'default' : 'pointer' }}>
              {item.type !== 'water' ? (
                <div className={`check-box ${checked[item.id] ? 'checked' : ''}`}>
                  {checked[item.id] && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
              ) : (
                <span style={{ fontSize: 20, width: 26, textAlign: 'center' }}>⚠️</span>
              )}
              <div>
                <div className={`check-label ${checked[item.id] ? 'completed' : ''}`} style={item.important ? { color: item.type === 'medication' ? 'var(--danger)' : 'var(--warning)', fontWeight: 600 } : {}}>
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Personality quick ref — auto from config */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>🧠 Personality Notes</div>
        {animals.filter(a => a.special?.length > 0 || a.odd_but_ok).map(a => (
          <div key={a.name} className="check-row" style={{ cursor: 'default' }}>
            <span style={{ fontSize: 22, width: 30 }}>{a.emoji}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>{a.name}</div>
              <div className="check-note">{a.odd_but_ok || a.special?.[0]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 10 }}>✂️ Grooming &amp; Hygiene</div>
        <div className="alert alert-info" style={{ marginBottom: 0 }}>
          <div className="alert-content">
            <div className="alert-body">Log grooming, hoof picking, or any hygiene events using the Notes page. Take photos and upload them for the owner.</div>
          </div>
        </div>
      </div>

      {notes.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>📋 Today's Care Notes</div>
          {notes.map(n => (
            <div key={n.id} className="check-row" style={{ cursor: 'default' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-grey)', marginBottom: 2 }}>{n.animal || 'General'} · {n.time}</div>
                <div style={{ fontSize: 14 }}>{n.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setShowNoteModal(true)}><Plus /></button>

      {showNoteModal && (
        <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Add Care Note</div>
            <div className="form-group">
              <label className="form-label">Animal</label>
              <select className="form-select" value={noteForm.animal} onChange={e => setNoteForm({ ...noteForm, animal: e.target.value })}>
                <option value="">General</option>
                {ANIMAL_NAMES.map(a => <option key={a} value={a}>{a}</option>)}
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
              <textarea className="form-textarea" placeholder="Describe what you observed or did..." value={noteForm.content} onChange={e => setNoteForm({ ...noteForm, content: e.target.value })} />
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
