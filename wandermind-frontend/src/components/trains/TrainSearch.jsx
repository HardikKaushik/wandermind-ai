import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import api from '../../api/axiosInstance'

const CLASS_COLORS = {
  '1A': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  '2A': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  '3A': { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-200' },
  'SL': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'CC': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'EC': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'GN': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
}

const TRAIN_TYPE_BADGE = {
  'Rajdhani': { bg: 'bg-red-100', text: 'text-red-700' },
  'Shatabdi': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Vande Bharat': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Duronto': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Garib Rath': { bg: 'bg-green-100', text: 'text-green-700' },
  'Superfast': { bg: 'bg-sky-50', text: 'text-sky-700' },
  'Mail/Express': { bg: 'bg-gray-100', text: 'text-gray-700' },
}

function buildBookingUrls(train, date, selectedClass) {
  const from = train.from_station?.code || ''
  const to = train.to_station?.code || ''
  const fromName = encodeURIComponent(train.from_station?.name || from)
  const toName = encodeURIComponent(train.to_station?.name || to)
  const tNum = train.train_number || ''
  const parts = (date || '').split('-')
  const dateDMY = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ''
  const dateCompact = parts.join('')
  const cls = selectedClass || '3A'

  return {
    irctc: `https://www.irctc.co.in/nget/train-search`,
    confirmtkt: `https://www.confirmtkt.com/train-running-status/${tNum}`,
    railyatri: `https://www.railyatri.in/booking/search?from=${fromName}&to=${toName}&date=${date || ''}&class=${cls}&adults=1`,
    trainman: `https://www.trainman.in/trains/${from}/${to}`,
    makemytrip: `https://www.makemytrip.com/railways/listing/?fromCity=${from}&toCity=${to}&travelDate=${date || ''}&className=${cls}&trainNo=${tNum}`,
    paytm: `https://tickets.paytm.com/trains/searchResult/${from}/${to}/${date || ''}`,
  }
}

export default function TrainSearch({ destination }) {
  const [fromQuery, setFromQuery] = useState('')
  const [toQuery, setToQuery] = useState(destination || '')
  const [fromStations, setFromStations] = useState([])
  const [toStations, setToStations] = useState([])
  const [selectedFrom, setSelectedFrom] = useState(null)
  const [selectedTo, setSelectedTo] = useState(null)
  const [date, setDate] = useState('')
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedTrain, setExpandedTrain] = useState(null)
  const [stats, setStats] = useState(null)
  const [sortBy, setSortBy] = useState('price')
  const [filterType, setFilterType] = useState('all')
  const [showFromDrop, setShowFromDrop] = useState(false)
  const [showToDrop, setShowToDrop] = useState(false)

  // Debounced station search
  const searchStations = useCallback(
    (() => {
      let timer = null
      return (query, setter, showSetter) => {
        clearTimeout(timer)
        if (query.length < 2) { setter([]); showSetter(false); return }
        timer = setTimeout(async () => {
          try {
            const res = await api.get(`/transport/stations/?q=${encodeURIComponent(query)}`)
            setter(res.data.stations || [])
            showSetter(true)
          } catch { setter([]) }
        }, 300)
      }
    })(), []
  )

  useEffect(() => { searchStations(fromQuery, setFromStations, setShowFromDrop) }, [fromQuery])
  useEffect(() => { searchStations(toQuery, setToStations, setShowToDrop) }, [toQuery])

  useEffect(() => {
    if (destination && !selectedTo) {
      searchStations(destination, setToStations, setShowToDrop)
    }
  }, [destination])

  const handleSearch = async () => {
    if (!selectedFrom || !selectedTo || !date) {
      setError('Please select origin station, destination station, and travel date.')
      return
    }
    setLoading(true); setError(null); setTrains([]); setStats(null)
    try {
      const res = await api.get(`/transport/trains/?from=${selectedFrom.code}&to=${selectedTo.code}&date=${date}`)
      setTrains(res.data.trains || [])
      setStats({
        total: res.data.total_results,
        cheapest: res.data.cheapest_formatted,
        fastest: res.data.fastest_duration,
      })
    } catch { setError('Failed to search trains.') }
    finally { setLoading(false) }
  }

  // Sort & filter
  const filteredTrains = [...trains]
    .filter(t => {
      if (filterType === 'all') return true
      return t.train_type === filterType
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.cheapest_price - b.cheapest_price
      if (sortBy === 'duration') return a.duration_minutes - b.duration_minutes
      if (sortBy === 'departure') return a.departure.localeCompare(b.departure)
      return 0
    })

  const trainTypes = [...new Set(trains.map(t => t.train_type))]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Search Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          🚂
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-slate-100">Search Trains</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* From Station */}
          <div className="relative">
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">From Station</label>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 dark:focus-within:ring-green-900/30">
              📍
              <input
                type="text"
                value={selectedFrom ? `${selectedFrom.name} (${selectedFrom.code})` : fromQuery}
                onChange={(e) => { setFromQuery(e.target.value); setSelectedFrom(null) }}
                onFocus={() => fromQuery.length >= 2 && setShowFromDrop(true)}
                placeholder="City or station code..."
                className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-slate-100 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              {selectedFrom && (
                <button onClick={() => { setSelectedFrom(null); setFromQuery('') }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              )}
            </div>
            <AnimatePresence>
              {showFromDrop && fromStations.length > 0 && !selectedFrom && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {fromStations.map((s, i) => (
                    <button key={i} onClick={() => { setSelectedFrom(s); setShowFromDrop(false); setFromQuery(s.name) }}
                      className="w-full text-left px-4 py-2.5 hover:bg-green-50 dark:hover:bg-slate-700 text-sm flex items-center gap-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                      <span className="font-mono font-bold text-green-700 text-xs">{s.code}</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-100">{s.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* To Station */}
          <div className="relative">
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">To Station</label>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 dark:focus-within:ring-green-900/30">
              🚂
              <input
                type="text"
                value={selectedTo ? `${selectedTo.name} (${selectedTo.code})` : toQuery}
                onChange={(e) => { setToQuery(e.target.value); setSelectedTo(null) }}
                onFocus={() => toQuery.length >= 2 && setShowToDrop(true)}
                placeholder="City or station code..."
                className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-slate-100 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              {selectedTo && (
                <button onClick={() => { setSelectedTo(null); setToQuery('') }} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              )}
            </div>
            <AnimatePresence>
              {showToDrop && toStations.length > 0 && !selectedTo && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {toStations.map((s, i) => (
                    <button key={i} onClick={() => { setSelectedTo(s); setShowToDrop(false); setToQuery(s.name) }}
                      className="w-full text-left px-4 py-2.5 hover:bg-green-50 dark:hover:bg-slate-700 text-sm flex items-center gap-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
                      <span className="font-mono font-bold text-green-700 text-xs">{s.code}</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-100">{s.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">Travel Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={handleSearch} disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl py-2.5 px-6 flex items-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : '🔍'}
              {loading ? 'Searching...' : 'Search Trains'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Results */}
      {trains.length > 0 && (
        <>
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2 flex items-center gap-2">
              💰
              <span className="text-sm font-bold text-green-800 dark:text-green-400">Cheapest: {stats?.cheapest}</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2 flex items-center gap-2">
              ⚡
              <span className="text-sm font-bold text-blue-800 dark:text-blue-400">Fastest: {stats?.fastest}</span>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2">
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{stats?.total} trains found</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Type:</span>
            <button onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterType === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
              All ({trains.length})
            </button>
            {trainTypes.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterType === t ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                {t}
              </button>
            ))}

            <span className="ml-3 text-xs font-bold text-gray-500 uppercase">Sort:</span>
            {[{ v: 'price', l: '💰 Cheapest' }, { v: 'duration', l: '⚡ Fastest' }, { v: 'departure', l: '🕐 Earliest' }].map(s => (
              <button key={s.v} onClick={() => setSortBy(s.v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${sortBy === s.v ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                {s.l}
              </button>
            ))}
          </div>

          {/* Train Cards */}
          <div className="space-y-3">
            {filteredTrains.map((train, idx) => (
              <TrainCard key={idx} train={train} date={date}
                isExpanded={expandedTrain === idx}
                onToggle={() => setExpandedTrain(expandedTrain === idx ? null : idx)}
                isCheapest={idx === 0 && sortBy === 'price'} />
            ))}
          </div>
        </>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 size={32} className="animate-spin text-green-600" />
          <p className="text-sm font-bold text-gray-700 dark:text-slate-300">Searching trains...</p>
        </div>
      )}
    </motion.div>
  )
}


function TrainCard({ train, date, isExpanded, onToggle, isCheapest }) {
  const [selectedClass, setSelectedClass] = useState(null)
  const urls = buildBookingUrls(train, date, selectedClass)
  const badge = TRAIN_TYPE_BADGE[train.train_type] || { bg: 'bg-gray-100', text: 'text-gray-700' }

  return (
    <motion.div layout
      className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden transition-all ${
        isExpanded ? 'border-green-300 dark:border-green-600 shadow-md ring-1 ring-green-100 dark:ring-green-900/30' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm'
      }`}>
      <button onClick={onToggle} className="w-full text-left p-3">
        <div className="flex items-center gap-3">
          {/* Train info */}
          <div className="min-w-0 flex-shrink-0" style={{ width: 90 }}>
            <p className="text-xs font-extrabold text-gray-900 dark:text-slate-100 truncate">{train.train_name?.split(' ').slice(-2).join(' ')}</p>
            <p className="text-[10px] text-gray-500 font-mono">{train.train_number}</p>
            <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded font-bold mt-0.5 ${badge.bg} ${badge.text}`}>
              {train.train_type}
            </span>
          </div>

          {/* Departure */}
          <div className="text-center flex-shrink-0">
            <p className="text-sm font-extrabold text-gray-900 dark:text-slate-100">{train.departure}</p>
            <p className="text-[10px] text-gray-500">{train.from_station?.code}</p>
          </div>

          {/* Route */}
          <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[50px]">
            <span className="text-[10px] font-bold text-gray-500">{train.duration}</span>
            <div className="w-full flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
              <div className="flex-1 h-[2px] bg-gray-300 mx-0.5" />
              🚂
            </div>
            <span className="text-[9px] text-gray-400">{train.arrival_day}</span>
          </div>

          {/* Arrival */}
          <div className="text-center flex-shrink-0">
            <p className="text-sm font-extrabold text-gray-900 dark:text-slate-100">{train.arrival}</p>
            <p className="text-[10px] text-gray-500">{train.to_station?.code}</p>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right">
            {isCheapest && <span className="text-[8px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-bold">✓ BEST</span>}
            <p className="text-sm font-extrabold text-green-700">₹{train.cheapest_price?.toLocaleString('en-IN')}</p>
            <p className="text-[9px] text-gray-400">onwards</p>
          </div>
        </div>
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700 space-y-3">
              {/* Run days */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase">Runs on:</span>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <span key={d} className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    train.run_days?.includes(d) ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-300'
                  }`}>{d}</span>
                ))}
                {train.pantry && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold ml-1">🍱 Pantry</span>}
              </div>

              {/* Class-wise prices */}
              <div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase mb-2">Select Class & Check Availability:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {train.classes?.map((cls, ci) => {
                    const c = CLASS_COLORS[cls.class_code] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
                    const isSelected = selectedClass === cls.class_code
                    return (
                      <button key={ci} onClick={() => setSelectedClass(isSelected ? null : cls.class_code)}
                        className={`relative rounded-xl p-2.5 border text-left transition-all ${
                          isSelected ? `${c.bg} ${c.border} ring-2 ring-offset-1 ring-green-400` : `bg-white ${c.border} hover:${c.bg}`
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-extrabold ${c.text}`}>{cls.class_code}</span>
                          {isSelected && <span>✅</span>}
                        </div>
                        <p className="text-[10px] text-gray-600 font-medium">{cls.class_name}</p>
                        <p className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mt-0.5">₹{cls.price_inr?.toLocaleString('en-IN')}</p>
                        <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded font-bold mt-1 ${
                          cls.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {cls.availability}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Booking buttons */}
              <div>
                <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase mb-2">Book on:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <a href={urls.irctc} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center rounded-xl py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                    <span className="text-[10px] font-bold opacity-80">IRCTC</span>
                    <span className="text-xs font-extrabold">Official</span>
                  </a>
                  <a href={urls.confirmtkt} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center rounded-xl py-2.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-colors">
                    <span className="text-[10px] font-bold">ConfirmTkt</span>
                    <span className="text-xs font-extrabold">Status</span>
                  </a>
                  <a href={urls.railyatri} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center rounded-xl py-2.5 px-3 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 transition-colors">
                    <span className="text-[10px] font-bold">RailYatri</span>
                    <span className="text-xs font-extrabold">Book</span>
                  </a>
                  <a href={urls.trainman} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center rounded-xl py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors">
                    <span className="text-[10px] font-bold">Trainman</span>
                    <span className="text-xs font-extrabold">Schedule</span>
                  </a>
                  <a href={urls.makemytrip} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center rounded-xl py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 transition-colors">
                    <span className="text-[10px] font-bold">MakeMyTrip</span>
                    <span className="text-xs font-extrabold">Trains</span>
                  </a>
                  <a href={urls.paytm} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center rounded-xl py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition-colors">
                    <span className="text-[10px] font-bold">Paytm</span>
                    <span className="text-xs font-extrabold">Book</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
