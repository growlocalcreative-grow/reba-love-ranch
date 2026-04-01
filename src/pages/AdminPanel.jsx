import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Archive, ChevronRight, Save, X, AlertTriangle, RefreshCw } from 'lucide-react'
import {
  getAnimals, saveAnimal, archiveAnimal, deleteAnimal, seedAnimals,
  getFeedSchedule, saveFeedEntry, deleteFeedEntry,
  getDailyTasks, saveDailyTask, deleteDailyTask,
  getPropertyTasks, savePropertyTask, deletePropertyTask,
  getTreats, saveTreat, deleteTreat,
  getWaterNotes, saveWaterNote, deleteWaterNote,
  getContacts, saveContact, deleteContact,
} from '../lib/ranchDataService'

const SECTIONS = [
  { id: 'animals',    label: 'Animals',          icon: '🐴', desc: 'Add, edit or archive animals' },
  { id: 'feed',       label: 'Feed Schedule',    icon: '🌾', desc: 'Edit meals per animal' },
  { id: 'tasks',      label: 'Daily Tasks',      icon: '✅', desc: 'Manage the daily checklist' },
  { id: 'property',   label: 'Property Tasks',   icon: '🔧', desc: 'Maintenance task list' },
  { id: 'treats',     label: 'Treats & Water',   icon: '🥕', desc: 'Treats and water reminders' },
  { id: 'contacts',   label: 'Emergency Contacts', icon: '📞', desc: 'Vets, neighbors, evacuation' },
]

const ANIMAL_TYPES = ['equine','dog','cat','chicken','cow','goat','sheep','pig','duck']
const MEAL_TIMES = ['breakfast','dinner','night_check']
const TASK_TIMES = ['breakfast','dinner','night_check']
const PRIORITIES = ['high','normal','low']
const CATEGORIES_TASK = ['daily','every_few_days','weekly','as_needed']
const CATEGORIES_CONTACT = ['vets','owner','neighbors','evacuation']

export default function AdminPanel() {
  const [section, setSection] = useState(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    if (section) loadData(section)
  }, [section])

  async function loadData(sec) {
    setLoading(true)
    try {
      const loaders = {
        animals: getAnimals, feed: getFeedSchedule,
        tasks: getDailyTasks, property: getPropertyTasks,
        treats: getTreats, contacts: getContacts,
      }
      // For treats also load water notes
      if (sec === 'treats') {
        const [treats, water] = await Promise.all([getTreats(), getWaterNotes()])
        setData({ treats, water })
      } else {
        const result = await loaders[sec]?.()
        setData(result || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function flash(msg) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  function openAdd(defaults = {}) {
    setEditItem(null)
    setForm(defaults)
    setShowModal(true)
  }

  function openEdit(item) {
    setEditItem(item)
    // Parse special array if needed
    const f = { ...item }
    if (f.special && typeof f.special === 'string') {
      try { f.special = JSON.parse(f.special) } catch { f.special = [] }
    }
    if (f.special && Array.isArray(f.special)) {
      f.specialText = f.special.join('\n')
    }
    setForm(f)
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const savers = {
        animals: saveAnimal, feed: saveFeedEntry,
        tasks: saveDailyTask, property: savePropertyTask,
        contacts: saveContact,
      }

      let saveData = { ...form }

      // Handle special array
      if (section === 'animals' && form.specialText !== undefined) {
        saveData.special = form.specialText
          ? form.specialText.split('\n').map(s => s.trim()).filter(Boolean)
          : []
        delete saveData.specialText
      }

      if (editItem) saveData.$id = editItem.$id

      await savers[section]?.(saveData)
      await loadData(section)
      setShowModal(false)
      flash('✅ Saved!')
    } catch (e) {
      console.error(e)
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveTreat(treat, isWater = false) {
    setSaving(true)
    try {
      if (isWater) await saveWaterNote(treat)
      else await saveTreat(treat)
      await loadData('treats')
      setShowModal(false)
      flash('✅ Saved!')
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  async function handleDelete(item) {
    setSaving(true)
    try {
      const deleters = {
        animals: deleteAnimal, feed: deleteFeedEntry,
        tasks: deleteDailyTask, property: deletePropertyTask,
        contacts: deleteContact,
      }
      await deleters[section]?.(item.$id)
      await loadData(section)
      setConfirmDelete(null)
      flash('🗑️ Deleted')
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  async function handleArchive(item) {
    await archiveAnimal(item.$id)
    await loadData('animals')
    flash('📦 Archived')
  }

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  // ── RENDER SECTIONS ──────────────────────────────────────────

  if (!section) {
    return (
      <div>
        <div className="page-title">⚙️ Admin Panel</div>
        <div className="page-subtitle">Owner-only settings — manage your ranch data</div>

        {SECTIONS.map(s => (
          <div key={s.id} className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }} onClick={() => setSection(s.id)}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--warm-beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginTop: 2 }}>{s.desc}</div>
            </div>
            <ChevronRight size={18} color="var(--slate-grey)" />
          </div>
        ))}

        <div className="alert alert-info">
          <div style={{ fontSize: 16 }}>🔒</div>
          <div className="alert-content">
            <div className="alert-title">Owner Access Only</div>
            <div className="alert-body">This panel is only visible to you. Sitters see your changes instantly.</div>
          </div>
        </div>
      </div>
    )
  }

  const currentSection = SECTIONS.find(s => s.id === section)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setSection(null)}>← Back</button>
        <div className="page-title" style={{ marginBottom: 0 }}>{currentSection?.icon} {currentSection?.label}</div>
      </div>
      <div className="page-subtitle">{currentSection?.desc}</div>

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: 12 }}>
          <div className="alert-body">{successMsg}</div>
        </div>
      )}

      {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--slate-grey)' }}>Loading...</div>}

      {/* ── ANIMALS ─────────────────────────────────────────── */}
      {section === 'animals' && !loading && (
        <>
          {/* No animals found — show re-seed button */}
          {(Array.isArray(data) ? data : []).filter(a => a.archived !== true && a.archived !== 'true').length === 0 &&
           (Array.isArray(data) ? data : []).filter(a => a.archived === true || a.archived === 'true').length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🐴</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 8 }}>No animals found</div>
              <div style={{ fontSize: 13, color: 'var(--slate-grey)', marginBottom: 16 }}>
                Tap below to load your animals from the ranch config file.
              </div>
              <button
                className="btn btn-primary btn-full"
                onClick={async () => {
                  setLoading(true)
                  await seedAnimals()
                  await loadData('animals')
                }}
              >
                <RefreshCw size={16} /> Load Animals from Config
              </button>
            </div>
          )}
          {(Array.isArray(data) ? data : []).filter(a => a.archived !== true && a.archived !== 'true').map(animal => (
            <div key={animal.$id} className="card" style={{ borderLeft: '4px solid var(--sky-blue)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{animal.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{animal.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>{animal.breed} · {animal.type}</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => openEdit(animal)}><Edit2 size={14} /></button>
                <button className="btn btn-sm btn-ghost" onClick={() => handleArchive(animal)} title="Archive (Rainbow Bridge 🌈)"><Archive size={14} /></button>
                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(animal)}><Trash2 size={14} /></button>
              </div>
              {animal.notes && <div style={{ fontSize: 13, color: 'var(--slate-grey)' }}>{animal.notes}</div>}
            </div>
          ))}

          {/* Archived */}
          {(Array.isArray(data) ? data : []).some(a => a.archived === true || a.archived === 'true') && (
            <div className="card" style={{ background: 'var(--warm-beige)', border: '1px dashed var(--slate-grey)' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--slate-grey)' }}>🌈 Archived Animals</div>
              {(Array.isArray(data) ? data : []).filter(a => a.archived === true || a.archived === 'true').map(a => (
                <div key={a.$id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', opacity: 0.6 }}>
                  <span>{a.emoji}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{a.name}</span>
                  <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }} onClick={() => { saveAnimal({ ...a, archived: false }); loadData('animals') }}>Restore</button>
                  <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(a)}><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}

          <button className="add-btn" style={{ background: 'white', border: '2px dashed var(--sky-blue)', color: 'var(--sky-blue)', borderRadius: 'var(--radius-md)', padding: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }} onClick={() => openAdd({ type: 'equine', emoji: '🐴', archived: false, sort_order: data.length })}>
            <Plus size={16} /> Add Animal
          </button>
        </>
      )}

      {/* ── FEED SCHEDULE ───────────────────────────────────── */}
      {section === 'feed' && !loading && (
        <>
          {/* Group by animal */}
          {[...new Set((Array.isArray(data) ? data : []).map(d => d.animal_name))].map(animal => (
            <div key={animal} className="card">
              <div className="card-title" style={{ marginBottom: 10 }}>{animal}</div>
              {(Array.isArray(data) ? data : []).filter(d => d.animal_name === animal).map(entry => (
                <div key={entry.$id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--warm-beige-dark)', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sky-blue)', marginBottom: 2 }}>{entry.meal_time} {entry.time_window && `· ${entry.time_window}`}</div>
                    <div style={{ fontSize: 13 }}>{entry.items}</div>
                    {entry.has_medication && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>💊 Contains medication</div>}
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(entry)}><Edit2 size={13} /></button>
                  <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(entry)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          ))}
          <button className="add-btn" style={{ background: 'white', border: '2px dashed var(--sky-blue)', color: 'var(--sky-blue)', borderRadius: 'var(--radius-md)', padding: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }} onClick={() => openAdd({ meal_time: 'breakfast', has_medication: false })}>
            <Plus size={16} /> Add Feed Entry
          </button>
        </>
      )}

      {/* ── DAILY TASKS ─────────────────────────────────────── */}
      {section === 'tasks' && !loading && (
        <>
          {['breakfast','dinner','night_check'].map(period => {
            const periodTasks = (Array.isArray(data) ? data : []).filter(t => t.time_period === period)
            if (periodTasks.length === 0) return null
            const labels = { breakfast: '🌅 Breakfast', dinner: '🌇 Dinner', night_check: '🌙 Night Check' }
            return (
              <div key={period} className="card">
                <div className="card-title" style={{ marginBottom: 10 }}>{labels[period]}</div>
                {periodTasks.map(task => (
                  <div key={task.$id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--warm-beige-dark)' }}>
                    <span style={{ fontSize: 18 }}>{task.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: task.active ? 600 : 400, opacity: task.active ? 1 : 0.5 }}>{task.label}</div>
                      {task.note && <div style={{ fontSize: 11, color: 'var(--slate-grey)' }}>{task.note}</div>}
                    </div>
                    <button className="btn btn-sm btn-ghost" style={{ fontSize: 11 }} onClick={() => { saveDailyTask({ ...task, active: !task.active }); loadData('tasks') }}>
                      {task.active ? 'Hide' : 'Show'}
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(task)}><Edit2 size={13} /></button>
                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(task)}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )
          })}
          <button className="add-btn" style={{ background: 'white', border: '2px dashed var(--sky-blue)', color: 'var(--sky-blue)', borderRadius: 'var(--radius-md)', padding: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }} onClick={() => openAdd({ time_period: 'breakfast', icon: '✅', active: true, sort_order: data.length })}>
            <Plus size={16} /> Add Task
          </button>
        </>
      )}

      {/* ── PROPERTY TASKS ──────────────────────────────────── */}
      {section === 'property' && !loading && (
        <>
          {(Array.isArray(data) ? data : []).map(task => (
            <div key={task.$id} className="card" style={{ borderLeft: `4px solid ${task.priority === 'high' ? 'var(--danger)' : task.priority === 'low' ? 'var(--slate-grey)' : 'var(--sky-blue)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>{task.category} · Every {task.frequency_days} day(s) · {task.priority} priority</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(task)}><Edit2 size={13} /></button>
                  <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(task)}><Trash2 size={13} /></button>
                </div>
              </div>
              {task.description && <div style={{ fontSize: 13, color: 'var(--slate-grey)', marginBottom: 4 }}>{task.description}</div>}
              {task.supply_location && <div style={{ fontSize: 12, color: 'var(--forest-green)' }}>📦 {task.supply_location}</div>}
              {task.warning && <div style={{ fontSize: 12, color: '#E65100' }}>⚠️ {task.warning}</div>}
            </div>
          ))}
          <button className="add-btn" style={{ background: 'white', border: '2px dashed var(--sky-blue)', color: 'var(--sky-blue)', borderRadius: 'var(--radius-md)', padding: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }} onClick={() => openAdd({ category: 'daily', frequency_days: 1, priority: 'normal' })}>
            <Plus size={16} /> Add Property Task
          </button>
        </>
      )}

      {/* ── TREATS & WATER ──────────────────────────────────── */}
      {section === 'treats' && !loading && (
        <>
          <div className="card">
            <div className="card-title">🥕 Treats</div>
            {(data.treats || []).map(treat => (
              <div key={treat.$id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--warm-beige-dark)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>{treat.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{treat.animals}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>{treat.description}</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => { setEditItem({ ...treat, _isWater: false }); setForm({ ...treat, _isWater: false }); setShowModal(true) }}><Edit2 size={13} /></button>
                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => deleteTreat(treat.$id).then(() => loadData('treats'))}><Trash2 size={13} /></button>
              </div>
            ))}
            <button className="add-btn" style={{ marginTop: 10, marginBottom: 0, background: 'transparent', border: '1px dashed var(--warm-beige-dark)', borderRadius: 8, padding: '8px 12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--slate-grey)' }} onClick={() => { setEditItem(null); setForm({ emoji: '🥕', _isWater: false }); setShowModal(true) }}>
              <Plus size={14} /> Add Treat
            </button>
          </div>

          <div className="card">
            <div className="card-title">💧 Water Notes</div>
            {(data.water || []).map(w => (
              <div key={w.$id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--warm-beige-dark)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>{w.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: w.urgent ? 700 : 400, color: w.urgent ? 'var(--danger)' : 'inherit' }}>{w.note}</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => { setEditItem({ ...w, _isWater: true }); setForm({ ...w, _isWater: true }); setShowModal(true) }}><Edit2 size={13} /></button>
                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => deleteWaterNote(w.$id).then(() => loadData('treats'))}><Trash2 size={13} /></button>
              </div>
            ))}
            <button className="add-btn" style={{ marginTop: 10, marginBottom: 0, background: 'transparent', border: '1px dashed var(--warm-beige-dark)', borderRadius: 8, padding: '8px 12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--slate-grey)' }} onClick={() => { setEditItem(null); setForm({ emoji: '💧', urgent: false, _isWater: true }); setShowModal(true) }}>
              <Plus size={14} /> Add Water Note
            </button>
          </div>
        </>
      )}

      {/* ── EMERGENCY CONTACTS ──────────────────────────────── */}
      {section === 'contacts' && !loading && (
        <>
          {['vets','owner','neighbors','evacuation'].map(cat => {
            const catContacts = (Array.isArray(data) ? data : []).filter(c => c.category === cat)
            const labels = { vets: '🏥 Veterinary', owner: '👨‍👩‍👧 Owner & Family', neighbors: '🏡 Neighbors', evacuation: '🚨 Evacuation' }
            return (
              <div key={cat} className="card">
                <div className="card-title" style={{ marginBottom: 10 }}>{labels[cat]}</div>
                {catContacts.map(contact => (
                  <div key={contact.$id} className="phone-link">
                    <div className="contact-info">
                      <div className="contact-name">{contact.name}</div>
                      <div className="contact-role">{contact.role} · {contact.display}</div>
                      {contact.address && <div className="contact-note">📍 {contact.address}</div>}
                      {contact.note && <div className="contact-note">{contact.note}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit({ ...contact })}><Edit2 size={13} /></button>
                      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(contact)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
                <button className="add-btn" style={{ marginTop: 8, marginBottom: 0, background: 'transparent', border: '1px dashed var(--warm-beige-dark)', borderRadius: 8, padding: '8px 12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--slate-grey)' }} onClick={() => openAdd({ category: cat, sort_order: catContacts.length })}>
                  <Plus size={14} /> Add Contact
                </button>
              </div>
            )
          })}
        </>
      )}

      {/* ── EDIT/ADD MODAL ───────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
            <div className="modal-handle" />
            <div className="modal-title">{editItem ? 'Edit' : 'Add'} {currentSection?.label}</div>

            {/* ANIMAL FORM */}
            {section === 'animals' && (
              <>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Animal name..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type || 'equine'} onChange={e => set('type', e.target.value)}>
                    {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Breed</label>
                    <input className="form-input" value={form.breed || ''} onChange={e => set('breed', e.target.value)} placeholder="e.g. Donkey, Horse..." />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Emoji</label>
                    <input className="form-input" value={form.emoji || ''} onChange={e => set('emoji', e.target.value)} maxLength={2} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">About / Personality</label>
                  <textarea className="form-textarea" value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Likes</label>
                  <input className="form-input" value={form.likes || ''} onChange={e => set('likes', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dislikes</label>
                  <input className="form-input" value={form.dislikes || ''} onChange={e => set('dislikes', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Odd But OK 🤔</label>
                  <input className="form-input" value={form.odd_but_ok || ''} onChange={e => set('odd_but_ok', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">⭐ Special Notes (one per line)</label>
                  <textarea className="form-textarea" style={{ minHeight: 100 }} value={form.specialText || ''} onChange={e => set('specialText', e.target.value)} placeholder="💊 medication note&#10;⚠️ warning note&#10;🚨 critical note" />
                  <div className="form-hint">Use 💊 ⚠️ 🚨 to trigger warning colors</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Evac Order</label>
                    <select className="form-select" value={form.evacuation_order || '0'} onChange={e => set('evacuation_order', e.target.value)}>
                      <option value="0">Not trailered / N/A</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n === 1 ? '1st — First' : n === 2 ? '2nd' : n === 3 ? '3rd — Last' : `${n}th`}</option>)}
                    </select>
                  </div>
                </div>
                {form.evacuation_order && form.evacuation_order !== '0' && (
                  <div className="form-group">
                    <label className="form-label">Evacuation Note</label>
                    <input className="form-input" value={form.evacuation_note || ''} onChange={e => set('evacuation_note', e.target.value)} />
                  </div>
                )}
              </>
            )}

            {/* FEED FORM */}
            {section === 'feed' && (
              <>
                <div className="form-group">
                  <label className="form-label">Animal Name *</label>
                  <input className="form-input" value={form.animal_name || ''} onChange={e => set('animal_name', e.target.value)} placeholder="e.g. Luke, Shadow..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Meal Time</label>
                  <select className="form-select" value={form.meal_time || 'breakfast'} onChange={e => set('meal_time', e.target.value)}>
                    {MEAL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Time Window</label>
                  <input className="form-input" value={form.time_window || ''} onChange={e => set('time_window', e.target.value)} placeholder="e.g. 6:30–7:30 AM" />
                </div>
                <div className="form-group">
                  <label className="form-label">What to Feed *</label>
                  <textarea className="form-textarea" value={form.items || ''} onChange={e => set('items', e.target.value)} placeholder="Describe the meal, quantities, instructions..." />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }} onClick={() => set('has_medication', !form.has_medication)}>
                  <div className={`check-box ${form.has_medication ? 'checked' : ''}`} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${form.has_medication ? 'var(--danger)' : 'var(--warm-beige-dark)'}`, background: form.has_medication ? 'var(--danger)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {form.has_medication && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="12"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <label style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', color: form.has_medication ? 'var(--danger)' : 'var(--slate-grey)' }}>💊 Contains medication</label>
                </div>
              </>
            )}

            {/* DAILY TASK FORM */}
            {section === 'tasks' && (
              <>
                <div className="form-group">
                  <label className="form-label">Task Label *</label>
                  <input className="form-input" value={form.label || ''} onChange={e => set('label', e.target.value)} placeholder="e.g. Top off barn water..." />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Icon</label>
                    <input className="form-input" value={form.icon || '✅'} onChange={e => set('icon', e.target.value)} maxLength={2} />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Time Period</label>
                    <select className="form-select" value={form.time_period || 'breakfast'} onChange={e => set('time_period', e.target.value)}>
                      {TASK_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Sub-note (optional)</label>
                  <input className="form-input" value={form.note || ''} onChange={e => set('note', e.target.value)} placeholder="e.g. Auto-closes at 9pm..." />
                </div>
              </>
            )}

            {/* PROPERTY TASK FORM */}
            {section === 'property' && (
              <>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title || ''} onChange={e => set('title', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description || ''} onChange={e => set('description', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category || 'daily'} onChange={e => set('category', e.target.value)}>
                      {CATEGORIES_TASK.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Every (days)</label>
                    <input className="form-input" type="number" min={1} value={form.frequency_days || 1} onChange={e => set('frequency_days', Number(e.target.value))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority || 'normal'} onChange={e => set('priority', e.target.value)}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Supply Location</label>
                  <input className="form-input" value={form.supply_location || ''} onChange={e => set('supply_location', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Safety Warning</label>
                  <input className="form-input" value={form.warning || ''} onChange={e => set('warning', e.target.value)} />
                </div>
              </>
            )}

            {/* TREATS & WATER FORM */}
            {section === 'treats' && (
              <>
                {!form._isWater ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Animals</label>
                      <input className="form-input" value={form.animals || ''} onChange={e => set('animals', e.target.value)} placeholder="e.g. Luke, Snowy & Shadow" />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Emoji</label>
                        <input className="form-input" value={form.emoji || '🥕'} onChange={e => set('emoji', e.target.value)} maxLength={2} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" value={form.description || ''} onChange={e => set('description', e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Emoji</label>
                        <input className="form-input" value={form.emoji || '💧'} onChange={e => set('emoji', e.target.value)} maxLength={2} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Note</label>
                      <input className="form-input" value={form.note || ''} onChange={e => set('note', e.target.value)} placeholder="Water instruction..." />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }} onClick={() => set('urgent', !form.urgent)}>
                      <div className={`check-box ${form.urgent ? 'checked' : ''}`} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${form.urgent ? 'var(--danger)' : 'var(--warm-beige-dark)'}`, background: form.urgent ? 'var(--danger)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {form.urgent && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="12"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                      <label style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⚠️ Mark as urgent (shows in red)</label>
                    </div>
                  </>
                )}
              </>
            )}

            {/* CONTACTS FORM */}
            {section === 'contacts' && (
              <>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category || 'vets'} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES_CONTACT.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name || ''} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="form-input" value={form.role || ''} onChange={e => set('role', e.target.value)} placeholder="e.g. Equine Vet, Neighbor..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" type="tel" value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="9165551234" />
                </div>
                <div className="form-group">
                  <label className="form-label">Display Number</label>
                  <input className="form-input" value={form.display || ''} onChange={e => set('display', e.target.value)} placeholder="(916) 555-1234" />
                </div>
                <div className="form-group">
                  <label className="form-label">Address (for evacuation)</label>
                  <input className="form-input" value={form.address || ''} onChange={e => set('address', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <input className="form-input" value={form.note || ''} onChange={e => set('note', e.target.value)} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={saving}
                onClick={section === 'treats' ? () => handleSaveTreat(form, form._isWater) : handleSave}>
                {saving ? 'Saving...' : <><Save size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRM DELETE ───────────────────────────────────── */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Confirm Delete</div>
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              <AlertTriangle size={18} color="var(--danger)" />
              <div className="alert-content">
                <div className="alert-body">
                  Are you sure you want to permanently delete <strong>{confirmDelete.name || confirmDelete.title || confirmDelete.label}</strong>? This cannot be undone.
                  {section === 'animals' && <><br /><br />💡 Tip: Use the 🌈 Archive button instead to preserve their history.</>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} disabled={saving} onClick={() => handleDelete(confirmDelete)}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
