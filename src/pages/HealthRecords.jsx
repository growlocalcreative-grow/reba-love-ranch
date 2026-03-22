import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { listAll, createDoc, COL, Query } from '../lib/appwrite'

const ANIMALS = ['Luke', 'Snowy', 'Belle', 'Shiloh', 'Dogs', 'Chickens', 'Cats']

const RECORD_TYPES = {
  vet_visit:   { label: 'Vet Visit',        icon: '🏥', badge: 'badge-blue' },
  vaccination: { label: 'Vaccination',      icon: '💉', badge: 'badge-green' },
  medication:  { label: 'Medication',       icon: '💊', badge: 'badge-orange' },
  injury:      { label: 'Injury / Illness', icon: '🤕', badge: 'badge-red' },
  observation: { label: 'Observation',      icon: '👁️', badge: 'badge-grey' },
  grooming:    { label: 'Grooming',         icon: '✂️', badge: 'badge-pink' },
}

const SEED = [
  { $id: 'seed-1', animal: 'Luke', record_type: 'medication', record_date: '2025-08-01', description: 'Daily morning medication in labeled "breakfast" pellet bag. Ongoing — never miss.', vet_name: 'Dr. De La Cruz', next_due_date: null, notes: 'Bag is labeled. Give every single morning.' },
]

export default function HealthRecords() {
  const [records, setRecords] = useState(SEED)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filterAnimal, setFilterAnimal] = useState('all')
  const [form, setForm] = useState({ animal: '', record_type: 'observation', record_date: format(new Date(), 'yyyy-MM-dd'), description: '', vet_name: '', next_due_date: '', notes: '' })

  useEffect(() => { fetchRecords() }, [])

  async function fetchRecords() {
    setLoading(true)
    try {
      const docs = await listAll(COL.healthRecords, [Query.orderDesc('record_date')])
      if (docs.length > 0) setRecords(docs)
    } catch (e) {
      console.error('Health records fetch failed, using seed data', e)
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    if (!form.animal || !form.description) return
    setSaving(true)
    try {
      const data = {
        animal: form.animal,
        record_type: form.record_type,
        record_date: form.record_date,
        description: form.description,
        vet_name: form.vet_name || '',
        next_due_date: form.next_due_date || null,
        notes: form.notes || '',
      }
      const doc = await createDoc(COL.healthRecords, data)
      setRecords(prev => [doc, ...prev])
    } catch (e) {
      console.error(e)
      setRecords(prev => [{ $id: Date.now().toString(), ...form }, ...prev])
    } finally {
      setSaving(false)
      setShowModal(false)
      setForm({ animal: '', record_type: 'observation', record_date: format(new Date(), 'yyyy-MM-dd'), description: '', vet_name: '', next_due_date: '', notes: '' })
    }
  }

  const filtered = filterAnimal === 'all' ? records : records.filter(r => r.animal === filterAnimal)

  return (
    <div>
      <div className="page-title">🏥 Health Records</div>
      <div className="page-subtitle">Vet visits, medications, vaccinations &amp; observations</div>

      <div className="alert alert-danger">
        <div style={{ fontSize: 20 }}>💊</div>
        <div className="alert-content">
          <div className="alert-title">Luke's Daily Medication</div>
          <div className="alert-body">Luke requires medication every morning in his labeled "breakfast" pellet bag. Never skip.</div>
        </div>
      </div>

      {/* Vet quick-dial */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 10 }}>📞 Vet Contacts</div>
        {[
          { name: 'Loomis Basin Equine', role: 'Equines', phone: '9166527645', display: '916-652-7645' },
          { name: 'Cool Veterinary Hospital', role: 'Dogs & Cats', phone: '5306861949', display: '530-686-1949' },
        ].map(v => (
          <div key={v.name} className="phone-link">
            <div className="contact-info">
              <div className="contact-name">{v.name}</div>
              <div className="contact-role">{v.role}</div>
            </div>
            <a href={`tel:+1${v.phone}`} className="call-btn">📞 Call</a>
          </div>
        ))}
      </div>

      {/* Animal filter */}
      <div className="chip-scroll">
        <button className={`animal-chip ${filterAnimal === 'all' ? 'active' : ''}`} onClick={() => setFilterAnimal('all')}>🐾 All</button>
        {ANIMALS.map(a => (
          <button key={a} className={`animal-chip ${filterAnimal === a ? 'active' : ''}`} onClick={() => setFilterAnimal(a)}>{a}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--slate-grey)' }}>Loading records...</div>}

      {!loading && filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><p>No records yet. Tap + to add one.</p></div>
      ) : (
        filtered.map(rec => (
          <div key={rec.$id} className="card" style={{ borderLeft: `4px solid ${rec.record_type === 'injury' ? 'var(--danger)' : rec.record_type === 'medication' ? 'var(--warning)' : 'var(--sky-blue)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14 }}>
                {RECORD_TYPES[rec.record_type]?.icon} {rec.animal}
              </div>
              <span className={`badge ${RECORD_TYPES[rec.record_type]?.badge}`}>{RECORD_TYPES[rec.record_type]?.label}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginBottom: 6 }}>
              {format(new Date(rec.record_date), 'MMM d, yyyy')}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: rec.vet_name || rec.next_due_date ? 8 : 0 }}>{rec.description}</div>
            {rec.vet_name && <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>🩺 {rec.vet_name}</div>}
            {rec.next_due_date && <div style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600, marginTop: 4 }}>📅 Next due: {format(new Date(rec.next_due_date), 'MMM d, yyyy')}</div>}
            {rec.notes && <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginTop: 6, fontStyle: 'italic' }}>{rec.notes}</div>}
          </div>
        ))
      )}

      <button className="fab" onClick={() => setShowModal(true)}><Plus /></button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Add Health Record</div>

            <div className="form-group">
              <label className="form-label">Animal *</label>
              <select className="form-select" value={form.animal} onChange={e => setForm({ ...form, animal: e.target.value })}>
                <option value="">Select animal...</option>
                {ANIMALS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-select" value={form.record_type} onChange={e => setForm({ ...form, record_type: e.target.value })}>
                {Object.entries(RECORD_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-input" type="date" value={form.record_date} onChange={e => setForm({ ...form, record_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" placeholder="Describe the visit, observation, or event..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Vet / Provider</label>
              <input className="form-input" type="text" placeholder="Dr. De La Cruz..." value={form.vet_name} onChange={e => setForm({ ...form, vet_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Next Due Date</label>
              <input className="form-input" type="date" value={form.next_due_date} onChange={e => setForm({ ...form, next_due_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save Record'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
