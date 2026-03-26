import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Planner from './pages/Planner'
import SharedTrip from './pages/SharedTrip'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/planner" element={<Planner />} />
      <Route path="/shared/:token" element={<SharedTrip />} />
    </Routes>
  )
}
