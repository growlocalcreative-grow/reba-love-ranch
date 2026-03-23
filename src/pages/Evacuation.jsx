import { Phone } from 'lucide-react'
import { RANCH_CONFIG, EVACUATION_ANIMALS } from '../data/ranch.config'

const ORDER_COLORS = ['var(--danger)', 'var(--warning)', 'var(--forest-green)', 'var(--sky-blue)', 'var(--slate-grey)']
const ORDER_LABELS = ['1st', '2nd', '3rd', '4th', '5th']

export default function Evacuation() {
  const { evacuationSteps, evacuationContacts, vehicleNotes } = RANCH_CONFIG

  return (
    <div>
      <div className="page-title" style={{ color: 'var(--danger)' }}>🔥 Evacuation Protocol</div>
      <div className="page-subtitle">Follow these steps calmly and in order</div>

      <div style={{ background: 'linear-gradient(135deg, #D32F2F, #b71c1c)', borderRadius: 'var(--radius-lg)', padding: 20, color: 'white', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>⚠️ If evacuation WARNING:</div>
        <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 12 }}>Call the owner immediately. Do not evacuate yet — stay on standby and monitor.</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>🚨 If MANDATORY evacuation:</div>
        <div style={{ fontSize: 15, lineHeight: 1.6 }}>Follow the steps below. You have time. Stay calm.</div>
      </div>

      {/* Steps */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>📋 Evacuation Steps</div>
        {evacuationSteps.map((step, i) => (
          <div key={step.step} style={{ display: 'flex', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: i < evacuationSteps.length - 1 ? '1px solid var(--warm-beige-dark)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: i === 0 ? 'rgba(74,144,226,0.15)' : 'var(--warm-beige)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 14, color: 'var(--sky-blue)', flexShrink: 0, border: '2px solid var(--warm-beige-dark)' }}>
              {step.step}
            </div>
            <div>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{step.icon}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{step.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading order — auto-generated from config */}
      {EVACUATION_ANIMALS.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🐴 Animal Loading Order</div>
          {EVACUATION_ANIMALS.map((animal, i) => (
            <div key={animal.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < EVACUATION_ANIMALS.length - 1 ? '1px solid var(--warm-beige-dark)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: ORDER_COLORS[i] || 'var(--slate-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                {ORDER_LABELS[i]}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{animal.emoji} {animal.name}</div>
                <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>{animal.evacuationNote}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--slate-grey)', lineHeight: 1.5 }}>
            Always use a <strong>slip knot (quick release)</strong> to tie them. Untie before off-loading.
          </div>
        </div>
      )}

      {/* Evacuation contacts */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>📞 Evacuation Contacts</div>
        {evacuationContacts.map(c => (
          <div key={c.name} className="phone-link">
            <div className="contact-info">
              <div className="contact-name">{c.name}</div>
              <div className="contact-note">{c.note}</div>
            </div>
            <a href={`tel:+1${c.phone}`} className="call-btn">
              <Phone size={14} /> {c.display}
            </a>
          </div>
        ))}
      </div>

      <div className="alert alert-info">
        <div style={{ fontSize: 24 }}>🔑</div>
        <div className="alert-content">
          <div className="alert-title">Truck Keys</div>
          <div className="alert-body">{vehicleNotes.keysLocation}. {vehicleNotes.trailerStatus}.</div>
        </div>
      </div>
    </div>
  )
}
