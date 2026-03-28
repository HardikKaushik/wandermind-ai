import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, Shield, Banknote, Sun, Stethoscope, Languages,
  Luggage, Train, Plane, PartyPopper
} from 'lucide-react'
import { useTripStore } from '../../store/tripStore'

function Accordion({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 dark:border-slate-700 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3 px-1 text-left hover:bg-white/[0.02] dark:hover:bg-slate-800/50 transition-colors"
      >
        <Icon size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-xs font-semibold flex-1">{title}</span>
        <ChevronDown
          size={12}
          className={`text-gray-700 dark:text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3 px-1 text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TravelEssentials() {
  const itinerary = useTripStore((s) => s.itinerary)

  if (!itinerary) {
    return (
      <div className="p-4 text-center">
        <Luggage size={32} className="mx-auto text-gray-700 dark:text-slate-500 mb-3" />
        <p className="text-sm text-gray-700 dark:text-slate-400">
          Travel tips and essentials will appear here once your itinerary is ready.
        </p>
      </div>
    )
  }

  const essentials = itinerary.travel_essentials || {}
  const transport = itinerary.india_transport || {}
  const packing = itinerary.packing_list || {}
  const festivals = itinerary.festivals_events || []

  return (
    <div className="h-full overflow-y-auto p-3">
      <h3 className="font-display text-sm font-bold mb-3 px-1">Travel Essentials</h3>

      {/* Visa */}
      {essentials.visa_for_indians && (
        <Accordion title="Visa for Indians" icon={Shield} defaultOpen>
          <p>{essentials.visa_for_indians}</p>
          {essentials.visa_cost_inr > 0 && (
            <p className="mt-1 font-mono text-green-700">
              Cost: &#8377;{essentials.visa_cost_inr?.toLocaleString('en-IN')}
            </p>
          )}
        </Accordion>
      )}

      {/* Money */}
      {essentials.currency_tips && (
        <Accordion title="Money Matters" icon={Banknote}>
          <p>{essentials.currency_tips}</p>
          {essentials.atm_availability && (
            <p className="mt-1"><strong>ATM:</strong> {essentials.atm_availability}</p>
          )}
          {essentials.sim_card_tip && (
            <p className="mt-1"><strong>SIM:</strong> {essentials.sim_card_tip}</p>
          )}
        </Accordion>
      )}

      {/* Best time */}
      {essentials.best_time_to_visit && (
        <Accordion title="Best Time to Visit" icon={Sun}>
          <p>{essentials.best_time_to_visit}</p>
        </Accordion>
      )}

      {/* Festivals */}
      {festivals.length > 0 && (
        <Accordion title="Festivals & Events" icon={PartyPopper}>
          <div className="space-y-2">
            {festivals.map((f, i) => (
              <div key={i} className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <p className="font-semibold text-amber-700">{f.name}</p>
                {f.date && <p className="text-gray-700">{f.date}</p>}
                {f.note && <p className="mt-0.5">{f.note}</p>}
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Health */}
      {essentials.health_precautions && (
        <Accordion title="Health & Safety" icon={Stethoscope}>
          <p>{essentials.health_precautions}</p>
          {essentials.emergency_contacts && (
            <div className="mt-2 space-y-1">
              <p className="font-semibold text-gray-700">Emergency Contacts:</p>
              {essentials.emergency_contacts.police && (
                <p>Police: {essentials.emergency_contacts.police}</p>
              )}
              {essentials.emergency_contacts.ambulance && (
                <p>Ambulance: {essentials.emergency_contacts.ambulance}</p>
              )}
              {essentials.emergency_contacts.indian_embassy && (
                <p>Indian Embassy: {essentials.emergency_contacts.indian_embassy}</p>
              )}
            </div>
          )}
        </Accordion>
      )}

      {/* Language */}
      {essentials.language_tips && (
        <Accordion title="Language Tips" icon={Languages}>
          <p>{essentials.language_tips}</p>
        </Accordion>
      )}

      {/* Local customs */}
      {essentials.local_customs && (
        <Accordion title="Local Customs" icon={Shield}>
          <p>{essentials.local_customs}</p>
        </Accordion>
      )}

      {/* India transport */}
      {(transport.suggested_trains?.length > 0 || transport.suggested_flights?.length > 0) && (
        <>
          {transport.suggested_trains?.length > 0 && (
            <Accordion title="Trains from India" icon={Train}>
              <div className="space-y-2">
                {transport.suggested_trains.map((t, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-100">
                    <p className="font-semibold">{t.train_name} ({t.train_number})</p>
                    <p className="text-gray-700">{t.from} → {t.to} · {t.duration}</p>
                    <p className="font-mono text-green-700 mt-0.5">
                      &#8377;{t.approx_cost_inr?.toLocaleString('en-IN')} ({t.class_recommended})
                    </p>
                  </div>
                ))}
              </div>
            </Accordion>
          )}

          {transport.suggested_flights?.length > 0 && (
            <Accordion title="Flights" icon={Plane}>
              <div className="space-y-2">
                {transport.suggested_flights.map((f, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-100">
                    <p className="font-semibold">{f.route}</p>
                    <p className="font-mono text-green-700">
                      &#8377;{f.approx_cost_inr?.toLocaleString('en-IN')} approx
                    </p>
                    {f.airlines && (
                      <p className="text-gray-700">{f.airlines.join(', ')}</p>
                    )}
                    {f.booking_tip && <p className="mt-0.5 text-gray-700">{f.booking_tip}</p>}
                  </div>
                ))}
              </div>
            </Accordion>
          )}
        </>
      )}

      {/* Packing list */}
      <PackingList packing={packing} />
    </div>
  )
}

function PackingList({ packing }) {
  const categories = [
    { key: 'essentials', label: 'Essentials' },
    { key: 'clothes', label: 'Clothes' },
    { key: 'documents', label: 'Documents' },
    { key: 'tech', label: 'Tech' },
  ]

  const hasItems = categories.some((c) => packing[c.key]?.length > 0)
  if (!hasItems) return null

  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wandermind-packing') || '{}')
    } catch { return {} }
  })

  const toggleItem = (item) => {
    const next = { ...checked, [item]: !checked[item] }
    setChecked(next)
    localStorage.setItem('wandermind-packing', JSON.stringify(next))
  }

  return (
    <Accordion title="Packing List" icon={Luggage}>
      <div className="space-y-3">
        {categories.map(({ key, label }) => {
          const items = packing[key]
          if (!items?.length) return null
          return (
            <div key={key}>
              <p className="font-semibold text-gray-700 mb-1">{label}</p>
              <div className="space-y-1">
                {items.map((item, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checked[`${key}-${item}`]}
                      onChange={() => toggleItem(`${key}-${item}`)}
                      className="w-3.5 h-3.5 rounded border-gray-600 text-blue-600
                                 focus:ring-blue-600/50 bg-transparent"
                    />
                    <span className={`text-xs group-hover:text-white transition-colors ${
                      checked[`${key}-${item}`] ? 'line-through text-gray-700' : ''
                    }`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Accordion>
  )
}
