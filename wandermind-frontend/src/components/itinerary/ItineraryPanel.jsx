import { useState } from 'react'
import { motion } from 'framer-motion'
import { Map, AlertTriangle } from 'lucide-react'
import { useTripStore } from '../../store/tripStore'
import DayCard from './DayCard'

export default function ItineraryPanel({ onQuickEdit }) {
  const itinerary = useTripStore((s) => s.itinerary)
  const activeDay = useTripStore((s) => s.activeDay)
  const setActiveDay = useTripStore((s) => s.setActiveDay)
  const [expandedDay, setExpandedDay] = useState(null)

  if (!itinerary || !itinerary.days) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
        <Map size={48} className="text-gray-700 mb-4" />
        <h3 className="font-display text-lg font-semibold text-gray-700 mb-2">
          Your Itinerary
        </h3>
        <p className="text-sm text-gray-700 max-w-xs">
          Start chatting to create your travel plan. Your day-by-day itinerary
          will appear here with hotels, activities, and more.
        </p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {/* Trip header */}
      <div className="text-center mb-4">
        <h2 className="font-display text-xl font-bold gradient-text">
          {itinerary.destination}
        </h2>
        <p className="text-xs text-gray-700 mt-1">{itinerary.summary}</p>
        {itinerary.travel_style && (
          <div className="flex justify-center gap-1.5 mt-2">
            {itinerary.travel_style.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-600/10
                                       text-blue-600 border border-blue-600/20">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Festival alerts */}
      {itinerary.festivals_events && itinerary.festivals_events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-3 border border-amber-500/30 bg-amber-500/5"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🎉</span>
            <span className="text-xs font-semibold text-amber-700">Festival Alert!</span>
          </div>
          {itinerary.festivals_events.map((f, i) => (
            <p key={i} className="text-sm text-gray-700">
              <span className="font-semibold">{f.name}</span>
              {f.date && <span className="text-gray-700"> — {f.date}</span>}
              {f.note && <span className="text-gray-700"> · {f.note}</span>}
            </p>
          ))}
        </motion.div>
      )}

      {/* Day nav pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {itinerary.days.map((day) => (
          <button
            key={day.day}
            onClick={() => {
              setActiveDay(day.day)
              setExpandedDay(expandedDay === day.day ? null : day.day)
            }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeDay === day.day
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Day {day.day}
          </button>
        ))}
      </div>

      {/* Day cards */}
      <div className="space-y-2">
        {itinerary.days.map((day, i) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <DayCard
              day={day}
              destination={itinerary.destination}
              isActive={expandedDay === day.day || (expandedDay === null && activeDay === day.day)}
              onToggle={() =>
                setExpandedDay(expandedDay === day.day ? null : day.day)
              }
              onQuickEdit={onQuickEdit}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
