import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { getPropertyTasks } from '../lib/ranchDataService'
import { listAll, createDoc, COL, Query } from '../lib/appwrite'

const PRIORITY_MAP = {
  high:   { label: 'High',   cls: 'badge-red',    border: 'priority-high' },
  normal: { label: 'Normal', cls: 'badge-blue',   border: 'priority-normal' },
  low:    { label: 'Low',    cls: 'badge-grey',   border: 'priority-low' },
  urgent: { label: 'Urgent', cls: 'badge-orange', border: 'priority-urgent' },
}

const CAT_MAP = {
  daily:          '📅 Daily',
  every_few_days: '📆 Every Few Days',
  weekly:         '🗓️ Weekly',
  as_needed:      '🔧 As Needed',
}

export default function PropertyTasks() {
  const [tasks, setTasks]             = useState([])
  const [completions, setCompletions] = useState({})   // keyed by task_key
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showComplete, setShowComplete] = useState(false)
  const [completeNotes, setCompleteNotes] = useState('')
  const [saving, setSaving]           = useState(false)

  useEffect(() => { loadAll() }, [])

  // ── Load tasks + completions in parallel ─────────────────────
  async function loadAll() {
    setLoading(true)
    try {
      const [taskDocs, compDocs] = await Promise.all([
        getPropertyTasks(),
        listAll(COL.taskCompletions, [Query.orderDesc('$createdAt'), Query.limit(100)])
      ])

      // Sort by sort_order
      const sorted = [...(taskDocs || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      setTasks(sorted)

      // Map completions by task_key — keep only the most recent per task
      const map = {}
      compDocs.forEach(doc => {
        if (doc.task_id && !map[doc.task_id]) map[doc.task_id] = doc
      })
      setCompletions(map)
    } catch (e) {
      console.error('PropertyTasks load failed', e)
      const saved = localStorage.getItem('rlr_task_completions')
      if (saved) setCompletions(JSON.parse(saved))
    } finally {
      setLoading(false)
    }
  }

  // ── Mark a task complete ─────────────────────────────────────
  async function completeTask(task) {
    setSaving(true)
    try {
      const doc = await createDoc(COL.taskCompletions, {
        task_id:      task.task_key,
        task_title:   task.title,
        completed_at: new Date().toISOString(),
        notes:        completeNotes || '',
      })
      setCompletions(prev => ({ ...prev, [task.task_key]: doc }))
    } catch {
      const fallback = {
        $id:          Date.now().toString(),
        task_id:      task.task_key,
        completed_at: new Date().toISOString(),
        notes:        completeNotes,
      }
      const next = { ...completions, [task.task_key]: fallback }
      setCompletions(next)
      localStorage.setItem('rlr_task_completions', JSON.stringify(next))
    } finally {
      setSaving(false)
      setSelectedTask(null)
      setShowComplete(false)
      setCompleteNotes('')
    }
  }

  // ── Helpers ──────────────────────────────────────────────────
  const getDaysSince = (comp) =>
    comp ? differenceInDays(new Date(), new Date(comp.completed_at)) : null

  const isOverdue = (task) => {
    const comp = completions[task.task_key]
    if (!comp) return true
    const days = getDaysSince(comp)
    return days >= (parseInt(task.frequency_days) || 1)
  }

  // ── Manure tracker — driven by task_key '2' ──────────────────
  const manureTask  = tasks.find(t => t.task_key === '2')
  const manureComp  = completions['2']
  const manureDays  = getDaysSince(manureComp)
  const manureFreq  = parseInt(manureTask?.frequency_days) || 3
  const manureDue   = manureDays === null || manureDays >= manureFreq
  const manureOverdue = manureDays !== null && manureDays >= (manureFreq + 1)

  // ── Filter chips ─────────────────────────────────────────────
  const cats     = ['all', ...new Set(tasks.map(t => t.category))]
  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.category === filter)

  // ── Loading state ────────────────────────────────────────────
  if (loading) return (
    <div>
      <div className="page-title">🔧 Property Tasks</div>
      <div className="page-subtitle">Maintenance, cleaning &amp; property care</div>
      <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--slate-grey)' }}>
        Loading tasks...
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-title">🔧 Property Tasks</div>
      <div className="page-subtitle">Maintenance, cleaning &amp; property care</div>

      {/* ── Overdue warning ── */}
      {tasks.some(t => isOverdue(t) && t.priority === 'high') && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} color="var(--warning)" />
          <div className="alert-content">
            <div className="alert-title">Tasks Need Attention</div>
            <div className="alert-body">Some high-priority tasks are due or overdue.</div>
          </div>
        </div>
      )}

      {/* ── Manure tracker widget ── */}
      {manureTask && (
        <div
          className="manure-tracker"
          style={{
            background: manureOverdue
              ? 'linear-gradient(135deg,#c62828,#b71c1c)'
              : manureDue
              ? 'linear-gradient(135deg,#E65100,#BF360C)'
              : 'linear-gradient(135deg,#2E7D32,#1b5e20)',
            cursor: 'pointer',
          }}
          onClick={() => setFilter('every_few_days')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, textTransform: 'uppercase', fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', marginBottom: 4 }}>
                Manure Spreading
              </div>
              {manureDays !== null ? (
                <>
                  <div className="manure-days">{manureDays}</div>
                  <div className="manure-label">days since last spread</div>
                  {manureDue && (
                    <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      {manureOverdue ? '🚨 OVERDUE' : '⚠️ DUE NOW'}
                    </div>
                  )}
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
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20 }}>{manureFreq}</div>
              <div>days</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="chip-scroll">
        {cats.map(c => (
          <button
            key={c}
            className={`animal-chip ${filter === c ? 'active' : ''}`}
            onClick={() => setFilter(c)}
          >
            {c === 'all' ? '📋 All' : CAT_MAP[c] || c}
          </button>
        ))}
      </div>

      {/* ── Task cards — now driven by Appwrite ── */}
      {filtered.map(task => {
        const comp = completions[task.task_key]
        const days = getDaysSince(comp)
        return (
          <div
            key={task.$id}
            className={`card ${PRIORITY_MAP[task.priority]?.border || ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedTask(task)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isOverdue(task) && task.priority === 'high' && (
                    <span style={{ color: 'var(--danger)', fontSize: 12 }}>●</span>
                  )}
                  {task.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginBottom: 6 }}>
                  {CAT_MAP[task.category] || task.category}
                </div>
              </div>
              <span className={`badge ${PRIORITY_MAP[task.priority]?.cls || 'badge-grey'}`}>
                {PRIORITY_MAP[task.priority]?.label || task.priority}
              </span>
            </div>

            {task.warning && (
              <div style={{ background: 'rgba(245,124,0,0.08)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#E65100', marginBottom: 8, fontWeight: 600 }}>
                ⚠️ {task.warning}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>
                {comp
                  ? `Last done: ${format(new Date(comp.completed_at), 'MMM d, h:mm a')} (${days}d ago)`
                  : 'Not yet completed'}
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={e => { e.stopPropagation(); setSelectedTask(task); setShowComplete(true) }}
              >
                Done ✓
              </button>
            </div>

            {task.supply_location && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--forest-green)', fontWeight: 600 }}>
                📦 {task.supply_location}
              </div>
            )}
          </div>
        )
      })}

      {/* ── Task detail modal ── */}
      {selectedTask && !showComplete && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">{selectedTask.title}</div>
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{selectedTask.description}</p>
            {selectedTask.warning && (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                <AlertTriangle size={18} color="var(--warning)" />
                <div className="alert-content">
                  <div className="alert-body">{selectedTask.warning}</div>
                </div>
              </div>
            )}
            {selectedTask.supply_location && (
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <Info size={18} color="var(--sky-blue)" />
                <div className="alert-content">
                  <div className="alert-title">Supply Location</div>
                  <div className="alert-body">{selectedTask.supply_location}</div>
                </div>
              </div>
            )}
            <button className="btn btn-primary btn-full" onClick={() => setShowComplete(true)}>
              <CheckCircle size={16} /> Mark as Complete
            </button>
          </div>
        </div>
      )}

      {/* ── Completion confirm modal ── */}
      {showComplete && selectedTask && (
        <div className="modal-overlay" onClick={() => { setShowComplete(false); setSelectedTask(null) }}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Complete: {selectedTask.title}</div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Any notes..."
                value={completeNotes}
                onChange={e => setCompleteNotes(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowComplete(false)}>Cancel</button>
              <button
                className="btn btn-green"
                style={{ flex: 2 }}
                disabled={saving}
                onClick={() => completeTask(selectedTask)}
              >
                {saving ? 'Saving...' : '✓ Confirm Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
