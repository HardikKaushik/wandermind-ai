import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import api from '../../api/axiosInstance'

const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
]

const SORT_OPTIONS = [
  { value: 'price', label: '💰 Cheapest' },
  { value: 'duration', label: '⚡ Fastest' },
  { value: 'departure', label: '🕐 Earliest' },
]

function formatTime(isoStr) {
  if (!isoStr) return '--:--'
  const d = new Date(isoStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function FlightSearch({ destination, travelDate, onClose }) {
  const [originQuery, setOriginQuery] = useState('')
  const [destQuery, setDestQuery] = useState(destination || '')
  const [originAirports, setOriginAirports] = useState([])
  const [destAirports, setDestAirports] = useState([])
  const [selectedOrigin, setSelectedOrigin] = useState(null)
  const [selectedDest, setSelectedDest] = useState(null)
  const [date, setDate] = useState(travelDate || '')
  const [returnDate, setReturnDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [cabinClass, setCabinClass] = useState('economy')
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('price')
  const [filterStops, setFilterStops] = useState('all') // 'all', 'direct', '1stop'
  const [expandedFlight, setExpandedFlight] = useState(null)
  const [stats, setStats] = useState(null)
  const [showOriginDropdown, setShowOriginDropdown] = useState(false)
  const [showDestDropdown, setShowDestDropdown] = useState(false)
  const originRef = useRef(null)
  const destRef = useRef(null)

  // Search airports debounced
  const searchAirportsDebounced = useCallback(
    (() => {
      let timer = null
      return (query, setter, showSetter) => {
        clearTimeout(timer)
        if (query.length < 2) { setter([]); showSetter(false); return }
        timer = setTimeout(async () => {
          try {
            const res = await api.get(`/transport/airports/?q=${encodeURIComponent(query)}`)
            setter(res.data.airports || [])
            showSetter(true)
          } catch { setter([]) }
        }, 300)
      }
    })(),
    []
  )

  useEffect(() => {
    searchAirportsDebounced(originQuery, setOriginAirports, setShowOriginDropdown)
  }, [originQuery])

  useEffect(() => {
    searchAirportsDebounced(destQuery, setDestAirports, setShowDestDropdown)
  }, [destQuery])

  // Auto-search destination on mount
  useEffect(() => {
    if (destination && !selectedDest) {
      searchAirportsDebounced(destination, setDestAirports, setShowDestDropdown)
    }
  }, [destination])

  const handleSearch = async () => {
    if (!selectedOrigin || !selectedDest || !date) {
      setError('Please select origin, destination, and travel date.')
      return
    }
    setLoading(true)
    setError(null)
    setFlights([])
    setStats(null)

    try {
      const params = new URLSearchParams({
        origin: selectedOrigin.skyId,
        dest: selectedDest.skyId,
        originEntityId: selectedOrigin.entityId,
        destEntityId: selectedDest.entityId,
        date: date,
        adults: adults.toString(),
        cabin_class: cabinClass,
      })
      if (returnDate) params.append('return_date', returnDate)

      const res = await api.get(`/transport/flights/?${params}`)
      setFlights(res.data.flights || [])
      setStats({
        total: res.data.total_results,
        cheapest: res.data.cheapest_price_formatted,
        fastest: res.data.fastest_duration,
      })
    } catch (e) {
      setError('Failed to search flights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Sort & filter
  const sortedFlights = [...flights]
    .filter(f => {
      if (filterStops === 'direct') return f.stops === 0
      if (filterStops === '1stop') return f.stops <= 1
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price_inr - b.price_inr
      if (sortBy === 'duration') return a.duration_minutes - b.duration_minutes
      if (sortBy === 'departure') return new Date(a.departure) - new Date(b.departure)
      return 0
    })

  const directCount = flights.filter(f => f.stops === 0).length
  const oneStopCount = flights.filter(f => f.stops === 1).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Search Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">✈️</span>
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-slate-100">Search Flights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Origin */}
          <div className="relative" ref={originRef}>
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">From</label>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30">
              📍
              <input
                type="text"
                value={selectedOrigin ? `${selectedOrigin.name} (${selectedOrigin.iata})` : originQuery}
                onChange={(e) => { setOriginQuery(e.target.value); setSelectedOrigin(null) }}
                onFocus={() => originQuery.length >= 2 && setShowOriginDropdown(true)}
                placeholder="City or airport..."
                className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-slate-100 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              {selectedOrigin && (
                <button onClick={() => { setSelectedOrigin(null); setOriginQuery('') }} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showOriginDropdown && originAirports.length > 0 && !selectedOrigin && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                >
                  {originAirports.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedOrigin(a); setShowOriginDropdown(false); setOriginQuery(a.name) }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm flex items-center gap-2 border-b border-gray-50 dark:border-slate-700 last:border-0"
                    >
                      <span className="font-mono font-bold text-blue-600 text-xs">{a.iata}</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-100">{a.name}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-slate-400">{a.country}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Destination */}
          <div className="relative" ref={destRef}>
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">To</label>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30">
              <span className="text-gray-400">✈️</span>
              <input
                type="text"
                value={selectedDest ? `${selectedDest.name} (${selectedDest.iata})` : destQuery}
                onChange={(e) => { setDestQuery(e.target.value); setSelectedDest(null) }}
                onFocus={() => destQuery.length >= 2 && setShowDestDropdown(true)}
                placeholder="City or airport..."
                className="flex-1 bg-transparent text-sm font-semibold text-gray-900 dark:text-slate-100 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
              {selectedDest && (
                <button onClick={() => { setSelectedDest(null); setDestQuery('') }} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showDestDropdown && destAirports.length > 0 && !selectedDest && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                >
                  {destAirports.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedDest(a); setShowDestDropdown(false); setDestQuery(a.name) }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 text-sm flex items-center gap-2 border-b border-gray-50 dark:border-slate-700 last:border-0"
                    >
                      <span className="font-mono font-bold text-blue-600 text-xs">{a.iata}</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-100">{a.name}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-slate-400">{a.country}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {/* Date */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">Departure</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none"
            />
          </div>

          {/* Return */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">Return <span className="text-gray-400 dark:text-slate-500 normal-case">(optional)</span></label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none"
            />
          </div>

          {/* Adults */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">Travelers</label>
            <select
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value))}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-blue-400 outline-none"
            >
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>

          {/* Cabin */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1 block">Class</label>
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-slate-700 text-sm font-semibold text-gray-900 dark:text-slate-100 focus:border-blue-400 outline-none"
            >
              {CABIN_CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : '🔍'}
              {loading ? 'Searching...' : 'Search'}
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
      {flights.length > 0 && (
        <>
          {/* Stats Bar */}
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
              <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{stats?.total} flights found</span>
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Filter:</span>
            {[
              { v: 'all', l: `All (${flights.length})` },
              { v: 'direct', l: `Direct (${directCount})` },
              { v: '1stop', l: `≤1 Stop (${directCount + oneStopCount})` },
            ].map(f => (
              <button
                key={f.v}
                onClick={() => setFilterStops(f.v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStops === f.v
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.l}
              </button>
            ))}

            <span className="ml-4 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sort:</span>
            {SORT_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => setSortBy(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  sortBy === s.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Flight Cards */}
          <div className="space-y-3">
            {sortedFlights.map((flight, idx) => (
              <FlightCard
                key={idx}
                flight={flight}
                isExpanded={expandedFlight === idx}
                onToggle={() => setExpandedFlight(expandedFlight === idx ? null : idx)}
                isCheapest={idx === 0 && sortBy === 'price'}
                isFastest={sortBy === 'duration' && idx === 0}
                searchCtx={{
                  originIata: selectedOrigin?.iata || '',
                  destIata: selectedDest?.iata || '',
                  originCity: selectedOrigin?.name?.split('(')[0]?.trim() || '',
                  destCity: selectedDest?.name?.split('(')[0]?.trim() || '',
                  date,
                  returnDate,
                  adults,
                  cabinClass,
                }}
              />
            ))}
          </div>

          {sortedFlights.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              🔍
              <p className="font-semibold">No flights match your filters</p>
              <p className="text-xs mt-1">Try removing filters to see more results</p>
            </div>
          )}
        </>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-sm font-bold text-gray-700 dark:text-slate-300">Searching best flights...</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">Comparing prices across airlines</p>
        </div>
      )}
    </motion.div>
  )
}


function buildBookingUrls(flight, ctx) {
  const { originIata, destIata, originCity, destCity, date, returnDate, adults, cabinClass } = ctx || {}
  const o = (originIata || '').toUpperCase()
  const d = (destIata || '').toUpperCase()
  const pax = adults || 1
  const cabin = cabinClass === 'business' ? 'B' : cabinClass === 'first' ? 'F' : 'E'

  // Parse date into different formats
  const dateParts = (date || '').split('-') // ['2026','04','20']
  const yyyy = dateParts[0] || '2026'
  const mm = dateParts[1] || '01'
  const dd = dateParts[2] || '01'
  const dateDMY = `${dd}/${mm}/${yyyy}` // 20/04/2026 — MakeMyTrip format
  const dateYMD = date || '' // 2026-04-20
  const dateCompact = `${yyyy}${mm}${dd}` // 20260420
  const dateSkyscanner = `${yyyy.slice(2)}${mm}${dd}` // 260420

  // Domestic check
  const indianAirports = ['BOM','DEL','BLR','MAA','HYD','CCU','GOI','COK','JAI','AMD','PNQ','LKO','RPR','NAG','PAT','BBI','IDR','BHO','GAU','SXR','VNS','IXB','IXR','VTZ','TRV','CCJ','IXA','IXZ','IMF','DIB','IXM','TRZ','CJB','IXE','HBX','UDR','JDH','RAJ','STV','BDQ','IXL','DED','DHM','KUU','ATQ','IXJ','MYQ','TIR','RJA','GWL','JLR','AYJ','IXC']
  const isIntl = !(indianAirports.includes(o) && indianAirports.includes(d))

  return {
    // Google Flights — natural language query (most reliable)
    google: `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(originCity || o)}+to+${encodeURIComponent(destCity || d)}+on+${encodeURIComponent(date)}+${pax}+adult+economy&curr=INR&hl=en`,

    // Skyscanner — /transport/flights/origin/dest/YYMMDD/
    skyscanner: `https://www.skyscanner.co.in/transport/flights/${o.toLowerCase()}/${d.toLowerCase()}/${dateSkyscanner}/?adultsv2=${pax}&cabinclass=${cabinClass || 'economy'}&childrenv2=&ref=home&rtn=0&preferdirects=false`,

    // MakeMyTrip — itinerary=ORIG-DEST-DD/MM/YYYY
    makemytrip: `https://www.makemytrip.com/flight/search?itinerary=${o}-${d}-${dateDMY}&tripType=O&paxType=A-${pax}_C-0_I-0&intl=${isIntl}&cabinClass=${cabin}&ccde=IN&lang=eng`,

    // ixigo — query params format (confirmed working)
    ixigo: `https://www.ixigo.com/search/result/flight?from=${o}&to=${d}&date=${dateCompact}&returnDate=&adults=${pax}&children=0&infants=0&class=e&source=Search+Form`,

    // Cleartrip — /flights/results?from=&to=&depart_date=DD/MM/YYYY
    cleartrip: `https://www.cleartrip.com/flights/results?adults=${pax}&childs=0&infants=0&class=Economy&depart_date=${dateDMY}&from=${o}&to=${d}&intl=${isIntl}&sd=${dateCompact}`,

    // EaseMyTrip — /FlightList/Index with org=CODE-City,+Country format
    easemytrip: `https://flight.easemytrip.com/FlightList/Index?org=${o}-${encodeURIComponent(originCity || o)},+India&dept=${d}-${encodeURIComponent(destCity || d)},+India&adt=${pax}&chd=0&inf=0&cabin=0&airline=Any&deptDT=${dateDMY}&arrDT=undefined&isOneway=true&isDomestic=${!isIntl}`,
  }
}

function FlightCard({ flight, isExpanded, onToggle, isCheapest, isFastest, searchCtx }) {
  const urls = buildBookingUrls(flight, searchCtx)
  return (
    <motion.div
      layout
      className={`bg-white dark:bg-slate-800 rounded-xl border overflow-hidden transition-all ${
        isExpanded ? 'border-blue-300 dark:border-blue-600 shadow-md ring-1 ring-blue-100 dark:ring-blue-900/30' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-sm'
      }`}
    >
      <button onClick={onToggle} className="w-full text-left p-3">
        {/* Top row: Airline + Timeline + Price */}
        <div className="flex items-center gap-3">
          {/* Airline */}
          <div className="flex-shrink-0 flex items-center gap-2 min-w-0">
            <img
              src={flight.logo}
              alt={flight.airline}
              className="w-7 h-7 rounded object-contain flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">{flight.airline}</p>
              <p className="text-[10px] text-gray-500 font-mono">{flight.flight_number}</p>
            </div>
          </div>

          {/* Departure */}
          <div className="text-center flex-shrink-0">
            <p className="text-sm font-extrabold text-gray-900 dark:text-slate-100">{formatTime(flight.departure)}</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">{formatDate(flight.departure)}</p>
          </div>

          {/* Route */}
          <div className="flex-1 flex flex-col items-center gap-0.5 min-w-[60px]">
            <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400">{flight.duration}</span>
            <div className="w-full flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <div className="flex-1 h-[2px] bg-gray-300 relative mx-0.5">
                {flight.stops > 0 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                )}
              </div>
              ✈️
            </div>
            <span className={`text-[10px] font-bold ${flight.stops === 0 ? 'text-green-600' : 'text-amber-600'}`}>
              {flight.stops_label}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-center flex-shrink-0">
            <p className="text-sm font-extrabold text-gray-900 dark:text-slate-100">{formatTime(flight.arrival)}</p>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">{formatDate(flight.arrival)}</p>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right">
            {(isCheapest || isFastest) && (
              <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${isCheapest ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {isCheapest ? '✓ BEST' : '⚡ FAST'}
              </span>
            )}
            <p className="text-sm font-extrabold text-green-700">₹{flight.price_inr?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-slate-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 mb-4">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">Class</p>
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 capitalize">{flight.cabin_class}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">Duration</p>
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{flight.duration}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">Stops</p>
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{flight.stops_label}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-bold">Flight</p>
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 font-mono">{flight.flight_number}</p>
                </div>
              </div>

              {/* Platform Price Comparison */}
              <p className="text-[10px] text-gray-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-wider">Compare prices & book:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(flight.platform_prices || []).map((pp, pi) => {
                  const urlMap = {
                    'Google Flights': urls.google,
                    'Skyscanner': urls.skyscanner,
                    'MakeMyTrip': urls.makemytrip,
                    'ixigo': urls.ixigo,
                    'Cleartrip': urls.cleartrip,
                    'EaseMyTrip': urls.easemytrip,
                  }
                  const styleMap = {
                    'Google Flights': { bg: 'bg-blue-600 hover:bg-blue-700', text: 'text-white', border: '' },
                    'Skyscanner': { bg: 'bg-sky-50 hover:bg-sky-100', text: 'text-sky-800', border: 'border border-sky-200' },
                    'MakeMyTrip': { bg: 'bg-red-50 hover:bg-red-100', text: 'text-red-800', border: 'border border-red-200' },
                    'ixigo': { bg: 'bg-orange-50 hover:bg-orange-100', text: 'text-orange-800', border: 'border border-orange-200' },
                    'Cleartrip': { bg: 'bg-yellow-50 hover:bg-yellow-100', text: 'text-yellow-800', border: 'border border-yellow-200' },
                    'EaseMyTrip': { bg: 'bg-indigo-50 hover:bg-indigo-100', text: 'text-indigo-800', border: 'border border-indigo-200' },
                  }
                  const s = styleMap[pp.platform] || { bg: 'bg-gray-50 hover:bg-gray-100', text: 'text-gray-800', border: 'border border-gray-200' }
                  const url = urlMap[pp.platform] || urls.google

                  return (
                    <a
                      key={pi}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`relative flex flex-col items-center rounded-xl py-2.5 px-3 transition-all ${s.bg} ${s.text} ${s.border}`}
                    >
                      {pp.is_cheapest && (
                        <span className="absolute -top-1.5 -right-1.5 text-[7px] px-1.5 py-0.5 rounded-full bg-green-500 text-white font-extrabold shadow-sm">
                          LOWEST
                        </span>
                      )}
                      <span className="text-[10px] font-bold opacity-80">{pp.platform}</span>
                      <span className={`text-sm font-extrabold ${pp.is_cheapest ? 'text-green-700' : ''}`}>
                        {pp.price_formatted}
                      </span>
                    </a>
                  )
                })}
              </div>
              {flight.platform_prices?.length > 0 && (
                <p className="text-[9px] text-gray-400 mt-1.5 text-center">
                  💡 Prices are indicative. Click to check latest fare on each platform.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
