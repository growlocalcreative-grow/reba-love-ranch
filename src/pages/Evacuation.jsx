import { EVACUATION_STEPS } from '../data/ranchData'
import { Phone } from 'lucide-react'

export default function Evacuation() {
  return (
    <div>
      <div className="page-title" style={{ color: 'var(--danger)' }}>🔥 Evacuation Protocol</div>
      <div className="page-subtitle">Follow these steps calmly and in order</div>

      {/* Critical box */}
      <div style={{ background: 'linear-gradient(135deg, #D32F2F, #b71c1c)', borderRadius: 'var(--radius-lg)', padding: 20, color: 'white', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>⚠️ If evacuation WARNING:</div>
        <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 12 }}>Call the owner immediately. Do not evacuate yet — stay on standby and monitor.</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>🚨 If MANDATORY evacuation:</div>
        <div style={{ fontSize: 15, lineHeight: 1.6 }}>Follow the steps below. You have time. Stay calm.</div>
      </div>

      {/* Step by step */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>📋 Evacuation Steps</div>
        {EVACUATION_STEPS.map((step, i) => (
          <div key={step.step} style={{ display: 'flex', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: i < EVACUATION_STEPS.length - 1 ? '1px solid var(--warm-beige-dark)' : 'none' }}>
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

      {/* Loading order visual */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>🐴 Horse Loading Order</div>
        {[
          { order: '1st', name: 'Belle', note: 'Biggest — load first. Others follow.', color: 'var(--danger)' },
          { order: '2nd', name: 'Snowy', note: 'If Belle won\'t go, try Snowy instead.', color: 'var(--warning)' },
          { order: '3rd', name: 'Luke', note: 'Always load last.', color: 'var(--forest-green)' },
        ].map(h => (
          <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--warm-beige-dark)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: h.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{h.order}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>🐴 {h.name}</div>
              <div style={{ fontSize: 12, color: 'var(--slate-grey)' }}>{h.note}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--slate-grey)', lineHeight: 1.5 }}>
          Keep the stall divider latched to the sidewall — there's room for all 3. Always use a <strong>slip knot (quick release)</strong> to tie them. Untie before off-loading.
        </div>
      </div>

      {/* Evacuation contacts */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>📞 Evacuation Contacts</div>
        {[
          { name: 'Peggy (Neighbor)', phone: '7073375164', display: '(707) 337-5164', note: 'Call for help loading horses' },
          { name: 'Cheri Burnett', phone: '9168355340', display: '(916) 835-5340', note: '8241 El Modena Ave, Elverta — call first' },
          { name: "Chris (Cheri's husband)", phone: '9167651359', display: '(916) 765-1359', note: 'Backup for Cheri' },
          { name: 'Elverta Stables — Vadim', phone: '9163651198', display: '(916) 365-1198', note: '7751 Sorento Rd, Elverta — call first' },
        ].map(c => (
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

      {/* Key location */}
      <div className="alert alert-info">
        <div style={{ fontSize: 24 }}>🔑</div>
        <div className="alert-content">
          <div className="alert-title">Truck Keys</div>
          <div className="alert-body">In the dish on the coat rack by the back door. Trailer is already hitched.</div>
        </div>
      </div>
    </div>
  )
}
