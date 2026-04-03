import { useState, useEffect } from 'react'
import { Phone, MapPin, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { RANCH_CONFIG } from '../data/ranch.config'
import { getContacts } from '../lib/ranchDataService'

// Category display titles — stored as plain strings in Appwrite
const CATEGORY_TITLES = {
  vets:       '🏥 Veterinary',
  owner:      '👨‍👩‍👧 Owner & Family',
  neighbors:  '🏡 Neighbors & Help',
  evacuation: '🚨 Evacuation Locations',
}

// Preferred display order for categories
const CATEGORY_ORDER = ['vets', 'owner', 'neighbors', 'evacuation']

/**
 * Group flat Appwrite contact rows by category.
 * Returns array in CATEGORY_ORDER with contacts sorted by sort_order.
 */
function groupContacts(rows) {
  const map = {}
  rows.forEach(row => {
    if (!map[row.category]) map[row.category] = []
    map[row.category].push(row)
  })

  // Sort contacts within each category by sort_order
  Object.keys(map).forEach(cat => {
    map[cat].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  })

  // Return in preferred order — any unknown categories go at the end
  const known   = CATEGORY_ORDER.filter(c => map[c])
  const unknown = Object.keys(map).filter(c => !CATEGORY_ORDER.includes(c))
  return [...known, ...unknown].map(cat => ({
    category: cat,
    title:    CATEGORY_TITLES[cat] || cat,
    items:    map[cat],
  }))
}

export default function Emergency() {
  const navigate = useNavigate()

  // vehicleNotes stays from config — safety-critical, rarely changes
  const { vehicleNotes } = RANCH_CONFIG

  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const docs = await getContacts()
      setGroups(groupContacts(docs || []))
    } catch (e) {
      console.error('Emergency contacts load failed', e)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-title" style={{ color: 'var(--danger)' }}>🚨 Emergency</div>
      <div className="page-subtitle">Contacts &amp; urgent procedures</div>

      {/* ── Evacuation protocol banner ── */}
      <div
        className="card"
        style={{ background: 'linear-gradient(135deg, #D32F2F, #b71c1c)', color: 'white', cursor: 'pointer', marginBottom: 16 }}
        onClick={() => navigate('/evacuation')}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
              🔥 Evacuation Protocol
            </div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Step-by-step emergency evacuation guide</div>
          </div>
          <ChevronRight size={24} color="rgba(255,255,255,0.8)" />
        </div>
      </div>

      {/* ── Vehicle notes — from config, safety-critical ── */}
      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 20 }}>🔑</div>
        <div className="alert-content">
          <div className="alert-title">Truck Keys Location</div>
          <div className="alert-body">
            <strong>{vehicleNotes.keysLocation}</strong>. {vehicleNotes.trailerStatus}.
          </div>
        </div>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: 24, color: 'var(--slate-grey)' }}>
          Loading contacts...
        </div>
      )}

      {/* ── Contact groups — from Appwrite contacts_edit ── */}
      {!loading && groups.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 24, color: 'var(--slate-grey)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📞</div>
          <div>No contacts found. Ask the owner to add contacts in the Admin Panel.</div>
        </div>
      )}

      {!loading && groups.map(group => (
        <div key={group.category} className="card" style={{ marginBottom: 12 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>{group.title}</div>
          {group.items.map(contact => (
            <div key={contact.$id} className="phone-link">
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-role">{contact.role}</div>
                {contact.address && (
                  <div className="contact-note" style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 3 }}>
                    <MapPin size={11} style={{ flexShrink: 0, marginTop: 2 }} />
                    {contact.address}
                  </div>
                )}
                {contact.note && (
                  <div className="contact-note">{contact.note}</div>
                )}
              </div>
              {/* Use display for label, phone for the tel: link */}
              <a
                href={`tel:+1${contact.phone}`}
                className="call-btn"
                onClick={e => e.stopPropagation()}
              >
                <Phone size={14} /> {contact.display || contact.phone}
              </a>
            </div>
          ))}
        </div>
      ))}

      {/* ── 911 reminder ── */}
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
