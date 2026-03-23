import { useState } from 'react'
import { RANCH_CONFIG } from '../data/ranch.config'
import { AlertTriangle } from 'lucide-react'

const MEAL_TIMES = {
  breakfast:   { label: 'Breakfast',   time: '6:30 – 7:30 AM', icon: '🌅' },
  dinner:      { label: 'Dinner',      time: '4:00 – 5:30 PM', icon: '🌇' },
  night_check: { label: 'Night Check', time: '8:00 – 8:30 PM', icon: '🌙' },
}

const TYPE_EMOJI = { equine: '🐴', chicken: '🐔', dog: '🐕', cat: '🐈', cow: '🐄', goat: '🐐', pig: '🐷' }
const TYPE_BADGE = { equine: 'badge-orange', chicken: 'badge-green', dog: 'badge-blue', cat: 'badge-pink' }

export default function FeedSchedule() {
  const { feedSchedule, animals, treats, waterNotes } = RANCH_CONFIG
  const [filter, setFilter] = useState('all')

  const getType = (animalName) => animals.find(a => a.name === animalName)?.type || 'equine'
  const hasMed = feedSchedule.some(a => a.meals.some(m => m.hasMed))

  const types = ['all', ...new Set(feedSchedule.map(a => getType(a.animal)))]
  const filtered = filter === 'all' ? feedSchedule : feedSchedule.filter(a => getType(a.animal) === filter)

  return (
    <div>
      <div className="page-title">🌾 Feed Schedule</div>
      <div className="page-subtitle">Daily feeding times &amp; portions for all animals</div>

      {hasMed && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} color="var(--danger)" />
          <div className="alert-content">
            <div className="alert-title">⚠️ Medication in Feed</div>
            <div className="alert-body">One or more animals have medication in their feed. Check the schedule below carefully.</div>
          </div>
        </div>
      )}

      <div className="chip-scroll">
        {types.map(t => (
          <button key={t} className={`animal-chip ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t === 'all' ? '🐾 All' : `${TYPE_EMOJI[t] || '🐾'} ${t.charAt(0).toUpperCase() + t.slice(1)}s`}
          </button>
        ))}
      </div>

      {filtered.map(entry => {
        const type = getType(entry.animal)
        return (
          <div key={entry.animal} className="card">
            <div className="card-header">
              <div className="card-title">
                <span style={{ fontSize: 20 }}>{TYPE_EMOJI[type] || '🐾'}</span>
                {entry.animal}
              </div>
              <span className={`badge ${TYPE_BADGE[type] || 'badge-grey'}`}>{type}</span>
            </div>
            {entry.meals.map((meal, i) => (
              <div key={i} className="time-block">
                <div className="time-block-header">
                  {MEAL_TIMES[meal.time]?.icon} {MEAL_TIMES[meal.time]?.label} — {meal.window}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>{meal.items}</div>
                {meal.hasMed && (
                  <div style={{ marginTop: 6, background: 'rgba(211,47,47,0.08)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--danger)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                    💊 CONTAINS MEDICATION
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      })}

      {treats?.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🥕 Treats &amp; Extras</div>
          {treats.map((t, i) => (
            <div key={i} className="check-row" style={{ cursor: 'default' }}>
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <div className="check-label"><strong>{t.animals}</strong> — {t.description}</div>
            </div>
          ))}
        </div>
      )}

      {waterNotes?.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>💧 Water Notes</div>
          {waterNotes.map((w, i) => (
            <div key={i} className="check-row" style={{ cursor: 'default' }}>
              <span style={{ fontSize: 20 }}>{w.emoji}</span>
              <div className="check-label" style={w.urgent ? { color: 'var(--danger)', fontWeight: 600 } : {}}>
                {w.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
