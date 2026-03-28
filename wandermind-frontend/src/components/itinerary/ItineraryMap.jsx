import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2, AlertCircle, Maximize2 } from 'lucide-react'

// Well-known destination coordinates (city-level)
const DESTINATION_COORDS = {
  'goa': [15.4909, 73.8278],
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'hyderabad': [17.3850, 78.4867],
  'pune': [18.5204, 73.8567],
  'jaipur': [26.9124, 75.7873],
  'udaipur': [24.5854, 73.7125],
  'agra': [27.1767, 78.0081],
  'varanasi': [25.3176, 82.9739],
  'amritsar': [31.6340, 74.8723],
  'shimla': [31.1048, 77.1734],
  'manali': [32.2396, 77.1887],
  'rishikesh': [30.0869, 78.2676],
  'darjeeling': [27.0360, 88.2627],
  'mysore': [12.2958, 76.6394],
  'ooty': [11.4102, 76.6950],
  'kochi': [9.9312, 76.2673],
  'kerala': [10.8505, 76.2711],
  'pondicherry': [11.9416, 79.8083],
  'leh': [34.1526, 77.5771],
  'ladakh': [34.1526, 77.5771],
  'andaman': [11.7401, 92.6586],
  'bangkok': [13.7563, 100.5018],
  'thailand': [13.7563, 100.5018],
  'phuket': [7.8804, 98.3923],
  'chiang mai': [18.7883, 98.9853],
  'bali': [-8.3405, 115.0920],
  'singapore': [1.3521, 103.8198],
  'dubai': [25.2048, 55.2708],
  'paris': [48.8566, 2.3522],
  'london': [51.5074, -0.1278],
  'tokyo': [35.6762, 139.6503],
  'new york': [40.7128, -74.0060],
  'rome': [41.9028, 12.4964],
  'barcelona': [41.3874, 2.1686],
  'istanbul': [41.0082, 28.9784],
  'sydney': [-33.8688, 151.2093],
  'maldives': [3.2028, 73.2207],
  'sri lanka': [7.8731, 80.7718],
  'kathmandu': [27.7172, 85.3240],
  'nepal': [27.7172, 85.3240],
  'hanoi': [21.0278, 105.8342],
  'vietnam': [21.0278, 105.8342],
  'hawaii': [19.8968, -155.5828],
  'los angeles': [34.0522, -118.2437],
  'amsterdam': [52.3676, 4.9041],
  'cairo': [30.0444, 31.2357],
}

// Get destination center coords
function getDestinationCenter(destination) {
  if (!destination) return [20, 78]
  const lower = destination.toLowerCase().trim()
  // Exact match
  if (DESTINATION_COORDS[lower]) return DESTINATION_COORDS[lower]
  // Partial match
  for (const [key, coords] of Object.entries(DESTINATION_COORDS)) {
    if (lower.includes(key) || key.includes(lower)) return coords
  }
  return [20, 78] // default India
}

// Geocode a place using Nominatim, biased to destination area
const geocodeCache = {}
async function geocodePlace(query, destinationCenter, destinationName) {
  if (!query) return null
  const lower = query.toLowerCase().trim()
  if (geocodeCache[lower]) return geocodeCache[lower]

  // Always append destination name to improve geocoding accuracy
  const searchQuery = query.toLowerCase().includes(destinationName?.toLowerCase() || '')
    ? query
    : `${query}, ${destinationName}`

  try {
    const [lat, lon] = destinationCenter
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&viewbox=${lon-1},${lat+1},${lon+1},${lat-1}&bounded=0`,
      { headers: { 'User-Agent': 'WanderMind-TravelPlanner/1.0' } }
    )
    const data = await res.json()
    if (data?.[0]) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      // Sanity check: if result is more than 5 degrees away from destination, it's wrong
      const dist = Math.abs(coords[0] - lat) + Math.abs(coords[1] - lon)
      if (dist < 5) {
        geocodeCache[lower] = coords
        return coords
      }
    }
  } catch (e) {
    console.warn('Geocoding failed for:', query, e)
  }

  // Fallback: add small random offset from destination center so markers spread out
  const offset = () => (Math.random() - 0.5) * 0.04
  const fallback = [destinationCenter[0] + offset(), destinationCenter[1] + offset()]
  geocodeCache[lower] = fallback
  return fallback
}

// Day colors
const DAY_COLORS = [
  '#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED',
  '#DB2777', '#0891B2', '#EA580C', '#4F46E5', '#65A30D',
]

const TYPE_ICONS = {
  hotel: '🏨',
  restaurant: '🍽️',
  temple: '🛕',
  beach: '🏖️',
  museum: '🏛️',
  adventure: '🎯',
  shopping: '🛒',
  nature: '🌿',
  nightlife: '🌙',
  market: '🏪',
  activity: '📍',
}

export default function ItineraryMap({ itinerary, activeDay, onSelectDay }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)

  const destinationCenter = getDestinationCenter(itinerary?.destination)
  const destinationName = itinerary?.destination || ''

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    const L = window.L
    if (!L) { setError('Map library not loaded'); setLoading(false); return }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
    }).setView(destinationCenter, 12)

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Clean modern tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Geocode and place markers
  useEffect(() => {
    if (!mapInstanceRef.current || !itinerary?.days?.length) return
    const L = window.L
    const map = mapInstanceRef.current

    async function loadMarkers() {
      setLoading(true)
      setError(null)

      // Clear existing
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      const allCoords = []
      const resolvedMarkers = []

      for (const day of itinerary.days) {
        const dayIdx = day.day - 1
        const color = DAY_COLORS[dayIdx % DAY_COLORS.length]

        // Collect all places
        const places = []

        if (day.hotel?.name) {
          places.push({
            name: day.hotel.name,
            query: day.hotel.address || day.hotel.name,
            type: 'hotel',
            detail: `⭐ ${day.hotel.rating || '—'} · ₹${day.hotel.price_per_night_inr?.toLocaleString('en-IN') || '—'}/night`,
            rating: day.hotel.rating,
            imageKeyword: day.hotel.image_keyword || day.hotel.name,
            photoUrl: day.hotel.photo_url,
          })
        }

        for (const act of (day.activities || [])) {
          places.push({
            name: act.name,
            query: act.maps_query || act.address || act.name,
            type: act.type || 'activity',
            detail: `⭐ ${act.rating || '—'} · ${act.duration_hours || '—'}h · ₹${act.cost_inr?.toLocaleString('en-IN') || '0'}`,
            rating: act.rating,
            timeSlot: act.time_slot,
            imageKeyword: act.image_keyword || act.name,
            photoUrl: act.photo_url,
          })
        }

        for (const meal of (day.meals || [])) {
          places.push({
            name: meal.place_name,
            query: meal.maps_query || meal.address || meal.place_name,
            type: 'restaurant',
            detail: `${meal.cuisine || ''} · ₹${meal.cost_per_person_inr?.toLocaleString('en-IN') || '—'}/person`,
            rating: meal.rating,
            mealTime: meal.meal_time,
            imageKeyword: meal.image_keyword || meal.place_name,
            photoUrl: meal.photo_url,
          })
        }

        // Geocode each — add small delay between calls to respect Nominatim rate limits
        for (let i = 0; i < places.length; i++) {
          const place = places[i]
          if (i > 0) await new Promise(r => setTimeout(r, 300))

          const coords = await geocodePlace(place.query, destinationCenter, destinationName)
          if (!coords) continue

          allCoords.push(coords)
          const typeIcon = TYPE_ICONS[place.type] || '📍'

          // Custom marker
          const iconHtml = `
            <div style="
              position: relative;
              width: 36px; height: 36px;
            ">
              <div style="
                background: ${color};
                color: white;
                border: 3px solid white;
                border-radius: 50%;
                width: 36px; height: 36px;
                display: flex; align-items: center; justify-content: center;
                font-size: 15px;
                box-shadow: 0 3px 12px rgba(0,0,0,0.25);
                cursor: pointer;
              ">${typeIcon}</div>
              <div style="
                position: absolute;
                top: -8px; right: -8px;
                background: white;
                color: ${color};
                border: 2px solid ${color};
                border-radius: 50%;
                width: 18px; height: 18px;
                display: flex; align-items: center; justify-content: center;
                font-size: 9px; font-weight: 800;
                font-family: 'Nunito', sans-serif;
              ">${day.day}</div>
            </div>
          `

          const icon = L.divIcon({
            html: iconHtml,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -22],
            className: 'custom-marker',
          })

          // Build photo URL — prefer photo_url from API, fallback to Unsplash source
          const imgKeyword = encodeURIComponent(place.imageKeyword || place.name)
          const photoSrc = place.photoUrl || `https://source.unsplash.com/400x200/?${imgKeyword}`

          const marker = L.marker(coords, { icon })
            .addTo(map)
            .bindPopup(`
              <div style="font-family: 'Nunito', sans-serif; min-width: 260px; max-width: 300px; padding: 0; overflow: hidden; border-radius: 12px;">
                <div style="position: relative; width: 100%; height: 140px; overflow: hidden; background: #F1F5F9;">
                  <img
                    src="${photoSrc}"
                    alt="${place.name}"
                    style="width: 100%; height: 140px; object-fit: cover; display: block;"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div style="display: none; width: 100%; height: 140px; align-items: center; justify-content: center; background: linear-gradient(135deg, #EFF6FF, #DBEAFE); position: absolute; top: 0; left: 0;">
                    <span style="font-size: 36px;">${typeIcon}</span>
                  </div>
                  <div style="position: absolute; top: 8px; left: 8px; display: flex; gap: 4px;">
                    <span style="
                      background: ${color}; color: white; border-radius: 6px;
                      padding: 3px 8px; font-size: 10px; font-weight: 700;
                      text-transform: uppercase; letter-spacing: 0.5px;
                      backdrop-filter: blur(4px);
                    ">Day ${day.day}</span>
                    <span style="
                      background: rgba(255,255,255,0.9); color: #475569; border-radius: 6px;
                      padding: 3px 8px; font-size: 10px; font-weight: 600;
                      backdrop-filter: blur(4px);
                    ">${place.type}</span>
                  </div>
                </div>
                <div style="padding: 10px 12px 12px;">
                  <div style="font-size: 15px; font-weight: 800; color: #0F172A; margin-bottom: 3px; line-height: 1.3;">
                    ${place.name}
                  </div>
                  <div style="font-size: 12px; color: #475569; margin-bottom: 10px;">
                    ${place.detail}
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query + ', ' + destinationName)}"
                       target="_blank" rel="noopener"
                       style="
                         display: inline-flex; align-items: center; gap: 4px;
                         padding: 5px 12px; background: ${color}; color: white;
                         border-radius: 8px; font-size: 11px; font-weight: 700;
                         text-decoration: none; flex: 1; justify-content: center;
                       ">
                      📍 Google Maps
                    </a>
                    <a href="https://www.google.com/search?q=${encodeURIComponent(place.name + ' ' + destinationName)}&tbm=isch"
                       target="_blank" rel="noopener"
                       style="
                         display: inline-flex; align-items: center; gap: 4px;
                         padding: 5px 12px; background: #F1F5F9; color: #475569;
                         border-radius: 8px; font-size: 11px; font-weight: 700;
                         text-decoration: none;
                       ">
                      🖼️ Photos
                    </a>
                  </div>
                </div>
              </div>
            `, { maxWidth: 320, minWidth: 260, className: 'wandermind-popup', closeButton: true })

          markersRef.current.push(marker)
          resolvedMarkers.push({ ...place, coords, day: day.day, color })
        }
      }

      // Fit to all markers with good zoom
      if (allCoords.length > 1) {
        const bounds = L.latLngBounds(allCoords)
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
      } else if (allCoords.length === 1) {
        map.setView(allCoords[0], 14)
      } else {
        map.setView(destinationCenter, 12)
      }

      setMarkers(resolvedMarkers)
      setLoading(false)
    }

    loadMarkers()
  }, [itinerary])

  // When active day changes, zoom to that day's markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markers.length) return
    const L = window.L
    const map = mapInstanceRef.current
    const dayMarkers = markers.filter(m => m.day === activeDay)
    if (dayMarkers.length > 1) {
      map.fitBounds(L.latLngBounds(dayMarkers.map(m => m.coords)), { padding: [60, 60], maxZoom: 15, animate: true })
    } else if (dayMarkers.length === 1) {
      map.setView(dayMarkers[0].coords, 15, { animate: true })
    }
  }, [activeDay, markers])

  // Reset view to show all markers
  const handleResetView = () => {
    if (!mapInstanceRef.current || !markers.length) return
    const L = window.L
    const bounds = L.latLngBounds(markers.map(m => m.coords))
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true })
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Map */}
      <div ref={mapRef} className="flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700" style={{ minHeight: 500 }} />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-[1000]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200">Mapping your trip places...</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Finding locations in {destinationName}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex items-center justify-center rounded-xl z-[1000]">
          <div className="flex flex-col items-center gap-2 px-6">
            <AlertCircle size={28} className="text-red-500" />
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{error}</p>
          </div>
        </div>
      )}

      {/* Legend - top left on desktop, bottom left on mobile */}
      <div className="absolute top-3 left-3 z-[400] bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden hidden sm:block" style={{ maxWidth: 220 }}>
        <div className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
          <p className="text-xs font-extrabold text-gray-900 dark:text-slate-100 uppercase tracking-wider">📍 Places by Day</p>
        </div>
        <div className="p-2 space-y-0.5 max-h-[300px] overflow-y-auto">
          {(itinerary?.days || []).map((day, idx) => {
            const color = DAY_COLORS[idx % DAY_COLORS.length]
            const dayMarkerCount = markers.filter(m => m.day === day.day).length
            return (
              <button
                key={day.day}
                onClick={() => onSelectDay?.(day.day)}
                className={`flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all ${
                  activeDay === day.day ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800' : 'hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0"
                  style={{ background: color }}
                >
                  {day.day}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold text-gray-900 dark:text-slate-100 text-[11px]">{day.theme}</p>
                  <p className="text-[10px] text-gray-500">{dayMarkerCount} places</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats bar - bottom left */}
      <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow px-3 py-2 flex items-center gap-2">
          <MapPin size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{markers.length} places</span>
          <span className="text-xs text-gray-500 dark:text-slate-400">across {itinerary?.days?.length || 0} days</span>
        </div>
        <button
          onClick={handleResetView}
          className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow px-3 py-2 flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          title="Show all places"
        >
          <Maximize2 size={13} className="text-gray-700" />
          <span className="text-xs font-semibold text-gray-700">Fit All</span>
        </button>
      </div>
    </div>
  )
}
