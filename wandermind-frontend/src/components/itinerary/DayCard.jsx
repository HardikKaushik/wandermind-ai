import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Cloud, Bus, Shirt } from 'lucide-react'
import HotelCard from './HotelCard'
import ActivityCard from './ActivityCard'
import MealCard from './MealCard'

export default function DayCard({ day, destination, isActive, onToggle, onQuickEdit }) {
  const activities = day.activities || []
  const meals = day.meals || []
  const morningActs = activities.filter((a) => a.time_slot === 'morning')
  const afternoonActs = activities.filter((a) => a.time_slot === 'afternoon')
  const eveningActs = activities.filter((a) => a.time_slot === 'evening' || a.time_slot === 'night')

  return (
    <motion.div
      layout
      className="glass rounded-xl overflow-hidden"
    >
      {/* Day header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700
                          flex items-center justify-center font-display font-bold text-sm">
            {day.day}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">Day {day.day}</h3>
            <p className="text-xs text-gray-700">{day.theme}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {day.day_total_inr && (
            <span className="font-mono text-sm text-green-700">
              &#8377;{day.day_total_inr.toLocaleString('en-IN')}
            </span>
          )}
          {isActive ? <ChevronUp size={16} className="text-gray-700" /> : <ChevronDown size={16} className="text-gray-700" />}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Weather + morning brief */}
              {(day.weather_note || day.morning_brief) && (
                <div className="flex flex-wrap gap-2">
                  {day.weather_note && (
                    <span className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600">
                      <Cloud size={10} /> {day.weather_note}
                    </span>
                  )}
                  {day.packing_tip && (
                    <span className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400">
                      <Shirt size={10} /> {day.packing_tip}
                    </span>
                  )}
                </div>
              )}

              {day.morning_brief && (
                <p className="text-xs text-gray-700 italic">{day.morning_brief}</p>
              )}

              {/* Hotel */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Accommodation
                </h4>
                <HotelCard
                  hotel={day.hotel}
                  destination={destination}
                  onEdit={() => onQuickEdit?.(day.day, 'hotel')}
                />
              </div>

              {/* Activities by time slot */}
              {morningActs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                    🌅 Morning
                  </h4>
                  <div className="space-y-2">
                    {morningActs.map((act, i) => (
                      <ActivityCard
                        key={i}
                        activity={act}
                        onEdit={() => onQuickEdit?.(day.day, 'activities')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {afternoonActs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                    ☀️ Afternoon
                  </h4>
                  <div className="space-y-2">
                    {afternoonActs.map((act, i) => (
                      <ActivityCard
                        key={i}
                        activity={act}
                        onEdit={() => onQuickEdit?.(day.day, 'activities')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {eveningActs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                    🌇 Evening
                  </h4>
                  <div className="space-y-2">
                    {eveningActs.map((act, i) => (
                      <ActivityCard
                        key={i}
                        activity={act}
                        onEdit={() => onQuickEdit?.(day.day, 'activities')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Meals */}
              {meals.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Food & Dining
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {meals.map((meal, i) => (
                      <MealCard
                        key={i}
                        meal={meal}
                        destination={destination}
                        onEdit={() => onQuickEdit?.(day.day, 'meals')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Transport */}
              {day.transport && day.transport.mode && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-xs">
                  <Bus size={14} className="text-gray-700" />
                  <div className="flex-1">
                    <span className="font-semibold">{day.transport.mode}</span>
                    {day.transport.details && (
                      <span className="text-gray-700 ml-1">— {day.transport.details}</span>
                    )}
                  </div>
                  <span className="font-mono text-green-700">
                    &#8377;{day.transport.cost_inr?.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => onQuickEdit?.(day.day, 'transport')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    &#9998;
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
