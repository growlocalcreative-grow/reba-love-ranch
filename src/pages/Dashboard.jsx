import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { RANCH_CONFIG } from '../data/ranch.config'
import { useAuth } from '../context/AuthContext'
import { databases, DB_ID, COL, ID, Query, listAll, createDoc } from '../lib/appwrite'

const MEAL_TIMES = {
  breakfast:   { label: 'Breakfast',   time: '6:30 – 7:30 AM', icon: '🌅' },
  dinner:      { label: 'Dinner',      time: '4:00 – 5:30 PM', icon: '🌇' },
  night_check: { label: 'Night Check', time: '8:00 – 8:30 PM', icon: '🌙' },
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return { period: 'breakfast', label: 'Good morning! 🌅', sub: 'Time for morning chores' }
  if (h < 17) return { period: 'dinner',    label: 'Good afternoon! ☀️', sub: 'Afternoon rounds time' }
  return { period: 'night_check', label: 'Good evening! 🌙', sub: 'Evening check time' }
}

const TODAY = format(new Date(), 'yyyy-MM-dd')

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { dailyTasks, name } = RANCH_CONFIG

  const [checked, setChecked] = useState({})
  const [docId, setDocId] = useState(null) // Appwrite document ID for today's completions
  const [loading, setLoading] = useState(true)
  const timeInfo = getTimeOfDay()

  // Load today's completions from Appwrite on mount
  useEffect(() => {
    loadCompletions()
  }, [])

  async function loadCompletions() {
    setLoading(true)
    try {
      // Look for today's completion doc
      const docs = await listAll(COL.taskCompletions, [
        Query.equal('date', TODAY),
        Query.limit(1),
      ])

      if (docs.length > 0) {
        // Found today's doc — load checked state
        const doc = docs[0]
        setDocId(doc.$id)
        try {
          const completedIds = JSON.parse(doc.completed_ids || '[]')
          const checkedMap = {}
          completedIds.forEach(id => { checkedMap[id] = true })
          setChecked(checkedMap)
        } catch {
          setChecked({})
        }
      } else {
        // No doc for today — fresh start (daily reset!)
        setChecked({})
        setDocId(null)
      }
    } catch (e) {
      // Appwrite not available — fall back to localStorage
      console.warn('Appwrite unavailable, using localStorage', e)
      const saved = localStorage.getItem(`rlr_checks_${TODAY}`)
      setChecked(saved ? JSON.parse(saved) : {})
    } finally {
      setLoading(false)
    }
  }

  async function toggle(id) {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)

    const completedIds = Object.entries(next)
      .filter(([, v]) => v)
      .map(([k]) => k)

    try {
      if (docId) {
        // Update existing doc
        await databases.updateDocument(DB_ID, COL.taskCompletions, docId, {
          completed_ids: JSON.stringify(completedIds),
          updated_at: new Date().toISOString(),
        })
      } else {
        // Create new doc for today
        const doc = await createDoc(COL.taskCompletions, {
          date: TODAY,
          completed_ids: JSON.stringify(completedIds),
          updated_at: new Date().toISOString(),
        })
        setDocId(doc.$id)
      }
    } catch (e) {
      // Fall back to localStorage if Appwrite fails
      console.warn('Appwrite save failed, using localStorage', e)
      localStorage.setItem(`rlr_checks_${TODAY}`, JSON.stringify(next))
    }
  }

  const total = dailyTasks.length
  const done = dailyTasks.filter(t => checked[t.id]).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const grouped = {
    breakfast:   dailyTasks.filter(t => t.time === 'breakfast'),
    dinner:      dailyTasks.filter(t => t.time === 'dinner'),
    night_check: dailyTasks.filter(t => t.time === 'night_check'),
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Sitter'

  return (
    <div>
      <div className="greeting-card">
        <div className="greeting-time">{format(new Date(), 'EEEE, MMMM d')}</div>
        <div className="greeting-main">{timeInfo.label}</div>
        <div className="greeting-sub">Welcome, {displayName}! {timeInfo.sub}</div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14 }}>Today's Progress</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: pct === 100 ? 'var(--forest-green)' : 'var(--sky-blue)' }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--warm-beige-dark)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--forest-green)' : 'var(--sky-blue)', borderRadius: 5, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginTop: 6 }}>
          {loading ? 'Loading...' : `${done} of ${total} tasks complete — synced across all devices ✅`}
        </div>
      </div>

      <div className="alert alert-danger" style={{ cursor: 'pointer' }} onClick={() => navigate('/evacuation')}>
        <AlertTriangle size={18} color="var(--danger)" />
        <div className="alert-content">
          <div className="alert-title">Evacuation Protocol</div>
          <div className="alert-body">Fire / evacuation instructions &amp; contacts — tap to view</div>
        </div>
        <ChevronRight size={18} color="var(--slate-grey)" style={{ marginTop: 2 }} />
      </div>

      {Object.entries(grouped).map(([period, tasks]) => tasks.length === 0 ? null : (
        <div key={period} className="card">
          <div className="card-header">
            <div className="card-title">
              <span>{MEAL_TIMES[period].icon}</span>
              {MEAL_TIMES[period].label}
            </div>
            <span className="badge badge-grey">{MEAL_TIMES[period].time}</span>
          </div>
          {tasks.map(task => (
            <div key={task.id} className="check-row" onClick={() => toggle(task.id)}>
              <div className={`check-box ${checked[task.id] ? 'checked' : ''}`}>
                {checked[task.id] && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div>
                <div className={`check-label ${checked[task.id] ? 'completed' : ''}`}>
                  {task.icon} {task.label}
                </div>
                {task.note && <div className="check-note">{task.note}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { icon: '🌾', label: 'Feed Schedule', path: '/feed' },
          { icon: '♻️', label: 'Manure Log',    path: '/manure' },
          { icon: '🏥', label: 'Health Records', path: '/health' },
          { icon: '🚨', label: 'Emergency',      path: '/emergency' },
        ].map(item => (
          <button key={item.path} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 12px', marginBottom: 0 }} onClick={() => navigate(item.path)}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
