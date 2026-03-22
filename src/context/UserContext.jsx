import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext(null)

export const USERS = [
  { id: 'owner', name: 'Karen (Owner)', emoji: '🤠', color: 'var(--forest-green)' },
  { id: 'sitter1', name: 'Ranch Sitter', emoji: '🐴', color: 'var(--sky-blue)' },
  { id: 'sitter2', name: 'Guest Sitter', emoji: '🌾', color: 'var(--warning)' },
]

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rlr_current_user')
    return saved ? JSON.parse(saved) : null
  })

  const selectUser = (user) => {
    setCurrentUser(user)
    localStorage.setItem('rlr_current_user', JSON.stringify(user))
  }

  const clearUser = () => {
    setCurrentUser(null)
    localStorage.removeItem('rlr_current_user')
  }

  return (
    <UserContext.Provider value={{ currentUser, selectUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}

// Full-screen user picker shown on first open
export function UserPicker() {
  const { selectUser } = useUser()

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--warm-beige)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72,
          background: 'var(--sky-blue)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 4px 16px rgba(74,144,226,0.35)',
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'white' }}>RLR</span>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--charcoal)', marginBottom: 6 }}>
          Reba Love Ranch
        </div>
        <div style={{ fontSize: 14, color: 'var(--slate-grey)', fontWeight: 600 }}>
          Who's checking in today?
        </div>
      </div>

      {/* User cards */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {USERS.map(user => (
          <button
            key={user.id}
            onClick={() => selectUser(user)}
            style={{
              background: 'white',
              border: `2px solid var(--warm-beige-dark)`,
              borderRadius: 16,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textAlign: 'left',
              width: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = user.color
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'var(--warm-beige-dark)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{
              width: 52, height: 52,
              background: `${user.color}18`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
              border: `2px solid ${user.color}30`,
            }}>
              {user.emoji}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--charcoal)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--slate-grey)', marginTop: 2 }}>
                {user.id === 'owner' ? 'Full access — owner view' : 'Sitter daily checklist view'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', color: 'var(--slate-grey)', fontSize: 20 }}>›</div>
          </button>
        ))}
      </div>

      {/* Ranch illustration */}
      <div style={{ fontSize: 36, opacity: 0.4 }}>🐴🐔🐕🌾</div>
      <div style={{ fontSize: 11, color: 'var(--slate-grey)', marginTop: 12, textAlign: 'center', opacity: 0.7 }}>
        Sierra Nevada Foothills · Ranch Sitter App
      </div>
    </div>
  )
}
