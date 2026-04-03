import { useState, useEffect } from 'react'
import { getAnimals, getTreats, getWaterNotes } from '../lib/ranchDataService'
import { parseSpecial } from '../lib/parseSpecial'

const TYPE_EMOJI = {
  equine: '🐴', chicken: '🐔', dog: '🐕', cat: '🐈',
  cow: '🐄', goat: '🐐', pig: '🐷', sheep: '🐑', duck: '🦆',
}

export default function DailyCare() {
  const [animals, setAnimals]     = useState([])
  const [treats, setTreats]       = useState([])
  const [waterNotes, setWaterNotes] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [animalDocs, treatDocs, waterDocs] = await Promise.all([
        getAnimals(),
        getTreats(),
        getWaterNotes(),
      ])

      // Only active (non-archived) animals
      setAnimals(
        (animalDocs || []).filter(a => a.archived !== true && a.archived !== 'true')
      )
      setTreats(
        [...(treatDocs || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      )
      setWaterNotes(
        [...(waterDocs || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      )
    } catch (e) {
      console.error('DailyCare load failed', e)
    } finally {
      setLoading(false)
    }
  }

  // Animals with 💊 in their special notes
  const medAnimals = animals.filter(a => {
    const special = parseSpecial(a.special)
    return special.some(s => s.includes('💊'))
  })

  // Animals with useful personality/odd_but_ok info
  const personalityAnimals = animals.filter(a => a.odd_but_ok || parseSpecial(a.special).length > 0)

  if (loading) return (
    <div>
      <div className="page-title">❤️ Daily Care</div>
      <div className="page-subtitle">Reference guide for daily animal care</div>
      <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--slate-grey)' }}>
        Loading care info...
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-title">❤️ Daily Care</div>
      <div className="page-subtitle">Reference guide for daily animal care</div>

      {/* ── Medication reminders — from animals_edit special notes ── */}
      {medAnimals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span>💊</span><span>Medication Reminders</span></div>
          </div>
          {medAnimals.map(animal => {
            const special = parseSpecial(animal.special)
            const medNotes = special.filter(s => s.includes('💊'))
            return (
              <div key={animal.$id} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid var(--warm-beige-dark)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{animal.emoji || TYPE_EMOJI[animal.type] || '🐾'}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--danger)' }}>
                    {animal.name}
                  </span>
                </div>
                {medNotes.map((note, i) => (
                  <div key={i} style={{ background: 'rgba(211,47,47,0.06)', borderRadius: 8, padding: '8px 12px', marginBottom: 6, fontSize: 13, lineHeight: 1.5, borderLeft: '3px solid var(--danger)' }}>
                    {note}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Snacks & Treats — from treats_edit ── */}
      {treats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span>🥕</span><span>Snacks &amp; Treats</span></div>
          </div>
          {treats.map(treat => (
            <div key={treat.$id} className="check-row" style={{ cursor: 'default' }}>
              <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{treat.emoji}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>
                  {treat.animals}
                </div>
                <div className="check-note">{treat.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Water reminders — from water_notes_edit ── */}
      {waterNotes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span>💧</span><span>Water Reminders</span></div>
          </div>
          {waterNotes.map(w => (
            <div key={w.$id} className="check-row" style={{ cursor: 'default' }}>
              <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{w.emoji}</span>
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

      {/* ── Personality notes — from animals_edit ── */}
      {personalityAnimals.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span>🧠</span><span>Personality Notes</span></div>
          </div>
          {personalityAnimals.map(animal => {
            const special = parseSpecial(animal.special)
            const firstNote = animal.odd_but_ok || special[0] || ''
            return (
              <div key={animal.$id} className="check-row" style={{ cursor: 'default' }}>
                <span style={{ fontSize: 22, width: 30 }}>
                  {animal.emoji || TYPE_EMOJI[animal.type] || '🐾'}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>
                    {animal.name}
                  </div>
                  <div className="check-note">{firstNote}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Grooming & Hygiene — static guidance ── */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 10 }}>✂️ Grooming &amp; Hygiene</div>
        <div className="alert alert-info" style={{ marginBottom: 0 }}>
          <div className="alert-content">
            <div className="alert-body">
              Log grooming, hoof picking, or any hygiene events using the Notes page. Take photos and upload them for the owner.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
