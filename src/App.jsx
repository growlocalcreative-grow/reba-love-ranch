import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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

export default function App() {
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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
