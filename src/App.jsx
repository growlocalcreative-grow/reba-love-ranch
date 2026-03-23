import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginScreen from './pages/LoginScreen'
import Dashboard from './pages/Dashboard'
import FeedSchedule from './pages/FeedSchedule'
import DailyCare from './pages/DailyCare'
import PropertyTasks from './pages/PropertyTasks'
import Animals from './pages/Animals'
import Emergency from './pages/Emergency'
import ManureLog from './pages/ManureLog'
import HealthRecords from './pages/HealthRecords'
import Notes from './pages/Notes'
import Evacuation from './pages/Evacuation'
import AdminPanel from './pages/AdminPanel'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', background: 'var(--warm-beige)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{ width: 64, height: 64, background: 'var(--sky-blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: 'white' }}>RLR</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: 'var(--slate-grey)' }}>Loading ranch...</div>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="feed" element={<FeedSchedule />} />
          <Route path="care" element={<DailyCare />} />
          <Route path="tasks" element={<PropertyTasks />} />
          <Route path="animals" element={<Animals />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="manure" element={<ManureLog />} />
          <Route path="health" element={<HealthRecords />} />
          <Route path="notes" element={<Notes />} />
          <Route path="evacuation" element={<Evacuation />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
