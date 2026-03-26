import { motion } from 'framer-motion'
import { useTripStore } from '../../store/tripStore'

export default function FestivalAlert() {
  const itinerary = useTripStore((s) => s.itinerary)
  const festivals = itinerary?.festivals_events

  if (!festivals || festivals.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-2 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-blue-600/10
                 border border-amber-500/20"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">🎉</span>
        <div>
          <p className="text-xs font-semibold text-amber-700">
            {festivals[0].name}
          </p>
          <p className="text-xs text-gray-700">
            {festivals[0].date} {festivals[0].note && `— ${festivals[0].note}`}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
