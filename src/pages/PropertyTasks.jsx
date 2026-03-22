import { useState, useEffect } from 'react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { Plus, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { listAll, createDoc, COL, Query } from '../lib/appwrite'

const STATIC_TASKS = [
  { id: '1', title: 'Pick up manure — Barn & Donkey Yard', description: 'Morning AND afternoon: Pick up manure in and around the barn, donkey yard, and pumphouse yard. Place in black waste containers.', category: 'daily', frequency_days: 1, priority: 'high', supply_location: 'Black waste containers near barn' },
  { id: '2', title: 'Spread Manure', description: 'Go SLOWLY — lots of gravel mixed in. Listen for rock jams (wheels stop turning). Rock jam fix: reverse a few inches. The clutch bolt will break if you push through a jam.', category: 'every_few_days', frequency_days: 3, priority: 'normal', supply_location: 'Manure spreader in barn', warning: 'Rock jam hazard! Listen carefully. Reverse to clear. Never force through.' },
  { id: '3', title: 'Check & Top Off Barn Water', description: 'Top off water in the barn at breakfast. Auto-timer runs 5:45–8:00am.', category: 'daily', frequency_days: 1, priority: 'high', supply_location: 'Barn water station' },
  { id: '4', title: 'Night Check — Lock Chicken Coop', description: 'Around 8:30pm — confirm all hens inside, close door if open. Auto-close is 9pm.', category: 'daily', frequency_days: 1, priority: 'high', supply_location: 'Chicken coop' },
  { id: '5', title: 'General Property Walk', description: 'Walk the property: check fences, gates, water lines, any hazards. Especially important after wind or storms — common in the Sierra Nevada foothills.', category: 'weekly', frequency_days: 7, priority: 'normal' },
  { id: '6', title: 'Check Perimeter Fencing', description: 'Look for any breaks, sagging wire, or leaning/fallen posts. Note and flag for owner. Especially after wind events.', category: 'weekly', frequency_days: 7, priority: 'normal' },
  { id: '7', title: 'Check Water Lines for Leaks', description: 'Look for wet spots near water lines. Check automatic faucet timer is working in barn.', category: 'weekly', frequency_days: 7, priority: 'normal', supply_location: 'Barn automatic faucet' },
]

const PRIORITY_MAP = {
  high:   { label: 'High',   cls: 'badge-red',  border: 'priority-high' },
  normal: { label: 'Normal', cls: 'badge-blue', border: 'priority-normal' },
  low:    { label: 'Low',    cls: 'badge-grey', border: 'priority-low' },
  urgent: { label: 'Urgent', cls: 'badge-orange', border: 'priority-urgent' },
}

const CAT_MAP = {
  daily: '📅 Daily',
  every_few_days: '📆 Every Few Days',
  weekly: '🗓️ Weekly',
  as_needed: '🔧 As Needed',
}

export default function PropertyTasks() {
  const [completions, setCompletions] = useState({}) // taskId → latest completion doc
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
      // Build a map: task_id → most recent completion
      const map = {}
      docs.forEach(doc => {
        if (!map[doc.task_id]) map[doc.task_id] = doc
      })
      setCompletions(map)
    } catch (e) {
      console.error('Completions fetch failed', e)
      // Fall back to localStorage
      const saved = localStorage.getItem('rlr_task_completions')
      if (saved) setCompletions(JSON.parse(saved))
    } finally {
      setLoading(false)
    }
  }

  async function completeTask(task) {
    setSaving(true)
    try {
      const data = {
        task_id: task.id,
        task_title: task.title,
        completed_at: new Date().toISOString(),
        notes: completeNotes || '',
      }
      const doc = await createDoc(COL.taskCompletions, data)
      setCompletions(prev => ({ ...prev, [task.id]: doc }))
    } catch (e) {
      console.error(e)
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

  const getDaysSince = (completion) => {
    if (!completion) return null
    return differenceInDays(new Date(), new Date(completion.completed_at))
  }

  const isOverdue = (task) => {
    const comp = completions[task.id]
    if (!comp) return true
    return getDaysSince(comp) >= task.frequency_days
  }

  const cats = ['all', 'daily', 'every_few_days', 'weekly', 'as_needed']
  const filtered = filter === 'all' ? STATIC_TASKS : STATIC_TASKS.filter(t => t.category === filter)

  const manureTask = STATIC_TASKS.find(t => t.id === '2')
  const manureComp = completions['2']
  const manureDays = getDaysSince(manureComp)
  const manureDue = manureDays === null || manureDays >= 3
  const manureOverdue = manureDays !== null && manureDays >= 4

  return (
    <div>
      <div className="page-title">🔧 Property Tasks</div>
      <div className="page-subtitle">Maintenance, cleaning &amp; property care</div>

      {STATIC_TASKS.some(t => isOverdue(t) && t.priority === 'high') && (
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
              <>
                <div className="manure-days">—</div>
                <div className="manure-label">No spread logged yet</div>
              </>
            )}
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.75, color: 'white' }}>
            <div>Spread every</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20 }}>3–4</div>
            <div>days</div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="chip-scroll">
        {cats.map(c => (
          <button key={c} className={`animal-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
            {c === 'all' ? '📋 All' : CAT_MAP[c]}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.map(task => {
        const comp = completions[task.id]
        const days = getDaysSince(comp)
        const overdue = isOverdue(task)
        return (
          <div key={task.id} className={`card ${PRIORITY_MAP[task.priority]?.border}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedTask(task)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {overdue && task.priority === 'high' && <span style={{ color: 'var(--danger)', fontSize: 12 }}>●</span>}
                  {task.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginBottom: 6 }}>{CAT_MAP[task.category]}</div>
              </div>
              <span className={`badge ${PRIORITY_MAP[task.priority]?.cls}`}>{PRIORITY_MAP[task.priority]?.label}</span>
            </div>

            {task.warning && (
              <div style={{ background: 'rgba(245,124,0,0.08)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#E65100', marginBottom: 8, fontWeight: 600 }}>⚠️ {task.warning}</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>
                {comp ? `Last done: ${format(new Date(comp.completed_at), 'MMM d, h:mm a')} (${days}d ago)` : 'Not yet completed'}
              </div>
              <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setSelectedTask(task); setShowComplete(true) }}>Done ✓</button>
            </div>

            {task.supply_location && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--forest-green)', fontWeight: 600 }}>📦 {task.supply_location}</div>
            )}
          </div>
        )
      })}

      {/* Detail modal */}
      {selectedTask && !showComplete && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">{selectedTask.title}</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--charcoal)', marginBottom: 16 }}>{selectedTask.description}</p>
            {selectedTask.warning && (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                <AlertTriangle size={18} color="var(--warning)" />
                <div className="alert-content"><div className="alert-body">{selectedTask.warning}</div></div>
              </div>
            )}
            {selectedTask.supply_location && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <Info size={18} color="var(--sky-blue)" />
                <div className="alert-content"><div className="alert-title">Supply Location</div><div className="alert-body">{selectedTask.supply_location}</div></div>
              </div>
            )}
            <button className="btn btn-primary btn-full" onClick={() => setShowComplete(true)}>
              <CheckCircle size={16} /> Mark as Complete
            </button>
          </div>
        </div>
      )}

      {/* Complete modal */}
      {showComplete && selectedTask && (
        <div className="modal-overlay" onClick={() => { setShowComplete(false); setSelectedTask(null) }}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Complete: {selectedTask.title}</div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" placeholder="Any notes about this completion..." value={completeNotes} onChange={e => setCompleteNotes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowComplete(false)}>Cancel</button>
              <button className="btn btn-green" style={{ flex: 2 }} disabled={saving} onClick={() => completeTask(selectedTask)}>
                {saving ? 'Saving...' : '✓ Confirm Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
