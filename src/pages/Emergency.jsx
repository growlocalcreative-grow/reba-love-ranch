import { Phone, MapPin, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RANCH_CONFIG } from '../data/ranch.config'

export default function Emergency() {
  const navigate = useNavigate()
  const { emergencyContacts, vehicleNotes, name } = RANCH_CONFIG

  return (
    <div>
      <div className="page-title" style={{ color: 'var(--danger)' }}>🚨 Emergency</div>
      <div className="page-subtitle">Contacts &amp; urgent procedures</div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #D32F2F, #b71c1c)', color: 'white', cursor: 'pointer', marginBottom: 16 }} onClick={() => navigate('/evacuation')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🔥 Evacuation Protocol</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Step-by-step emergency evacuation guide</div>
          </div>
          <ChevronRight size={24} color="rgba(255,255,255,0.8)" />
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 20 }}>🔑</div>
        <div className="alert-content">
          <div className="alert-title">Truck Keys Location</div>
          <div className="alert-body"><strong>{vehicleNotes.keysLocation}</strong>. {vehicleNotes.trailerStatus}.</div>
        </div>
      </div>

      {emergencyContacts.map(group => (
        <div key={group.category} className="card" style={{ marginBottom: 12 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>{group.title}</div>
          {group.items.map((contact, i) => (
            <div key={i} className="phone-link">
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-role">{contact.role}</div>
                {contact.address && (
                  <div className="contact-note" style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 3 }}>
                    <MapPin size={11} style={{ flexShrink: 0, marginTop: 2 }} />
                    {contact.address}
                  </div>
                )}
                {contact.note && <div className="contact-note">{contact.note}</div>}
              </div>
              <a href={`tel:+1${contact.phone}`} className="call-btn" onClick={e => e.stopPropagation()}>
                <Phone size={14} /> Call
              </a>
            </div>
          ))}
        </div>
      ))}

      <div className="alert alert-danger">
        <div style={{ fontSize: 20 }}>🆘</div>
        <div className="alert-content">
          <div className="alert-title">Life-threatening emergency?</div>
          <div className="alert-body">Call 911 first. Then contact the ranch owner.</div>
        </div>
      </div>
    </div>
  )
}
