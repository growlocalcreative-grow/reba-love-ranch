import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getFeedSchedule, getTreats, getWaterNotes } from '../lib/ranchDataService'

const MEAL_TIMES = {
  breakfast:   { label: 'Breakfast',   time: '6:30 – 7:30 AM', icon: '🌅' },
  dinner:      { label: 'Dinner',      time: '4:00 – 5:30 PM', icon: '🌇' },
  night_check: { label: 'Night Check', time: '8:00 – 8:30 PM', icon: '🌙' },
}

const TYPE_EMOJI  = { equine: '🐴', chicken: '🐔', dog: '🐕', cat: '🐈', cow: '🐄', goat: '🐐', pig: '🐷', sheep: '🐑', duck: '🦆' }
const TYPE_BADGE  = { equine: 'badge-orange', chicken: 'badge-green', dog: 'badge-blue', cat: 'badge-pink', cow: 'badge-orange', goat: 'badge-grey' }
const TYPE_LABEL  = { equine: 'Equines', chicken: 'Chickens', dog: 'Dogs', cat: 'Cats', cow: 'Cattle', goat: 'Goats', pig: 'Pigs', sheep: 'Sheep', duck: 'Fowl' }

// Infer animal type from name string — keyword based since
// animal_name in feed_schedule_edit doesn't always match animals_edit exactly
function getType(name) {
  const n = name.toLowerCase()
  if (n.includes('dog'))                                                    return 'dog'
  if (n.includes('cat'))                                                    return 'cat'
  if (n.includes('chicken'))                                                return 'chicken'
  if (n.includes('cow'))                                                    return 'cow'
  if (n.includes('goat'))                                                   return 'goat'
  if (n.includes('pig'))                                                    return 'pig'
  if (n.includes('sheep'))                                                  return 'sheep'
  if (n.includes('duck'))                                                   return 'duck'
  if (n.includes('horse') || n.includes('donkey') || n.includes('pony') || n.includes('mule')) return 'equine'
  return 'equine' // sensible default for named equines like Luke, Shadow, Snowy
}

/**
 * Group flat Appwrite rows by animal_name, preserving meal order.
 * Input:  [{ animal_name, meal_time, time_window, items, has_medication, sort_order }]
 * Output: [{ animal, meals: [{ time, window, items, hasMed }] }]
 */
function groupByAnimal(rows) {
  const map = new Map()
  const order = []

  // Sort by sort_order within each animal group first
  const sorted = [...rows].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  sorted.forEach(row => {
    if (!map.has(row.animal_name)) {
      map.set(row.animal_name, [])
      order.push(row.animal_name)
    }
    map.get(row.animal_name).push({
      $id:    row.$id,
      time:   row.meal_time,
      window: row.time_window || '',
      items:  row.items || '',
      hasMed: row.has_medication === true || row.has_medication === 'true',
    })
  })

  return order.map(name => ({ animal: name, meals: map.get(name) }))
}

export default function FeedSchedule() {
  const [schedule, setSchedule]     = useState([])   // grouped by animal
  const [treats, setTreats]         = useState([])
  const [waterNotes, setWaterNotes] = useState([])
  const [filter, setFilter]         = useState('all')
  const [loading, setLoading]       = useState(true)

  // ── Load all three collections on mount ──────────────────────
  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [rows, treatsData, waterData] = await Promise.all([
        getFeedSchedule(),
        getTreats(),
        getWaterNotes(),
      ])
      setSchedule(groupByAnimal(rows || []))
      setTreats(
        [...(treatsData || [])]
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      )
      setWaterNotes(
        [...(waterData || [])]
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      )
    } catch (e) {
      console.error('FeedSchedule load failed', e)
    } finally {
      setLoading(false)
    }
  }

  // ── Derived values ───────────────────────────────────────────
  const hasMed   = schedule.some(a => a.meals.some(m => m.hasMed))
  const types    = ['all', ...new Set(schedule.map(a => getType(a.animal)))]
  const filtered = filter === 'all'
    ? schedule
    : schedule.filter(a => getType(a.animal) === filter)

  // ── Loading state ────────────────────────────────────────────
  if (loading) return (
    <div>
      <div className="page-title">🌾 Feed Schedule</div>
      <div className="page-subtitle">Daily feeding times &amp; portions for all animals</div>
      <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--slate-grey)' }}>
        Loading feed schedule...
      </div>
    </div>
  )

  // ── Empty state ──────────────────────────────────────────────
  if (schedule.length === 0) return (
    <div>
      <div className="page-title">🌾 Feed Schedule</div>
      <div className="page-subtitle">Daily feeding times &amp; portions for all animals</div>
      <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--slate-grey)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌾</div>
        <div>No feed schedule found. Ask the owner to set one up in the Admin Panel.</div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-title">🌾 Feed Schedule</div>
      <div className="page-subtitle">Daily feeding times &amp; portions for all animals</div>

      {/* ── Medication warning ── */}
      {hasMed && (
        <div className="alert alert-danger">
          <AlertTriangle size={18} color="var(--danger)" />
          <div className="alert-content">
            <div className="alert-title">⚠️ Medication in Feed</div>
            <div className="alert-body">One or more animals have medication in their feed. Check the schedule below carefully.</div>
          </div>
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="chip-scroll">
        {types.map(t => (
          <button
            key={t}
            className={`animal-chip ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t === 'all' ? '🐾 All' : `${TYPE_EMOJI[t] || '🐾'} ${TYPE_LABEL[t] || t}`}
          </button>
        ))}
      </div>

      {/* ── Schedule cards — now driven by Appwrite ── */}
      {filtered.map(entry => {
        const type = getType(entry.animal)
        return (
          <div key={entry.animal} className="card">
            <div className="card-header">
              <div className="card-title">
                <span style={{ fontSize: 20 }}>{TYPE_EMOJI[type] || '🐾'}</span>
                {entry.animal}
              </div>
              <span className={`badge ${TYPE_BADGE[type] || 'badge-grey'}`}>
                {TYPE_LABEL[type] || type}
              </span>
            </div>
            {entry.meals.map((meal, i) => (
              <div key={meal.$id || i} className="time-block">
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

      {/* ── Treats — from treats_edit ── */}
      {treats.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🥕 Treats &amp; Extras</div>
          {treats.map(t => (
            <div key={t.$id} className="check-row" style={{ cursor: 'default' }}>
              <span style={{ fontSize: 20 }}>{t.emoji}</span>
              <div className="check-label">
                <strong>{t.animals}</strong> — {t.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Water notes — from water_notes_edit ── */}
      {waterNotes.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>💧 Water Notes</div>
          {waterNotes.map(w => (
            <div key={w.$id} className="check-row" style={{ cursor: 'default' }}>
              <span style={{ fontSize: 20 }}>{w.emoji}</span>
              <div
                className="check-label"
                style={w.urgent === true || w.urgent === 'true'
                  ? { color: 'var(--danger)', fontWeight: 600 }
                  : {}}
              >
                {w.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
