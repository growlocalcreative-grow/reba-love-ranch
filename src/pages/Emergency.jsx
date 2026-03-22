import { Phone, MapPin, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CONTACTS = [
  {
    category: 'vets',
    title: '🏥 Veterinary',
    items: [
      { name: 'Loomis Basin Equine Medical', role: 'Equine Vet', phone: '9166527645', display: '(916) 652-7645', note: 'Primary equine care — Luke, Snowy, Shadow' },
      { name: 'Dr. De La Cruz', role: 'Equine Vet', phone: '9166527645', display: '(916) 652-7645', note: 'Same clinic as above' },
      { name: 'Cool Veterinary Hospital', role: 'Dogs & Cats Vet', phone: '5306861949', display: '(530) 686-1949', note: 'For dogs and cats' },
    ]
  },
  {
    category: 'owner',
    title: '👨‍👩‍👧 Owner & Family',
    items: [
      { name: 'Renee Gaw', role: "Karen's Daughter", phone: '9168694142', display: '(916) 869-4142', note: 'Contact for owner family emergencies' },
    ]
  },
  {
    category: 'neighbors',
    title: '🏡 Neighbors & Help',
    items: [
      { name: 'Peggy', role: 'Neighbor', phone: '7073375164', display: '(707) 337-5164', note: 'Call for help loading equines during evacuation' },
    ]
  },
  {
    category: 'evacuation',
    title: '🚨 Evacuation Locations',
    items: [
      { name: 'Cheri Burnett', role: 'Evacuation Host', phone: '9168355340', display: '(916) 835-5340', address: '8241 El Modena Ave, Elverta, CA 95626', note: "Chris (husband): (916) 765-1359 · Call first before loading up" },
      { name: 'Elverta Stables — Vadim', role: 'Evacuation Boarding', phone: '9163651198', display: '(916) 365-1198', address: '7751 Sorento Rd, Elverta, CA 95842', note: 'Call first' },
    ]
  }
]

export default function Emergency() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="page-title" style={{ color: 'var(--danger)' }}>🚨 Emergency</div>
      <div className="page-subtitle">Contacts &amp; urgent procedures</div>

      {/* Evacuation banner */}
      <div
        className="card"
        style={{ background: 'linear-gradient(135deg, #D32F2F, #b71c1c)', color: 'white', cursor: 'pointer', marginBottom: 16 }}
        onClick={() => navigate('/evacuation')}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🔥 Evacuation Protocol</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Step-by-step emergency evacuation guide</div>
          </div>
          <ChevronRight size={24} color="rgba(255,255,255,0.8)" />
        </div>
      </div>

      {/* Truck keys reminder */}
      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 20 }}>🔑</div>
        <div className="alert-content">
          <div className="alert-title">Truck Keys Location</div>
          <div className="alert-body">Keys are in the <strong>dish on the coat rack by the back door</strong>. Trailer is already hitched and ready.</div>
        </div>
      </div>

      {CONTACTS.map(group => (
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
                <Phone size={14} />
                Call
              </a>
            </div>
          ))}
        </div>
      ))}

      {/* 911 reminder */}
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
