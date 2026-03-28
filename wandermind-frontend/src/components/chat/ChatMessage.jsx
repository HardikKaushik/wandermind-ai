import { motion } from 'framer-motion'
import { MapPin, Clock, IndianRupee } from 'lucide-react'
import PhotoCard from '../shared/PhotoCard'
import RatingBadge from '../shared/RatingBadge'

export default function ChatMessage({ message, onViewItinerary }) {
  const isUser = message.role === 'user'
  const itinerary = message.itinerary_snapshot

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-900 dark:bg-slate-700 text-white'
        }`}
      >
        {isUser ? 'U' : 'W'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md'
            : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-2xl rounded-tl-md'
        } px-4 py-3`}
      >
        {/* Text content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>

        {/* Change summary badge */}
        {message.change_summary && (
          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 w-fit">
            <span className="text-green-700 dark:text-green-400 text-xs font-bold">Updated: {message.change_summary}</span>
          </div>
        )}

        {/* Itinerary preview in chat bubble */}
        {itinerary && itinerary.days && (
          <div className="mt-3 space-y-3">
            {/* Summary strip */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-xs">
              <span className="font-extrabold text-blue-700 dark:text-blue-400">
                {itinerary.total_days} days
              </span>
              <span className="text-gray-700 dark:text-slate-400">|</span>
              <span className="font-bold text-gray-700 dark:text-slate-300">{itinerary.destination}</span>
              <span className="text-gray-700 dark:text-slate-400">|</span>
              <span className="font-mono font-bold text-green-700 dark:text-green-400">
                INR {itinerary.budget?.total_inr?.toLocaleString('en-IN') || '—'}
              </span>
            </div>

            {/* Horizontal scroll day previews */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {itinerary.days.slice(0, 5).map((day) => (
                <div
                  key={day.day}
                  className="flex-shrink-0 w-40 rounded-lg overflow-hidden bg-white dark:bg-slate-700
                             border border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onViewItinerary?.(day.day)}
                >
                  <PhotoCard
                    src={day.hotel?.photo_url || day.activities?.[0]?.photo_url}
                    alt={day.theme}
                    className="h-20"
                  />
                  <div className="p-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold">
                      Day {day.day}
                    </p>
                    <p className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">{day.theme}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* View full itinerary button */}
            <button
              onClick={() => onViewItinerary?.()}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors
                         flex items-center gap-1"
            >
              View full itinerary &rarr;
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
