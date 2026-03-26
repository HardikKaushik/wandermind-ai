import { useState } from 'react'
import { Hotel, Wifi, Car, Utensils, Waves, Leaf, ExternalLink, Phone, MapPin, ChevronDown, ChevronUp, Star } from 'lucide-react'
import PhotoCard from '../shared/PhotoCard'
import RatingBadge from '../shared/RatingBadge'

const AMENITY_ICONS = {
  wifi: Wifi, 'free wifi': Wifi, parking: Car, 'free parking': Car,
  restaurant: Utensils, pool: Waves, 'swimming pool': Waves,
  spa: Leaf,
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

export default function HotelCard({ hotel, onEdit, destination }) {
  const [showBooking, setShowBooking] = useState(false)
  if (!hotel?.name) return null

  const platforms = hotel.booking_platforms || []

  return (
    <div className="glass rounded-xl overflow-hidden">
      {hotel.photo_url && (
        <PhotoCard
          src={hotel.photo_url}
          alt={hotel.name}
          className="h-36"
          mapsQuery={hotel.address || hotel.name}
        />
      )}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-sm">{hotel.name}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(hotel.stars || 0)].map((_, i) => (
                <span key={i} className="text-amber-700 text-xs">&#9733;</span>
              ))}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono text-green-700 text-sm font-semibold">
              &#8377;{hotel.price_per_night_inr?.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-gray-700">per night</p>
          </div>
        </div>

        <RatingBadge rating={hotel.rating} reviews={hotel.review_count} />

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 5).map((a, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100
                                       text-gray-700 border border-gray-200">
                {a}
              </span>
            ))}
          </div>
        )}

        {hotel.veg_friendly && (
          <span className="inline-flex items-center gap-1 text-xs text-green-700">
            <Leaf size={10} /> Veg-friendly
          </span>
        )}

        {/* Contact details */}
        <div className="space-y-1">
          {hotel.contact_phone && (
            <a href={`tel:${hotel.contact_phone}`} className="flex items-center gap-1 text-xs text-gray-700 hover:text-blue-600">
              <Phone size={9} /> {hotel.contact_phone}
            </a>
          )}
          {hotel.address && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}`}
               target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 text-xs text-gray-700 hover:text-blue-600 truncate">
              <MapPin size={9} /> {hotel.address}
            </a>
          )}
        </div>

        {/* Booking toggle */}
        {platforms.length > 0 && (
          <>
            <button
              onClick={() => setShowBooking(!showBooking)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors w-full"
            >
              {showBooking ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              {showBooking ? 'Hide booking' : 'Book now — compare prices'}
            </button>
            {showBooking && (
              <div className="space-y-1 pt-1">
                {platforms.map((p, i) => (
                  <a
                    key={i}
                    href={p.url_hint || getBookingUrl(p.platform, hotel.name, destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-2 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-gray-200 transition-colors text-xs"
                  >
                    <span className="text-gray-700 font-medium">{p.platform}</span>
                    <span className="flex items-center gap-1 font-mono text-green-700 font-semibold">
                      &#8377;{p.estimated_price_inr?.toLocaleString('en-IN')}
                      <ExternalLink size={8} />
                    </span>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            &#9998; Change hotel
          </button>
        )}
      </div>
    </div>
  )
}
