import { useState } from 'react'
import { Leaf, Star, MapPin, Phone, Clock, Navigation, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const MEAL_ICONS = {
  breakfast: '🍳', lunch: '🍛', dinner: '🍽️', snacks: '🍿',
}

export default function MealCard({ meal, onEdit, destination }) {
  const [showAlts, setShowAlts] = useState(false)
  if (!meal) return null

  const alts = meal.alternatives || []

  return (
    <div className="glass rounded-lg p-2.5 space-y-1.5 hover:bg-white/[0.06] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-700">
          {MEAL_ICONS[meal.meal_time] || '🍽️'} {meal.meal_time}
        </span>
        <span className="font-mono text-sm text-green-700">
          &#8377;{meal.cost_per_person_inr?.toLocaleString('en-IN')}/pp
        </span>
      </div>

      <h5 className="text-xs font-semibold truncate">{meal.place_name}</h5>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-700">{meal.cuisine}</span>
        {meal.rating && (
          <span className="flex items-center gap-0.5 text-xs text-amber-700">
            <Star size={8} className="fill-amber-500" /> {meal.rating}
          </span>
        )}
        {meal.distance_from_hotel && (
          <span className="flex items-center gap-0.5 text-xs text-gray-700">
            <Navigation size={7} /> {meal.distance_from_hotel}
          </span>
        )}
      </div>

      {meal.must_try_dish && (
        <p className="text-xs text-amber-700">
          Must try: {meal.must_try_dish}
        </p>
      )}

      {meal.opening_hours && (
        <p className="flex items-center gap-0.5 text-xs text-gray-700">
          <Clock size={7} /> {meal.opening_hours}
        </p>
      )}

      {/* Contact & Address */}
      <div className="space-y-0.5">
        {meal.address && (
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meal.maps_query || meal.place_name + ' ' + (destination || ''))}`}
             target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-0.5 text-xs text-gray-700 hover:text-blue-600 truncate">
            <MapPin size={7} /> {meal.address}
          </a>
        )}
        {meal.contact_phone && (
          <a href={`tel:${meal.contact_phone}`} className="flex items-center gap-0.5 text-xs text-gray-700 hover:text-blue-600">
            <Phone size={7} /> {meal.contact_phone}
          </a>
        )}
      </div>

      <div className="flex items-center gap-2">
        {meal.is_vegetarian_friendly && (
          <span className="flex items-center gap-0.5 text-xs text-green-700">
            <Leaf size={8} /> Veg
          </span>
        )}
        {meal.is_vegan_friendly && (
          <span className="text-xs text-emerald-400">Vegan</span>
        )}
      </div>

      {/* Alternative restaurants */}
      {alts.length > 0 && (
        <>
          <button
            onClick={() => setShowAlts(!showAlts)}
            className="flex items-center gap-0.5 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showAlts ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
            {alts.length} other option{alts.length > 1 ? 's' : ''}
          </button>
          {showAlts && (
            <div className="space-y-1 pt-1 border-t border-gray-200">
              {alts.map((alt, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-700 truncate">{alt.place_name}</p>
                    <div className="flex items-center gap-1 text-gray-700">
                      <span>{alt.cuisine}</span>
                      {alt.rating && <span className="text-amber-700">★ {alt.rating}</span>}
                      {alt.distance_from_hotel && <span>· {alt.distance_from_hotel}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="font-mono text-green-700">₹{alt.cost_per_person_inr}</span>
                    {(alt.maps_query || alt.address) && (
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(alt.maps_query || alt.place_name)}`}
                         target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:text-blue-700">
                        <ExternalLink size={8} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {onEdit && (
        <button
          onClick={onEdit}
          className="text-xs text-blue-600 hover:text-blue-700 ml-auto block"
        >
          &#9998;
        </button>
      )}
    </div>
  )
}
