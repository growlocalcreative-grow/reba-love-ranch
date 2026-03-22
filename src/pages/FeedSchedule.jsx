import { useState } from 'react'
import { STATIC_FEED_SCHEDULE, ANIMAL_TYPES, MEAL_TIMES } from '../data/ranchData'
import { AlertTriangle } from 'lucide-react'

export default function FeedSchedule() {
  const [filter, setFilter] = useState('all')

  const types = ['all', 'equine', 'chicken', 'dog', 'cat']
  const filtered = filter === 'all' ? STATIC_FEED_SCHEDULE : STATIC_FEED_SCHEDULE.filter(a => a.type === filter)

  return (
    <div>
      <div className="page-title">🌾 Feed Schedule</div>
      <div className="page-subtitle">Daily feeding times &amp; portions for all animals</div>

      {/* Medicine alert */}
      <div className="alert alert-danger">
        <AlertTriangle size={18} color="var(--danger)" />
        <div className="alert-content">
          <div className="alert-title">⚠️ Luke's Morning Medicine</div>
          <div className="alert-body">Luke's breakfast pellets contain his morning medication. Give him his labeled "breakfast" bag every morning without fail.</div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="chip-scroll">
        {types.map(t => (
          <button
            key={t}
            className={`animal-chip ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t === 'all' ? '🐾 All' : `${ANIMAL_TYPES[t]?.emoji} ${ANIMAL_TYPES[t]?.label}`}
          </button>
        ))}
      </div>

      {/* Schedule cards */}
      {filtered.map(animal => (
        <div key={animal.animal} className="card">
          <div className="card-header">
            <div className="card-title">
              <span style={{ fontSize: 20 }}>{ANIMAL_TYPES[animal.type]?.emoji}</span>
              {animal.animal}
            </div>
            <span className={`badge badge-${animal.type === 'equine' ? 'orange' : animal.type === 'dog' ? 'blue' : animal.type === 'cat' ? 'pink' : 'green'}`}>
              {ANIMAL_TYPES[animal.type]?.label}
            </span>
          </div>

          {animal.meals.map((meal, i) => (
            <div key={i} className="time-block">
              <div className="time-block-header">
                {MEAL_TIMES[meal.time]?.icon || '⏰'} {MEAL_TIMES[meal.time]?.label || meal.time} — {meal.window}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--charcoal)' }}>
                {meal.items}
              </div>
              {meal.hasMed && (
                <div style={{ marginTop: 6, background: 'rgba(211,47,47,0.08)', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--danger)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
                  💊 CONTAINS MEDICATION
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Extra treats section */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>🥕 Treats & Extras</div>
        <div className="check-row">
          <span style={{ fontSize: 20 }}>🐴</span>
          <div className="check-label">
            <strong>Equines (Luke, Snowy, Belle)</strong> — each can have a carrot (cut into slices)
          </div>
        </div>
        <div className="check-row">
          <span style={{ fontSize: 20 }}>🐔</span>
          <div className="check-label">
            <strong>Chickens</strong> — 2 little measuring cup scoops of mealworms + 2 of scratch from cabinet
          </div>
        </div>
      </div>

      {/* Water notes */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>💧 Water Notes</div>
        <div className="check-row">
          <span style={{ fontSize: 20 }}>🐴</span>
          <div className="check-label">
            Barn water: top off at breakfast. Auto-timer runs 5:45–8:00 AM.
          </div>
        </div>
        <div className="check-row">
          <span style={{ fontSize: 20 }}>🐕</span>
          <div className="check-label">
            <strong style={{ color: 'var(--danger)' }}>Shiloh: NO water after 6:00 PM</strong> (wets the bed)
          </div>
        </div>
        <div className="check-row">
          <span style={{ fontSize: 20 }}>🐕</span>
          <div className="check-label">Top off dog water bowls twice a day.</div>
        </div>
      </div>
    </div>
  )
}
