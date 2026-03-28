import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Planner from './pages/Planner'
import SharedTrip from './pages/SharedTrip'
import { useTripStore } from './store/tripStore'

export default function App() {
  const theme = useTripStore((s) => s.theme)

  // Apply dark class on <html> element and sync on every theme change
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // On mount, immediately apply stored theme to prevent flash
  useEffect(() => {
    const stored = localStorage.getItem('wandermind-theme')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/planner" element={<Planner />} />
      <Route path="/shared/:token" element={<SharedTrip />} />
    </Routes>
  )
}
