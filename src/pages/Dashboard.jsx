import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { AlertTriangle, ChevronRight, Droplets, Wind } from 'lucide-react'
import { MEAL_TIMES } from '../data/ranchData'

const QUICK_TASKS = [
  { id: 'barn_water', label: 'Top off barn water', icon: '💧', time: 'breakfast' },
  { id: 'equine_breakfast', label: 'Equine breakfast pellets + hay', icon: '🌾', time: 'breakfast', note: '⚠️ Luke's bag has medicine!' },
  { id: 'chicken_am', label: 'Check chicken feeder & water', icon: '🐔', time: 'breakfast' },
  { id: 'dog_breakfast', label: 'Dog food + Dentastix', icon: '🐕', time: 'breakfast' },
  { id: 'cat_food', label: 'Check cat gravity feeder', icon: '🐈', time: 'breakfast' },
  { id: 'manure_am', label: 'Pick up manure — barn & yards', icon: '♻️', time: 'breakfast' },
  { id: 'equine_dinner', label: 'Equine dinner pellets + hay', icon: '🌾', time: 'dinner' },
  { id: 'chicken_pm', label: 'Check chicken feeder & water', icon: '🐔', time: 'dinner' },
  { id: 'dog_dinner', label: 'Dog dinner (no water for Shiloh after 6pm)', icon: '🐕', time: 'dinner' },
  { id: 'manure_pm', label: 'Pick up manure — afternoon round', icon: '♻️', time: 'dinner' },
  { id: 'chicken_night', label: 'Verify all hens in coop (close door if open)', icon: '🐔', time: 'night_check', note: 'Auto-closes 9pm' },
  { id: 'equine_night', label: 'Night hay — Belle: 1 flake; Snowy & Luke: ½ flake each', icon: '🌙', time: 'night_check' },
]

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return { period: 'breakfast', label: 'Good morning! 🌅', sub: 'Time for morning chores' }
  if (h < 17) return { period: 'dinner', label: 'Good afternoon! ☀️', sub: 'Afternoon rounds time' }
  return { period: 'night_check', label: 'Good evening! 🌙', sub: 'Evening check time' }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem(`rlr_checks_${format(new Date(), 'yyyy-MM-dd')}`)
    return saved ? JSON.parse(saved) : {}
  })

  const timeInfo = getTimeOfDay()

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    localStorage.setItem(`rlr_checks_${format(new Date(), 'yyyy-MM-dd')}`, JSON.stringify(next))
  }

  const total = QUICK_TASKS.length
  const done = QUICK_TASKS.filter(t => checked[t.id]).length
  const pct = Math.round((done / total) * 100)

  const grouped = {
    breakfast: QUICK_TASKS.filter(t => t.time === 'breakfast'),
    dinner: QUICK_TASKS.filter(t => t.time === 'dinner'),
    night_check: QUICK_TASKS.filter(t => t.time === 'night_check'),
  }

  return (
    <div>
      {/* Greeting */}
      <div className="greeting-card">
        <div className="greeting-time">{format(new Date(), 'EEEE, MMMM d')}</div>
        <div className="greeting-main">{timeInfo.label}</div>
        <div className="greeting-sub">{timeInfo.sub}</div>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14 }}>Today's Progress</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: pct === 100 ? 'var(--forest-green)' : 'var(--sky-blue)' }}>{pct}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--warm-beige-dark)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--forest-green)' : 'var(--sky-blue)', borderRadius: 5, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginTop: 6 }}>{done} of {total} tasks complete</div>
      </div>

      {/* Evacuation alert */}
      <div
        className="alert alert-danger"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/evacuation')}
      >
        <AlertTriangle size={18} color="var(--danger)" />
        <div className="alert-content">
          <div className="alert-title">Evacuation Protocol</div>
          <div className="alert-body">Fire / evacuation instructions &amp; contacts — tap to view</div>
        </div>
        <ChevronRight size={18} color="var(--slate-grey)" style={{ marginTop: 2 }} />
      </div>

      {/* Checklists by time period */}
      {Object.entries(grouped).map(([period, tasks]) => (
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

      {/* Quick nav cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { icon: '🌾', label: 'Feed Schedule', path: '/feed' },
          { icon: '♻️', label: 'Manure Log', path: '/manure' },
          { icon: '🏥', label: 'Health Records', path: '/health' },
          { icon: '🚨', label: 'Emergency', path: '/emergency' },
        ].map(item => (
          <button
            key={item.path}
            className="card"
            style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 12px', marginBottom: 0 }}
            onClick={() => navigate(item.path)}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{item.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
