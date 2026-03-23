import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { RANCH_CONFIG } from '../data/ranch.config'
import { listAll, createDoc, COL, Query } from '../lib/appwrite'

const PRIORITY_MAP = {
  high:   { label: 'High',   cls: 'badge-red',    border: 'priority-high' },
  normal: { label: 'Normal', cls: 'badge-blue',   border: 'priority-normal' },
  low:    { label: 'Low',    cls: 'badge-grey',   border: 'priority-low' },
  urgent: { label: 'Urgent', cls: 'badge-orange', border: 'priority-urgent' },
}

const CAT_MAP = {
  daily: '📅 Daily', every_few_days: '📆 Every Few Days',
  weekly: '🗓️ Weekly', as_needed: '🔧 As Needed',
}

export default function PropertyTasks() {
  const { propertyTasks, manure } = RANCH_CONFIG
  const [completions, setCompletions] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showComplete, setShowComplete] = useState(false)
  const [completeNotes, setCompleteNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCompletions() }, [])

  async function fetchCompletions() {
    setLoading(true)
    try {
      const docs = await listAll(COL.taskCompletions, [Query.orderDesc('$createdAt'), Query.limit(100)])
      const map = {}
      docs.forEach(doc => { if (!map[doc.task_id]) map[doc.task_id] = doc })
      setCompletions(map)
    } catch (e) {
      const saved = localStorage.getItem('rlr_task_completions')
      if (saved) setCompletions(JSON.parse(saved))
    } finally {
      setLoading(false)
    }
  }

  async function completeTask(task) {
    setSaving(true)
    try {
      const doc = await createDoc(COL.taskCompletions, { task_id: task.id, task_title: task.title, completed_at: new Date().toISOString(), notes: completeNotes || '' })
      setCompletions(prev => ({ ...prev, [task.id]: doc }))
    } catch {
      const fallback = { $id: Date.now().toString(), task_id: task.id, completed_at: new Date().toISOString(), notes: completeNotes }
      const next = { ...completions, [task.id]: fallback }
      setCompletions(next)
      localStorage.setItem('rlr_task_completions', JSON.stringify(next))
    } finally {
      setSaving(false)
      setSelectedTask(null)
      setShowComplete(false)
      setCompleteNotes('')
    }
  }

  const getDaysSince = (comp) => comp ? differenceInDays(new Date(), new Date(comp.completed_at)) : null
  const isOverdue = (task) => {
    const comp = completions[task.id]
    if (!comp) return true
    return getDaysSince(comp) >= task.frequency_days
  }

  const manureTask = propertyTasks.find(t => t.id === '2')
  const manureComp = completions['2']
  const manureDays = getDaysSince(manureComp)
  const manureDue = manureDays === null || manureDays >= manure.frequencyDays
  const manureOverdue = manureDays !== null && manureDays >= (manure.frequencyDays + 1)

  const cats = ['all', ...new Set(propertyTasks.map(t => t.category))]
  const filtered = filter === 'all' ? propertyTasks : propertyTasks.filter(t => t.category === filter)

  return (
    <div>
      <div className="page-title">🔧 Property Tasks</div>
      <div className="page-subtitle">Maintenance, cleaning &amp; property care</div>

      {propertyTasks.some(t => isOverdue(t) && t.priority === 'high') && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} color="var(--warning)" />
          <div className="alert-content">
            <div className="alert-title">Tasks Need Attention</div>
            <div className="alert-body">Some high-priority tasks are due or overdue.</div>
          </div>
        </div>
      )}

      {/* Manure tracker */}
      <div className="manure-tracker" style={{ background: manureOverdue ? 'linear-gradient(135deg,#c62828,#b71c1c)' : manureDue ? 'linear-gradient(135deg,#E65100,#BF360C)' : 'linear-gradient(135deg,#2E7D32,#1b5e20)', cursor: 'pointer' }} onClick={() => setFilter('every_few_days')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, textTransform: 'uppercase', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', marginBottom: 4 }}>Manure Spreading</div>
            {manureDays !== null ? (
              <>
                <div className="manure-days">{manureDays}</div>
                <div className="manure-label">days since last spread</div>
                {manureDue && <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{manureOverdue ? '🚨 OVERDUE' : '⚠️ DUE NOW'}</div>}
              </>
            ) : (
              <><div className="manure-days">—</div><div className="manure-label">No spread logged yet</div></>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.75, color: 'white' }}>
            <div>Spread every</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20 }}>{manure.frequencyLabel}</div>
            <div>days</div>
          </div>
        </div>
      </div>

      <div className="chip-scroll">
        {cats.map(c => (
          <button key={c} className={`animal-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'all' ? '📋 All' : CAT_MAP[c]}
          </button>
        ))}
      </div>

      {filtered.map(task => {
        const comp = completions[task.id]
        const days = getDaysSince(comp)
        return (
          <div key={task.id} className={`card ${PRIORITY_MAP[task.priority]?.border}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isOverdue(task) && task.priority === 'high' && <span style={{ color: 'var(--danger)', fontSize: 12 }}>●</span>}
                  {task.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginBottom: 6 }}>{CAT_MAP[task.category]}</div>
              </div>
              <span className={`badge ${PRIORITY_MAP[task.priority]?.cls}`}>{PRIORITY_MAP[task.priority]?.label}</span>
            </div>
            {task.warning && <div style={{ background: 'rgba(245,124,0,0.08)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#E65100', marginBottom: 8, fontWeight: 600 }}>⚠️ {task.warning}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>
                {comp ? `Last done: ${format(new Date(comp.completed_at), 'MMM d, h:mm a')} (${days}d ago)` : 'Not yet completed'}
              </div>
              <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setSelectedTask(task); setShowComplete(true) }}>Done ✓</button>
            </div>
            {task.supply_location && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--forest-green)', fontWeight: 600 }}>📦 {task.supply_location}</div>}
          </div>
        )
      })}

      {selectedTask && !showComplete && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">{selectedTask.title}</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{selectedTask.description}</p>
            {selectedTask.warning && <div className="alert alert-warning" style={{ marginBottom: 16 }}><AlertTriangle size={18} color="var(--warning)" /><div className="alert-content"><div className="alert-body">{selectedTask.warning}</div></div></div>}
            {selectedTask.supply_location && <div className="alert alert-info" style={{ marginBottom: 16 }}><Info size={18} color="var(--sky-blue)" /><div className="alert-content"><div className="alert-title">Supply Location</div><div className="alert-body">{selectedTask.supply_location}</div></div></div>}
            <button className="btn btn-primary btn-full" onClick={() => setShowComplete(true)}><CheckCircle size={16} /> Mark as Complete</button>
          </div>
        </div>
      )}

      {showComplete && selectedTask && (
        <div className="modal-overlay" onClick={() => { setShowComplete(false); setSelectedTask(null) }}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Complete: {selectedTask.title}</div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" placeholder="Any notes..." value={completeNotes} onChange={e => setCompleteNotes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowComplete(false)}>Cancel</button>
              <button className="btn btn-green" style={{ flex: 2 }} disabled={saving} onClick={() => completeTask(selectedTask)}>{saving ? 'Saving...' : '✓ Confirm Complete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
