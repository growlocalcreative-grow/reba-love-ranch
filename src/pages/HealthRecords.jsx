import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Phone } from 'lucide-react'
import { listAll, createDoc, COL, Query } from '../lib/appwrite'
import { getAnimals, getContacts } from '../lib/ranchDataService'

const RECORD_TYPES = {
  vet_visit:   { label: 'Vet Visit',        icon: '🏥', badge: 'badge-blue' },
  vaccination: { label: 'Vaccination',      icon: '💉', badge: 'badge-green' },
  medication:  { label: 'Medication',       icon: '💊', badge: 'badge-orange' },
  injury:      { label: 'Injury / Illness', icon: '🤕', badge: 'badge-red' },
  observation: { label: 'Observation',      icon: '👁️', badge: 'badge-grey' },
  grooming:    { label: 'Grooming',         icon: '✂️', badge: 'badge-pink' },
}

export default function HealthRecords() {
  const [records, setRecords]         = useState([])
  const [animalNames, setAnimalNames] = useState([])
  const [vetContacts, setVetContacts] = useState([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [showModal, setShowModal]     = useState(false)
  const [filterAnimal, setFilterAnimal] = useState('all')
  const [form, setForm] = useState({
    animal: '', record_type: 'observation',
    record_date: format(new Date(), 'yyyy-MM-dd'),
    description: '', vet_name: '', next_due_date: '', notes: '',
  })

  useEffect(() => { loadAll() }, [])

  // ── Load records, animals, and vet contacts in parallel ──────
  async function loadAll() {
    setLoading(true)
    try {
      const [recordDocs, animalDocs, contactDocs] = await Promise.all([
        listAll(COL.healthRecords, [Query.orderDesc('record_date')]),
        getAnimals(),
        getContacts(),
      ])

      setRecords(recordDocs)

      // Active animal names for filter chips and dropdown
      setAnimalNames(
        (animalDocs || [])
          .filter(a => a.archived !== true && a.archived !== 'true')
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map(a => a.name)
      )

      // Only vet contacts from contacts_edit
      setVetContacts(
        (contactDocs || [])
          .filter(c => c.category === 'vets')
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      )
    } catch (e) {
      console.error('HealthRecords load failed', e)
    } finally {
      setLoading(false)
    }
  }

  // ── Save a new record ────────────────────────────────────────
  async function save() {
    if (!form.animal || !form.description) return
    setSaving(true)
    try {
      const data = {
        animal:        form.animal,
        record_type:   form.record_type,
        record_date:   form.record_date,
        description:   form.description,
        vet_name:      form.vet_name || '',
        next_due_date: form.next_due_date || null,
        notes:         form.notes || '',
      }
      const doc = await createDoc(COL.healthRecords, data)
      setRecords(prev => [doc, ...prev])
    } catch (e) {
      console.error(e)
      setRecords(prev => [{ $id: Date.now().toString(), ...form }, ...prev])
    } finally {
      setSaving(false)
      setShowModal(false)
      setForm({
        animal: '', record_type: 'observation',
        record_date: format(new Date(), 'yyyy-MM-dd'),
        description: '', vet_name: '', next_due_date: '', notes: '',
      })
    }
  }

  const filtered = filterAnimal === 'all'
    ? records
    : records.filter(r => r.animal === filterAnimal)

  return (
    <div>
      <div className="page-title">🏥 Health Records</div>
      <div className="page-subtitle">Vet visits, medications, vaccinations &amp; observations</div>

      {/* ── Luke medication reminder ── */}
      <div className="alert alert-danger">
        <div style={{ fontSize: 20 }}>💊</div>
        <div className="alert-content">
          <div className="alert-title">Luke's Daily Medication</div>
          <div className="alert-body">Luke requires medication every morning. Never skip — see Daily Care for full schedule.</div>
        </div>
      </div>

      {/* ── Vet contacts — from contacts_edit ── */}
      {vetContacts.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 10 }}>📞 Vet Contacts</div>
          {vetContacts.map(v => (
            <div key={v.$id} className="phone-link">
              <div className="contact-info">
                <div className="contact-name">{v.name}</div>
                <div className="contact-role">{v.role}</div>
                {v.note && <div className="contact-note">{v.note}</div>}
              </div>
              <a href={`tel:+1${v.phone}`} className="call-btn">
                <Phone size={14} /> {v.display || v.phone}
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ── Animal filter chips — from animals_edit ── */}
      <div className="chip-scroll">
        <button
          className={`animal-chip ${filterAnimal === 'all' ? 'active' : ''}`}
          onClick={() => setFilterAnimal('all')}
        >
          🐾 All
        </button>
        {animalNames.map(a => (
          <button
            key={a}
            className={`animal-chip ${filterAnimal === a ? 'active' : ''}`}
            onClick={() => setFilterAnimal(a)}
          >
            {a}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--slate-grey)' }}>
          Loading records...
        </div>
      )}

      {/* ── Records list ── */}
      {!loading && filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No records yet. Tap + to add one.</p>
        </div>
      ) : (
        filtered.map(rec => (
          <div
            key={rec.$id}
            className="card"
            style={{ borderLeft: `4px solid ${
              rec.record_type === 'injury'     ? 'var(--danger)'
              : rec.record_type === 'medication' ? 'var(--warning)'
              : 'var(--sky-blue)'
            }` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14 }}>
                {RECORD_TYPES[rec.record_type]?.icon} {rec.animal}
              </div>
              <span className={`badge ${RECORD_TYPES[rec.record_type]?.badge}`}>
                {RECORD_TYPES[rec.record_type]?.label}
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginBottom: 6 }}>
              {format(new Date(rec.record_date), 'MMM d, yyyy')}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: rec.vet_name || rec.next_due_date ? 8 : 0 }}>
              {rec.description}
            </div>
            {rec.vet_name && (
              <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>🩺 {rec.vet_name}</div>
            )}
            {rec.next_due_date && (
              <div style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600, marginTop: 4 }}>
                📅 Next due: {format(new Date(rec.next_due_date), 'MMM d, yyyy')}
              </div>
            )}
            {rec.notes && (
              <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginTop: 6, fontStyle: 'italic' }}>
                {rec.notes}
              </div>
            )}
          </div>
        ))
      )}

      {/* ── FAB ── */}
      <button className="fab" onClick={() => setShowModal(true)}><Plus /></button>

      {/* ── Add Record Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Add Health Record</div>

            <div className="form-group">
              <label className="form-label">Animal *</label>
              <select
                className="form-select"
                value={form.animal}
                onChange={e => setForm({ ...form, animal: e.target.value })}
              >
                <option value="">Select animal...</option>
                {animalNames.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                className="form-select"
                value={form.record_type}
                onChange={e => setForm({ ...form, record_type: e.target.value })}
              >
                {Object.entries(RECORD_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                className="form-input"
                type="date"
                value={form.record_date}
                onChange={e => setForm({ ...form, record_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                placeholder="Describe the visit, observation, or event..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vet / Provider</label>
              <input
                className="form-input"
                type="text"
                placeholder="Dr. De La Cruz..."
                value={form.vet_name}
                onChange={e => setForm({ ...form, vet_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Next Due Date</label>
              <input
                className="form-input"
                type="date"
                value={form.next_due_date}
                onChange={e => setForm({ ...form, next_due_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Additional notes..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={saving}
                onClick={save}
              >
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
