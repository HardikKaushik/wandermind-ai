import { useState } from 'react'
import { motion } from 'framer-motion'
import FlightSearch from '../flights/FlightSearch'
import TrainSearch from '../trains/TrainSearch'

export default function TransportSearch({ destination, travelDate, onClose, initialTab = 'flights' }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-6 px-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl mb-8"
      >
        {/* Header with tabs */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setTab('flights')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === 'flights'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              ✈️ Flights
            </button>
            <button
              onClick={() => setTab('trains')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === 'trains'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              🚂 Trains
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {tab === 'flights' && (
            <FlightSearch destination={destination} travelDate={travelDate} />
          )}
          {tab === 'trains' && (
            <TrainSearch destination={destination} />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
