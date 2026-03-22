import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wheat, Heart, Wrench, AlertTriangle, BookOpen, FileText } from 'lucide-react'
import { useUser } from '../context/UserContext'

export default function Layout() {
  const navigate = useNavigate()
  const { currentUser, clearUser } = useUser()

  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-logo">
          <div className="brand-mark">RLR</div>
          <div className="brand-text">
            <span className="ranch-name">Reba Love Ranch</span>
            <button
              onClick={clearUser}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 10, color: 'var(--slate-grey)', fontFamily: 'var(--font-heading)',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: 0, textAlign: 'left',
              }}
            >
              {currentUser?.emoji} {currentUser?.name} · Switch
            </button>
          </div>
        </div>
        <button
          className="header-emergency-btn"
          onClick={() => navigate('/emergency')}
        >
          <AlertTriangle size={13} />
          SOS
        </button>
      </header>

      {/* Page Content */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard />
          <span>Today</span>
        </NavLink>
        <NavLink to="/feed" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wheat />
          <span>Feed</span>
        </NavLink>
        <NavLink to="/care" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Heart />
          <span>Care</span>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wrench />
          <span>Tasks</span>
        </NavLink>
        <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText />
          <span>Notes</span>
        </NavLink>
        <NavLink to="/animals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen />
          <span>Animals</span>
        </NavLink>
      </nav>
    </div>
  )
}
