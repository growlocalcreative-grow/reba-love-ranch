import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wheat, Heart, Wrench, AlertTriangle, BookOpen, FileText, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { RANCH_CONFIG } from '../data/ranch.config'
import { useState } from 'react'

export default function Layout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const isOwner = user?.email?.toLowerCase() === RANCH_CONFIG.ownerEmail?.toLowerCase()

  const handleLogout = async () => {
    await logout()
    setShowLogout(false)
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Sitter'
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-logo">
          <div className="brand-mark">RLR</div>
          <div className="brand-text">
            <span className="ranch-name">Reba Love Ranch</span>
            <span className="ranch-sub">{isOwner ? '🤠 Owner' : 'Ranch Sitter'}</span>
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowLogout(true)}
            style={{ width: 34, height: 34, borderRadius: '50%', background: isOwner ? 'var(--forest-green)' : 'var(--sky-blue)', color: 'white', border: 'none', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
            title={displayName}
          >
            {initials}
          </button>
          <button className="header-emergency-btn" onClick={() => navigate('/emergency')}>
            <AlertTriangle size={13} /> SOS
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard /><span>Today</span>
        </NavLink>
        <NavLink to="/feed" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wheat /><span>Feed</span>
        </NavLink>
        <NavLink to="/care" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Heart /><span>Care</span>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wrench /><span>Tasks</span>
        </NavLink>
        <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText /><span>Notes</span>
        </NavLink>
        {isOwner ? (
          <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings /><span>Admin</span>
          </NavLink>
        ) : (
          <NavLink to="/animals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BookOpen /><span>Animals</span>
          </NavLink>
        )}
      </nav>

      {/* Logout modal */}
      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: isOwner ? 'var(--forest-green)' : 'var(--sky-blue)', color: 'white', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                {initials}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18 }}>{displayName}</div>
              <div style={{ fontSize: 13, color: 'var(--slate-grey)', marginTop: 4 }}>{user?.email}</div>
              {isOwner && <div style={{ marginTop: 6 }}><span className="badge badge-green">🤠 Owner</span></div>}
            </div>
            <button className="btn btn-danger btn-full" onClick={handleLogout} style={{ marginBottom: 10 }}>
              <LogOut size={16} /> Sign Out
            </button>
            <button className="btn btn-ghost btn-full" onClick={() => setShowLogout(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
