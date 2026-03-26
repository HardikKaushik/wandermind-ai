import { motion } from 'framer-motion'
import { Clock, IndianRupee, MapPin, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { useState } from 'react'
import PhotoCard from '../shared/PhotoCard'
import RatingBadge from '../shared/RatingBadge'

const TIME_COLORS = {
  morning: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  afternoon: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  evening: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  night: 'from-indigo-500/20 to-blue-800/20 border-indigo-500/30',
}

const TIME_ICONS = {
  morning: '🌅', afternoon: '☀️', evening: '🌇', night: '🌙',
}

const TYPE_BADGES = {
  temple: { color: 'bg-amber-500/20 text-amber-400', icon: '🛕' },
  beach: { color: 'bg-cyan-500/20 text-cyan-400', icon: '🏖️' },
  museum: { color: 'bg-purple-500/20 text-purple-400', icon: '🏛️' },
  adventure: { color: 'bg-red-500/20 text-red-600', icon: '🧗' },
  food: { color: 'bg-green-100 text-green-700', icon: '🍽️' },
  shopping: { color: 'bg-pink-500/20 text-pink-400', icon: '🛍️' },
  nature: { color: 'bg-emerald-500/20 text-emerald-400', icon: '🌿' },
  nightlife: { color: 'bg-violet-500/20 text-violet-400', icon: '🎵' },
}

export default function ActivityCard({ activity, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const timeColor = TIME_COLORS[activity.time_slot] || TIME_COLORS.morning
  const typeBadge = TYPE_BADGES[activity.type] || { color: 'bg-gray-100 text-gray-700', icon: '📍' }

  return (
    <motion.div
      layout
      className={`glass rounded-xl overflow-hidden border bg-gradient-to-br ${timeColor}`}
    >
      {/* Photo */}
      {activity.photo_url && (
        <PhotoCard
          src={activity.photo_url}
          alt={activity.name}
          className="h-32"
          mapsQuery={activity.maps_query || activity.name}
        />
      )}

      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{TIME_ICONS[activity.time_slot]}</span>
              <span className="text-xs uppercase tracking-wider text-gray-700 font-semibold">
                {activity.time_slot}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${typeBadge.color}`}>
                {typeBadge.icon} {activity.type}
              </span>
            </div>
            <h4 className="font-semibold text-sm truncate">{activity.name}</h4>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono text-green-700 text-sm font-semibold">
              &#8377;{activity.cost_inr?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Rating + duration */}
        <div className="flex items-center gap-3">
          <RatingBadge rating={activity.rating} reviews={activity.review_count} />
          <span className="flex items-center gap-1 text-xs text-gray-700">
            <Clock size={10} /> {activity.duration_hours}h
          </span>
          {activity.accessibility && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activity.accessibility === 'easy' ? 'bg-green-100 text-green-700' :
              activity.accessibility === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-600'
            }`}>
              {activity.accessibility}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-700 line-clamp-2">{activity.description}</p>

        {/* Best for */}
        {activity.best_for && activity.best_for.length > 0 && (
          <div className="flex items-center gap-1">
            <Users size={10} className="text-gray-700" />
            {activity.best_for.map((b, i) => (
              <span key={i} className="text-xs text-gray-700">{b}{i < activity.best_for.length - 1 ? ',' : ''}</span>
            ))}
          </div>
        )}

        {/* Expandable: insider tip */}
        {activity.insider_tip && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              Insider tip
            </button>
            {expanded && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="text-sm text-amber-800 mt-1 pl-3 border-l border-amber-500/30"
              >
                {activity.insider_tip}
              </motion.p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {activity.maps_query && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.maps_query)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-300"
            >
              <MapPin size={10} /> Maps
            </a>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              &#9998; Change
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
