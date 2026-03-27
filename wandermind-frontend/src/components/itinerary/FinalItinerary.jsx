import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Download, Link2, MessageCircle, Pencil, Copy, Check,
  Star, MapPin, Clock, Utensils, Hotel, Bus, Luggage, Leaf,
  Sun, Cloud, Shirt, ChevronRight, Globe, Shield, Banknote,
  Stethoscope, Phone, Plane, Train, ExternalLink, ChevronDown,
  ChevronUp, Mail, Globe2, DoorOpen, ArrowRight, Navigation,
  Award, Users, Bookmark
} from 'lucide-react'
import { useTripStore } from '../../store/tripStore'
import { useTrip } from '../../hooks/useTrip'
import RatingBadge from '../shared/RatingBadge'
import ItineraryMap from './ItineraryMap'
import FlightSearch from '../flights/FlightSearch'
import TrainSearch from '../trains/TrainSearch'
import toast from 'react-hot-toast'

const TIME_EMOJI = { morning: '🌅', afternoon: '☀️', evening: '🌇', night: '🌙' }
const MEAL_EMOJI = { breakfast: '🍳', lunch: '🍛', dinner: '🍽️', snacks: '🍿' }

const PLATFORM_COLORS = {
  'Booking.com': { bg: 'bg-blue-500/15', text: 'text-blue-600', border: 'border-blue-500/20' },
  'MakeMyTrip': { bg: 'bg-red-500/15', text: 'text-red-600', border: 'border-red-500/20' },
  'Goibibo': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
  'Agoda': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/20' },
  'OYO': { bg: 'bg-red-600/15', text: 'text-red-300', border: 'border-red-600/20' },
  'Hotels.com': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20' },
}

function getBookingUrl(platform, hotelName, city) {
  const name = encodeURIComponent(hotelName || '')
  const c = encodeURIComponent(city || '')
  const urls = {
    'Booking.com': `https://www.booking.com/searchresults.html?ss=${name}+${c}`,
    'MakeMyTrip': `https://www.makemytrip.com/hotels/hotel-listing/?city=${c}&searchText=${name}`,
    'Goibibo': `https://www.goibibo.com/hotels/search/?query=${name}+${c}`,
    'Agoda': `https://www.agoda.com/search?q=${name}+${c}`,
    'OYO': `https://www.oyorooms.com/search?location=${c}&query=${name}`,
    'Hotels.com': `https://www.hotels.com/search.do?q=${name}+${c}`,
  }
  return urls[platform] || `https://www.google.com/search?q=${name}+${c}+booking`
}

function getMapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || '')}`
}


export default function FinalItinerary({ onClose }) {
  const itinerary = useTripStore((s) => s.itinerary)
  const { finalizeTrip, generateWhatsAppText } = useTrip()
  const [activeDay, setActiveDay] = useState(1)
  const [shareUrl, setShareUrl] = useState(null)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('itinerary')
  const [mobileSidebar, setMobileSidebar] = useState(false)

  if (!itinerary) return null

  const days = itinerary.days || []
  const currentDay = days.find((d) => d.day === activeDay) || days[0]
  const budget = itinerary.budget || {}
  const essentials = itinerary.travel_essentials || {}
  const packing = itinerary.packing_list || {}
  const transport = itinerary.india_transport || {}

  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const el = document.getElementById('final-itinerary-content')
      html2pdf().set({
        margin: [8, 8],
        filename: `WanderMind-${itinerary.destination}-${itinerary.total_days}days.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save()
      toast.success('PDF download started!')
    } catch { toast.error('Failed to generate PDF') }
  }

  const handleShare = async () => {
    const result = await finalizeTrip()
    if (result?.share_url) {
      const url = `${window.location.origin}${result.share_url}`
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Share link copied!')
    }
  }

  const handleWhatsApp = () => {
    const text = generateWhatsAppText(itinerary)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateWhatsAppText(itinerary))
    toast.success('Copied to clipboard!')
  }

  const usedBudget = budget.total_inr ? budget.total_inr - (budget.remaining_inr || 0) : 0
  const budgetPct = budget.total_inr ? Math.round((usedBudget / budget.total_inr) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="h-full flex flex-col"
      >
        {/* ─── TOP BAR ─── */}
        <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-gray-200 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile hamburger for sidebar */}
            <button
              onClick={() => setMobileSidebar(!mobileSidebar)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 flex-shrink-0"
            >
              <span className="text-lg">☰</span>
            </button>
            <span className="text-xl sm:text-2xl flex-shrink-0">🌍</span>
            <div className="min-w-0">
              <h1 className="font-display text-sm sm:text-lg font-bold gradient-text truncate">
                {itinerary.destination}, {itinerary.country}
              </h1>
              <p className="text-xs sm:text-sm text-gray-700 truncate">
                {itinerary.total_days} days
                {itinerary.travel_dates?.start && ` · ${itinerary.travel_dates.start} to ${itinerary.travel_dates.end}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button onClick={handleDownloadPDF} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors">
              <Download size={12} /> <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={handleShare} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
              {copied ? <Check size={12} /> : <Link2 size={12} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button onClick={handleWhatsApp} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
              <MessageCircle size={12} /> <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button onClick={handleCopy} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-700 hover:bg-gray-100 transition-colors">
              <Copy size={12} />
            </button>
            <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-700">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <div id="final-itinerary-content" className="flex-1 flex overflow-hidden relative" style={{ background: '#FFFFFF', color: '#1E293B' }}>

          {/* Mobile sidebar overlay */}
          {mobileSidebar && (
            <div className="fixed inset-0 z-[55] bg-black/40 md:hidden" onClick={() => setMobileSidebar(false)} />
          )}

          {/* ── LEFT: Day Selector + Budget ── */}
          <aside className={`
            ${mobileSidebar ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 transition-transform duration-300
            fixed md:relative z-[60] md:z-auto
            w-72 md:w-64 h-full
            border-r border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto
            bg-white shadow-2xl md:shadow-none
          `}>
            {/* Trip summary card */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-700 mb-2">{itinerary.summary}</p>
              {itinerary.travel_style?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {itinerary.travel_style.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 border border-blue-600/20">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Budget overview */}
            <div className="p-4 border-b border-gray-200 space-y-2">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Budget</p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-700">&#8377;{usedBudget.toLocaleString('en-IN')}</span>
                <span className="font-mono font-semibold">&#8377;{budget.total_inr?.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-400' : 'bg-green-500'}`}
                     style={{ width: `${Math.min(budgetPct, 100)}%` }} />
              </div>
              {budget.breakdown && (
                <div className="space-y-1 mt-2">
                  {[
                    { k: 'hotels_inr', label: 'Hotels', icon: '🏨' },
                    { k: 'food_inr', label: 'Food', icon: '🍽️' },
                    { k: 'activities_inr', label: 'Activities', icon: '🎯' },
                    { k: 'transport_inr', label: 'Transport', icon: '🚗' },
                    { k: 'misc_inr', label: 'Misc', icon: '📦' },
                  ].map(({ k, label, icon }) => {
                    const v = budget.breakdown[k]
                    if (!v) return null
                    return (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-700">{icon} {label}</span>
                        <span className="font-mono text-gray-700">&#8377;{v.toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                    <span className="text-green-700 font-semibold">Remaining</span>
                    <span className="font-mono text-green-700 font-semibold">&#8377;{(budget.remaining_inr || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Day selector */}
            <div className="p-4 space-y-1.5 flex-1">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Days</p>
              {days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => { setActiveDay(day.day); setTab('itinerary'); setMobileSidebar(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs ${
                    activeDay === day.day && tab === 'itinerary'
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      activeDay === day.day && tab === 'itinerary'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>{day.day}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{day.theme}</p>
                      <p className="text-xs text-gray-700 font-mono">
                        &#8377;{day.day_total_inr?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              {/* Extra tabs */}
              <div className="pt-3 mt-3 border-t border-gray-200 space-y-1.5">
                <button
                  onClick={() => { setTab('map'); setMobileSidebar(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                    tab === 'map' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <MapPin size={14} /> Trip Map & Routes
                </button>
                <button
                  onClick={() => { setTab('flights'); setMobileSidebar(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                    tab === 'flights' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  ✈️ Search Flights
                </button>
                <button
                  onClick={() => { setTab('trains'); setMobileSidebar(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                    tab === 'trains' ? 'bg-green-50 border border-green-200 text-green-700' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  🚂 Search Trains
                </button>
                <button
                  onClick={() => { setTab('essentials'); setMobileSidebar(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                    tab === 'essentials' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Globe size={14} /> Travel Essentials
                </button>
                <button
                  onClick={() => { setTab('packing'); setMobileSidebar(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                    tab === 'packing' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Luggage size={14} /> Packing List
                </button>
              </div>
            </div>
          </aside>

          {/* ── RIGHT: Content Area ── */}
          <main className="flex-1" style={{ overflowY: 'auto' }}>
            <AnimatePresence mode="wait">
              {tab === 'itinerary' && currentDay && (
                <DayView key={`day-${activeDay}`} day={currentDay} destination={itinerary.destination} onNavigate={setTab} />
              )}
              {tab === 'map' && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full p-4"
                >
                  <ItineraryMap
                    itinerary={itinerary}
                    activeDay={activeDay}
                    onSelectDay={(day) => { setActiveDay(day); setTab('itinerary'); }}
                  />
                </motion.div>
              )}
              {tab === 'flights' && (
                <motion.div
                  key="flights"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-2"
                >
                  <FlightSearch
                    destination={itinerary.destination}
                    travelDate={itinerary.travel_dates?.start || ''}
                  />
                </motion.div>
              )}
              {tab === 'trains' && (
                <motion.div
                  key="trains"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-2"
                >
                  <TrainSearch destination={itinerary.destination} />
                </motion.div>
              )}
              {tab === 'essentials' && (
                <EssentialsView key="essentials" essentials={essentials} transport={transport} festivals={itinerary.festivals_events} />
              )}
              {tab === 'packing' && (
                <PackingView key="packing" packing={packing} />
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* ─── BOTTOM BAR ─── */}
        <footer className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-2.5 border-t border-gray-200 flex-shrink-0 gap-2">
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex-shrink-0">
            ✏️ <span className="hidden sm:inline">Continue Editing</span><span className="sm:hidden">Edit</span>
          </button>
          <p className="text-xs text-gray-500 hidden sm:block truncate">
            {shareUrl || 'Created with WanderMind AI'}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {activeDay > 1 && tab === 'itinerary' && (
              <button onClick={() => setActiveDay(activeDay - 1)} className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                &larr; <span className="hidden sm:inline">Day </span>{activeDay - 1}
              </button>
            )}
            {activeDay < days.length && tab === 'itinerary' && (
              <button onClick={() => setActiveDay(activeDay + 1)} className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-100">
                <span className="hidden sm:inline">Day </span>{activeDay + 1} &rarr;
              </button>
            )}
          </div>
        </footer>
      </motion.div>
    </motion.div>
  )
}


/* ═══════════════════ HOTEL CAROUSEL CARD (compact) ═══════════════════ */
function HotelCarouselCard({ hotel, isRecommended, onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-40 sm:w-52 rounded-xl border overflow-hidden text-left transition-all hover:scale-[1.02] ${
        isActive
          ? 'border-blue-600/50 bg-blue-600/10 ring-1 ring-blue-600/30'
          : 'border-white/8 bg-white/[0.03] hover:border-white/15'
      }`}
    >
      {hotel.photo_url ? (
        <img src={hotel.photo_url} alt={hotel.name} className="w-full h-28 object-cover" />
      ) : (
        <div className="w-full h-28 bg-gradient-to-br from-blue-600/20 to-blue-700/10 flex items-center justify-center">
          <Hotel size={24} className="text-blue-600/40" />
        </div>
      )}
      <div className="p-2.5 space-y-1">
        {isRecommended && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-bold uppercase">
            Top Pick
          </span>
        )}
        <h4 className="text-xs font-semibold truncate">{hotel.name}</h4>
        <div className="flex items-center gap-1">
          {[...Array(hotel.stars || 0)].map((_, i) => (
            <Star key={i} size={8} className="fill-amber-500 text-amber-700" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-0.5 text-xs text-amber-700">
            <Star size={8} className="fill-amber-500" /> {hotel.rating || '—'}
            {hotel.review_count && <span className="text-gray-700">({hotel.review_count >= 1000 ? `${(hotel.review_count/1000).toFixed(1)}k` : hotel.review_count})</span>}
          </span>
          <span className="font-mono text-green-700 text-xs font-bold">
            &#8377;{hotel.price_per_night_inr?.toLocaleString('en-IN')}
          </span>
        </div>
        {hotel.amenities?.length > 0 && (
          <div className="flex gap-1 overflow-hidden">
            {hotel.amenities.slice(0, 3).map((a, i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 truncate">{a}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}


/* ═══════════════════ HOTEL EXPANDED DETAIL ═══════════════════ */
function HotelExpandedDetail({ hotel, destination }) {
  if (!hotel) return null
  const platforms = hotel.booking_platforms || []

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="rounded-xl border border-blue-600/20 bg-blue-600/5 p-3 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {hotel.photo_url && (
            <img src={hotel.photo_url} alt={hotel.name} className="w-full sm:w-56 h-40 object-cover rounded-lg flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">{hotel.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(hotel.stars || 0)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-500 text-amber-700" />
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-green-700 text-xl font-bold">&#8377;{hotel.price_per_night_inr?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-700">per night</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RatingBadge rating={hotel.rating} reviews={hotel.review_count} />
              {hotel.veg_friendly && <span className="flex items-center gap-1 text-xs text-green-700"><Leaf size={10} /> Veg-friendly</span>}
            </div>
            {hotel.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hotel.amenities.map((a, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{a}</span>
                ))}
              </div>
            )}
            {hotel.why_consider && <p className="text-sm text-amber-400 italic">💡 {hotel.why_consider}</p>}
          </div>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {hotel.address && (
            <a href={getMapsUrl(hotel.address || hotel.name + ' ' + destination)} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
              📍 <span className="truncate">{hotel.address}</span>
            </a>
          )}
          {hotel.contact_phone && (
            <a href={`tel:${hotel.contact_phone}`} className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
              📞 {hotel.contact_phone}
            </a>
          )}
          {hotel.contact_email && (
            <a href={`mailto:${hotel.contact_email}`} className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
              ✉️ <span className="truncate">{hotel.contact_email}</span>
            </a>
          )}
          {hotel.website && (
            <a href={hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-blue-600 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
              🌐 Website
            </a>
          )}
        </div>

        {(hotel.checkin_time || hotel.checkout_time) && (
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-700 flex-wrap">
            {hotel.checkin_time && <span className="flex items-center gap-1">🟢 Check-in: <strong className="text-gray-700">{hotel.checkin_time}</strong></span>}
            {hotel.checkout_time && <span className="flex items-center gap-1">🔴 Check-out: <strong className="text-gray-700">{hotel.checkout_time}</strong></span>}
          </div>
        )}

        {/* Booking platforms */}
        {platforms.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1">
              🏷️ Book on — Compare prices
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {platforms.map((p, i) => {
                const pc = PLATFORM_COLORS[p.platform] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
                const url = p.url_hint || getBookingUrl(p.platform, hotel.name, destination)
                return (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                     className={`flex items-center justify-between p-2.5 rounded-lg border ${pc.border} ${pc.bg} hover:scale-[1.02] transition-all group`}>
                    <div>
                      <p className={`text-sm font-semibold ${pc.text}`}>{p.platform}</p>
                      <p className="font-mono text-sm font-bold text-white">&#8377;{p.estimated_price_inr?.toLocaleString('en-IN')}</p>
                    </div>
                    <ExternalLink size={12} className="text-gray-700 group-hover:text-white transition-colors" />
                  </a>
                )
              })}
            </div>
          </div>
        )}
        {platforms.length === 0 && (
          <a href={getBookingUrl('google', hotel.name, destination)} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors">
            <ExternalLink size={12} /> Search booking options for {hotel.name}
          </a>
        )}
      </div>
    </motion.div>
  )
}


/* ═══════════════════ RESTAURANT CAROUSEL CARD (compact) ═══════════════════ */
function RestaurantCarouselCard({ restaurant, mealTime, onClick, isActive, isPrimary }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-48 rounded-xl border overflow-hidden text-left transition-all hover:scale-[1.02] ${
        isActive
          ? 'border-blue-600/50 bg-blue-600/10 ring-1 ring-blue-600/30'
          : 'border-white/8 bg-white/[0.03] hover:border-white/15'
      }`}
    >
      {restaurant.photo_url ? (
        <img src={restaurant.photo_url} alt={restaurant.place_name} className="w-full h-24 object-cover" />
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-amber-400/20 to-blue-600/10 flex items-center justify-center">
          <Utensils size={20} className="text-amber-400/40" />
        </div>
      )}
      <div className="p-2.5 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{MEAL_EMOJI[mealTime] || '🍽️'}</span>
          {isPrimary && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-bold uppercase">
              Top Pick
            </span>
          )}
        </div>
        <h4 className="text-xs font-semibold truncate">{restaurant.place_name}</h4>
        <p className="text-xs text-gray-700 truncate">{restaurant.cuisine}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-0.5 text-xs text-amber-700">
            <Star size={8} className="fill-amber-500" /> {restaurant.rating || '—'}
          </span>
          <span className="font-mono text-green-700 text-sm font-bold">
            &#8377;{restaurant.cost_per_person_inr?.toLocaleString('en-IN')}/pp
          </span>
        </div>
        {restaurant.distance_from_hotel && (
          <span className="flex items-center gap-0.5 text-xs text-gray-700">
            <Navigation size={7} /> {restaurant.distance_from_hotel}
          </span>
        )}
      </div>
    </button>
  )
}


/* ═══════════════════ RESTAURANT EXPANDED DETAIL ═══════════════════ */
function RestaurantExpandedDetail({ restaurant, destination }) {
  if (!restaurant) return null
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="rounded-xl border border-blue-600/20 bg-blue-600/5 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base">{restaurant.place_name}</h4>
            <p className="text-sm text-gray-700">{restaurant.cuisine}</p>
            <div className="flex items-center gap-3 mt-2">
              {restaurant.rating && <RatingBadge rating={restaurant.rating} reviews={restaurant.review_count} />}
              {restaurant.is_vegetarian_friendly && <span className="flex items-center gap-0.5 text-xs text-green-700"><Leaf size={8} /> Veg</span>}
              {restaurant.is_vegan_friendly && <span className="text-xs text-emerald-400">Vegan</span>}
              {restaurant.opening_hours && <span className="flex items-center gap-0.5 text-xs text-gray-700"><Clock size={8} /> {restaurant.opening_hours}</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono text-green-700 text-lg font-bold">&#8377;{restaurant.cost_per_person_inr?.toLocaleString('en-IN')}/pp</p>
            {restaurant.avg_cost_for_two_inr && <p className="text-xs text-gray-700">₹{restaurant.avg_cost_for_two_inr?.toLocaleString('en-IN')} for two</p>}
          </div>
        </div>
        {restaurant.must_try_dish && (
          <p className="text-sm text-amber-400"><Award size={10} className="inline mr-1" />Must try: {restaurant.must_try_dish}</p>
        )}
        {restaurant.distance_from_hotel && (
          <p className="text-xs text-gray-700 flex items-center gap-1"><Navigation size={10} /> {restaurant.distance_from_hotel} from hotel</p>
        )}
        <div className="flex items-center gap-3">
          {restaurant.address && (
            <a href={getMapsUrl(restaurant.maps_query || restaurant.place_name + ' ' + destination)} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><MapPin size={10} /> {restaurant.address}</a>
          )}
          {restaurant.contact_phone && (
            <a href={`tel:${restaurant.contact_phone}`} className="flex items-center gap-1 text-xs text-gray-700 hover:text-blue-600"><Phone size={10} /> {restaurant.contact_phone}</a>
          )}
        </div>
      </div>
    </motion.div>
  )
}


/* ═══════════════════ MEAL SECTION WITH CAROUSEL PER SLOT ═══════════════════ */
function MealSection({ meals, destination }) {
  const [activeRestaurant, setActiveRestaurant] = useState({})

  if (!meals?.length) return null

  // Group meals by time and flatten primary + alternatives into one array per slot
  const mealSlots = meals.map((meal) => {
    const allRestaurants = [
      { ...meal, _isPrimary: true },
      ...(meal.alternatives || []).map((a) => ({ ...a, _isPrimary: false }))
    ]
    return { mealTime: meal.meal_time, restaurants: allRestaurants }
  })

  return (
    <div className="space-y-5">
      <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
        <Utensils size={12} /> Dining — Top Rated Restaurants
      </h3>
      {mealSlots.map((slot, si) => {
        const activeIdx = activeRestaurant[si] ?? null
        const activeR = activeIdx !== null ? slot.restaurants[activeIdx] : null
        return (
          <div key={si} className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              {MEAL_EMOJI[slot.mealTime] || '🍽️'} <span className="uppercase tracking-wider">{slot.mealTime}</span>
              <span className="text-xs text-gray-700 font-normal ml-1">— {slot.restaurants.length} options</span>
            </p>
            {/* Horizontal carousel */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {slot.restaurants.map((r, ri) => (
                <RestaurantCarouselCard
                  key={ri}
                  restaurant={r}
                  mealTime={slot.mealTime}
                  isPrimary={r._isPrimary}
                  isActive={activeIdx === ri}
                  onClick={() => setActiveRestaurant((prev) => ({ ...prev, [si]: prev[si] === ri ? null : ri }))}
                />
              ))}
            </div>
            {/* Expanded detail */}
            <AnimatePresence>
              {activeR && <RestaurantExpandedDetail restaurant={activeR} destination={destination} />}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}


/* ═══════════════════ DAY VIEW ═══════════════════ */
function DayView({ day, destination, onNavigate }) {
  const [activeHotel, setActiveHotel] = useState(null)
  const altHotels = day.alternative_hotels || []
  const allHotels = [
    { ...day.hotel, _isRecommended: true },
    ...altHotels.map((h) => ({ ...h, _isRecommended: false }))
  ].filter((h) => h?.name)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-3 sm:p-6 space-y-4 sm:space-y-6"
    >
      {/* Day header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-display font-bold text-base sm:text-xl text-white flex-shrink-0">
          {day.day}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg sm:text-2xl font-bold truncate">{day.theme}</h2>
          <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1 flex-wrap">
            {day.weather_note && (
              <span className="flex items-center gap-1 text-xs text-gray-700">
                ☁️ {day.weather_note}
              </span>
            )}
            {day.day_total_inr && (
              <span className="font-mono text-xs sm:text-sm text-green-700 font-semibold">
                &#8377;{day.day_total_inr.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick action shortcuts */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => onNavigate?.('flights')}
          className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
        >
          ✈️ <span className="hidden xs:inline">Flights</span>
        </button>
        <button
          onClick={() => onNavigate?.('trains')}
          className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 transition-all"
        >
          🚂 <span className="hidden xs:inline">Trains</span>
        </button>
        <button
          onClick={() => onNavigate?.('map')}
          className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all"
        >
          📍 <span className="hidden xs:inline">Map</span>
        </button>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.theme + ' ' + destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all"
        >
          🗺️ <span className="hidden xs:inline">Google Maps</span>
        </a>
      </div>

      {day.morning_brief && (
        <p className="text-sm text-gray-700 italic border-l-2 border-blue-200 pl-3">{day.morning_brief}</p>
      )}

      {/* ═══ HOTEL CAROUSEL ═══ */}
      {allHotels.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <Hotel size={12} /> Accommodation
            <span className="text-xs text-gray-700 font-normal">— {allHotels.length} options, click to expand</span>
          </h3>

          {/* Horizontal carousel */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {allHotels.map((hotel, i) => (
              <HotelCarouselCard
                key={i}
                hotel={hotel}
                isRecommended={hotel._isRecommended}
                isActive={activeHotel === i}
                onClick={() => setActiveHotel(activeHotel === i ? null : i)}
              />
            ))}
          </div>

          {/* Expanded hotel detail */}
          <AnimatePresence>
            {activeHotel !== null && allHotels[activeHotel] && (
              <HotelExpandedDetail hotel={allHotels[activeHotel]} destination={destination} />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══ ACTIVITIES ═══ */}
      {day.activities?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Activities</h3>
          <div className="space-y-3">
            {day.activities.map((act, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-200 hover:border-blue-600/20 transition-colors">
                <div className="flex flex-col sm:flex-row">
                  {act.photo_url && (
                    <img src={act.photo_url} alt={act.name}
                         className="w-full sm:w-40 h-36 sm:h-32 object-cover flex-shrink-0" />
                  )}
                  <div className="p-3 sm:p-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{TIME_EMOJI[act.time_slot] || '📍'}</span>
                      <span className="text-xs uppercase tracking-wider text-gray-700 font-semibold">{act.time_slot}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600">{act.type}</span>
                      {act.accessibility && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          act.accessibility === 'easy' ? 'bg-green-50 text-green-700' :
                          act.accessibility === 'moderate' ? 'bg-yellow-500/15 text-yellow-400' :
                          'bg-red-500/15 text-red-600'
                        }`}>{act.accessibility}</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-base">{act.name}</h4>
                    <p className="text-xs text-gray-700 mt-0.5 line-clamp-2">{act.description}</p>
                    <div className="flex items-center gap-2 sm:gap-4 mt-2 flex-wrap">
                      <RatingBadge rating={act.rating} reviews={act.review_count} />
                      <span className="flex items-center gap-1 text-xs text-gray-700">🕐 {act.duration_hours}h</span>
                      <span className="font-mono text-xs text-green-700 font-semibold">&#8377;{act.cost_inr?.toLocaleString('en-IN')}</span>
                      {act.maps_query && (
                        <a href={getMapsUrl(act.maps_query)}
                           target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          📍 Maps 🔗
                        </a>
                      )}
                    </div>
                    {act.insider_tip && (
                      <p className="text-sm text-amber-400 mt-2 border-l-2 border-amber-400/30 pl-2 italic">
                        Tip: {act.insider_tip}
                      </p>
                    )}
                    {act.best_for?.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {act.best_for.map((b, j) => (
                          <span key={j} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">{b}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MEALS — ENHANCED ═══ */}
      <MealSection meals={day.meals} destination={destination} />

      {/* ═══ TRANSPORT ═══ */}
      {day.transport?.mode && (
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Bus size={16} className="text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{day.transport.mode}</p>
              {day.transport.details && <p className="text-xs text-gray-700">{day.transport.details}</p>}
              {day.transport.booking_tip && <p className="text-xs text-amber-400 mt-0.5">{day.transport.booking_tip}</p>}
            </div>
            <span className="font-mono text-green-700 text-sm">&#8377;{day.transport.cost_inr?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Packing tip */}
      {day.packing_tip && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/5 border border-blue-600/10">
          <Shirt size={14} className="text-blue-600" />
          <p className="text-xs text-gray-700">{day.packing_tip}</p>
        </div>
      )}
    </motion.div>
  )
}


/* ═══════════════════ ESSENTIALS VIEW ═══════════════════ */
function EssentialsView({ essentials, transport, festivals }) {
  const sections = [
    { icon: Shield, title: 'Visa for Indians', content: essentials.visa_for_indians, extra: essentials.visa_cost_inr ? `Cost: ₹${essentials.visa_cost_inr.toLocaleString('en-IN')}` : null },
    { icon: Banknote, title: 'Money & Currency', content: essentials.currency_tips, extra: essentials.atm_availability },
    { icon: Sun, title: 'Best Time to Visit', content: essentials.best_time_to_visit },
    { icon: Globe, title: 'Local Customs', content: essentials.local_customs },
    { icon: Stethoscope, title: 'Health & Safety', content: essentials.health_precautions },
    { icon: Phone, title: 'SIM Card', content: essentials.sim_card_tip },
  ].filter((s) => s.content)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
      <h2 className="font-display text-2xl font-bold">Travel Essentials</h2>

      {festivals?.length > 0 && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
          <p className="text-xs font-semibold text-amber-400 mb-2">Festivals & Events</p>
          {festivals.map((f, i) => (
            <p key={i} className="text-sm"><span className="font-semibold">{f.name}</span> {f.date && `— ${f.date}`} {f.note && <span className="text-gray-700"> · {f.note}</span>}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(({ icon: Icon, title, content, extra }, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Icon size={16} className="text-blue-600" />
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{content}</p>
            {extra && <p className="text-xs text-green-700">{extra}</p>}
          </div>
        ))}
      </div>

      {essentials.emergency_contacts && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs font-semibold text-red-500 mb-2">Emergency Contacts</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {essentials.emergency_contacts.police && <p>Police: <span className="font-mono">{essentials.emergency_contacts.police}</span></p>}
            {essentials.emergency_contacts.ambulance && <p>Ambulance: <span className="font-mono">{essentials.emergency_contacts.ambulance}</span></p>}
            {essentials.emergency_contacts.indian_embassy && <p>Embassy: <span className="font-mono">{essentials.emergency_contacts.indian_embassy}</span></p>}
          </div>
        </div>
      )}

      {(transport.suggested_trains?.length > 0 || transport.suggested_flights?.length > 0) && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold">Getting There</h3>
          {transport.suggested_flights?.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <Plane size={16} className="text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{f.route}</p>
                <p className="text-xs text-gray-700">{f.airlines?.join(', ')}</p>
                {f.booking_tip && <p className="text-xs text-amber-400">{f.booking_tip}</p>}
              </div>
              <span className="font-mono text-green-700 text-sm">&#8377;{f.approx_cost_inr?.toLocaleString('en-IN')}</span>
            </div>
          ))}
          {transport.suggested_trains?.map((t, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3">
              <Train size={16} className="text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.train_name} <span className="text-gray-700 font-mono text-xs">#{t.train_number}</span></p>
                <p className="text-xs text-gray-700">{t.from} → {t.to} · {t.duration} · {t.class_recommended}</p>
              </div>
              <span className="font-mono text-green-700 text-sm">&#8377;{t.approx_cost_inr?.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}


/* ═══════════════════ PACKING VIEW ═══════════════════ */
function PackingView({ packing }) {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wandermind-packing') || '{}') } catch { return {} }
  })

  const toggle = (key) => {
    const next = { ...checked, [key]: !checked[key] }
    setChecked(next)
    localStorage.setItem('wandermind-packing', JSON.stringify(next))
  }

  const categories = [
    { key: 'essentials', label: 'Essentials', icon: '🎒' },
    { key: 'clothes', label: 'Clothes', icon: '👕' },
    { key: 'documents', label: 'Documents', icon: '📄' },
    { key: 'tech', label: 'Tech & Gadgets', icon: '📱' },
  ]

  const total = categories.reduce((s, c) => s + (packing[c.key]?.length || 0), 0)
  const done = Object.values(checked).filter(Boolean).length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Packing List</h2>
        <span className="text-sm text-gray-700">{done}/{total} packed</span>
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(({ key, label, icon }) => {
          const items = packing[key]
          if (!items?.length) return null
          return (
            <div key={key} className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">{icon} {label}</h3>
              <div className="space-y-1">
                {items.map((item, i) => {
                  const id = `${key}-${item}`
                  return (
                    <label key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] cursor-pointer group transition-colors">
                      <input type="checkbox" checked={!!checked[id]} onChange={() => toggle(id)}
                             className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-600/50 bg-transparent" />
                      <span className={`text-sm group-hover:text-white transition-colors ${checked[id] ? 'line-through text-gray-700' : 'text-gray-700'}`}>{item}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
