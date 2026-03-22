import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Plus } from 'lucide-react'
import { listAll, createDoc, COL, Query } from '../lib/appwrite'

export default function ManureLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ notes: '', rockJam: false, rockJamNotes: '' })
  const [error, setError] = useState(null)

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    setLoading(true)
    setError(null)
    try {
      const docs = await listAll(COL.manureLog, [Query.orderDesc('spread_date')])
      setLogs(docs)
    } catch (e) {
      console.error(e)
      const saved = localStorage.getItem('rlr_manure_logs')
      if (saved) setLogs(JSON.parse(saved))
      else setError('Could not load logs. Check your Appwrite configuration.')
    } finally {
      setLoading(false)
    }
  }

  async function addLog() {
    setSaving(true)
    try {
      const data = {
        spread_date: new Date().toISOString().split('T')[0],
        notes: form.notes || '',
        rock_jam_occurred: form.rockJam,
        rock_jam_notes: form.rockJam ? form.rockJamNotes : '',
      }
      const doc = await createDoc(COL.manureLog, data)
      setLogs(prev => [doc, ...prev])
    } catch (e) {
      console.error(e)
      const entry = { $id: Date.now().toString(), spread_date: new Date().toISOString().split('T')[0], notes: form.notes, rock_jam_occurred: form.rockJam, rock_jam_notes: form.rockJamNotes }
      const next = [entry, ...logs]
      setLogs(next)
      localStorage.setItem('rlr_manure_logs', JSON.stringify(next))
    } finally {
      setSaving(false)
      setShowModal(false)
      setForm({ notes: '', rockJam: false, rockJamNotes: '' })
    }
  }

  const lastLog = logs[0] || null
  const daysSince = lastLog ? differenceInDays(new Date(), new Date(lastLog.spread_date || lastLog.date)) : null
  const isDue = daysSince === null || daysSince >= 3
  const isOverdue = daysSince !== null && daysSince >= 4

  return (
    <div>
      <div className="page-title">♻️ Manure Log</div>
      <div className="page-subtitle">Track manure spreading — every 3–4 days</div>

      <div className="manure-tracker" style={{ background: isOverdue ? 'linear-gradient(135deg,#c62828,#b71c1c)' : isDue ? 'linear-gradient(135deg,#E65100,#BF360C)' : 'linear-gradient(135deg,#2E7D32,#1b5e20)' }}>
        {loading ? <div style={{ opacity: 0.7, fontFamily: 'var(--font-heading)' }}>Loading...</div>
          : daysSince !== null ? (
            <>
              <div className="manure-days">{daysSince}</div>
              <div className="manure-label">days since last spread</div>
              <div style={{ marginTop: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>
                {isOverdue ? '🚨 OVERDUE — spread today!' : isDue ? '⚠️ Due now — time to spread' : `✅ Next due in ${3 - daysSince} day(s)`}
              </div>
            </>
          ) : (
            <>
              <div className="manure-days">—</div>
              <div className="manure-label">No logs yet — log your first spread</div>
            </>
          )}
      </div>

      <div className="alert alert-warning">
        <div style={{ fontSize: 20 }}>⚠️</div>
        <div className="alert-content">
          <div className="alert-title">Rock Jam Warning</div>
          <div className="alert-body">Go slowly — lots of gravel mixed in. If wheels stop turning: <strong>reverse a few inches</strong> to release the jam. Do NOT push through or the clutch bolt will break.</div>
        </div>
      </div>

      {error && <div className="alert alert-danger"><div className="alert-content"><div className="alert-body">{error}</div></div></div>}

      {!loading && logs.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">♻️</div><p>No spreads logged yet. Tap + to add one.</p></div>
      ) : (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>📋 Spread History</div>
          {logs.map((log, i) => (
            <div key={log.$id || i} className="check-row" style={{ cursor: 'default' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--warm-beige)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--forest-green)', border: '2px solid var(--forest-green)' }}>
                {i === 0 ? '★' : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>
                  {format(new Date(log.spread_date || log.date), 'EEE, MMM d yyyy')}
                  {i === 0 && <span className="badge badge-green" style={{ marginLeft: 8 }}>Latest</span>}
                </div>
                {log.notes && <div style={{ fontSize: 13, color: 'var(--slate-grey)', marginTop: 2 }}>{log.notes}</div>}
                {log.rock_jam_occurred && <div style={{ marginTop: 4, fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>⚠️ Rock jam{log.rock_jam_notes ? ` — ${log.rock_jam_notes}` : ''}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" style={{ background: 'var(--forest-green)' }} onClick={() => setShowModal(true)}><Plus /></button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Log Manure Spread</div>
            <div className="form-group">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-textarea" placeholder="Conditions, observations..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }} onClick={() => setForm({ ...form, rockJam: !form.rockJam })}>
              <div className={`check-box ${form.rockJam ? 'checked' : ''}`}>
                {form.rockJam && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Rock jam occurred?</label>
            </div>
            {form.rockJam && (
              <div className="form-group">
                <label className="form-label">Rock Jam Notes</label>
                <textarea className="form-textarea" placeholder="What happened? Did reversing clear it?" value={form.rockJamNotes} onChange={e => setForm({ ...form, rockJamNotes: e.target.value })} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-green" style={{ flex: 2 }} disabled={saving} onClick={addLog}>{saving ? 'Saving...' : '♻️ Log Spread'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
