import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wheat, Heart, Wrench, AlertTriangle, BookOpen, FileText } from 'lucide-react'

export default function Layout() {
  const navigate = useNavigate()

  return (
    <div className="app-layout">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-logo">
          <div className="brand-mark">RLR</div>
          <div className="brand-text">
            <span className="ranch-name">Reba Love Ranch</span>
            <span className="ranch-sub">Ranch Sitter App</span>
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
