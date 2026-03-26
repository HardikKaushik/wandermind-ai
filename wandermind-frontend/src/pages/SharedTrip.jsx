import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, MessageCircle } from 'lucide-react'
import { tripApi } from '../api/chatApi'
import RatingBadge from '../components/shared/RatingBadge'
import LoadingState from '../components/shared/LoadingState'

export default function SharedTrip() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    tripApi.getShared(token)
      .then((res) => setData(res.data))
      .catch(() => setError('Trip not found or link expired'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <LoadingState text="Loading shared trip..." />
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-700 mb-4">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          Go to WanderMind
        </Link>
      </div>
    )
  }

  const itinerary = data?.itinerary
  if (!itinerary) return null

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-white">
          <ArrowLeft size={16} />
          <span className="text-2xl">🌍</span>
          <span className="font-display font-bold text-sm gradient-text">WanderMind</span>
        </Link>
        <Link
          to="/planner"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
        >
          Plan Your Own Trip
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold gradient-text mb-2">
            {itinerary.destination}
          </h1>
          <p className="text-gray-700">
            {itinerary.total_days} Days · &#8377;{itinerary.budget?.total_inr?.toLocaleString('en-IN')}
          </p>
          {itinerary.summary && (
            <p className="text-sm text-gray-700 mt-2 max-w-xl mx-auto">{itinerary.summary}</p>
          )}
        </div>

        {itinerary.days?.map((day) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: day.day * 0.1 }}
            className="glass rounded-xl p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700
                              flex items-center justify-center font-display font-bold">
                {day.day}
              </div>
              <div>
                <h3 className="font-semibold">Day {day.day}: {day.theme}</h3>
                {day.weather_note && (
                  <p className="text-xs text-gray-700">{day.weather_note}</p>
                )}
              </div>
              <span className="ml-auto font-mono text-green-700 text-sm">
                &#8377;{day.day_total_inr?.toLocaleString('en-IN')}
              </span>
            </div>

            {day.hotel?.name && (
              <div className="flex gap-3 p-3 rounded-lg bg-white/[0.03]">
                {day.hotel.photo_url && (
                  <img src={day.hotel.photo_url} alt={day.hotel.name}
                       className="w-20 h-16 rounded-lg object-cover" />
                )}
                <div>
                  <p className="font-semibold text-sm">{day.hotel.name}</p>
                  <RatingBadge rating={day.hotel.rating} />
                  <p className="font-mono text-xs text-green-700">
                    &#8377;{day.hotel.price_per_night_inr?.toLocaleString('en-IN')}/night
                  </p>
                </div>
              </div>
            )}

            {day.activities?.map((act, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-xs uppercase text-gray-700 w-16 flex-shrink-0 pt-0.5">
                  {act.time_slot}
                </span>
                <div>
                  <p className="font-semibold text-xs">{act.name}</p>
                  <p className="text-xs text-gray-700">{act.description}</p>
                </div>
                <span className="ml-auto font-mono text-xs text-green-700 flex-shrink-0">
                  &#8377;{act.cost_inr?.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
