import { useCallback } from 'react'
import { tripApi } from '../api/chatApi'
import { useTripStore } from '../store/tripStore'
import toast from 'react-hot-toast'

export function useTrip() {
  const { tripId, setItinerary } = useTripStore()

  const finalizeTrip = useCallback(async () => {
    if (!tripId) return null
    try {
      const res = await tripApi.finalize(tripId)
      toast.success('Trip finalized!')
      return res.data
    } catch (err) {
      toast.error('Failed to finalize trip')
      return null
    }
  }, [tripId])

  const exportTrip = useCallback(async () => {
    if (!tripId) return null
    try {
      const res = await tripApi.export(tripId)
      return res.data
    } catch (err) {
      toast.error('Failed to export trip')
      return null
    }
  }, [tripId])

  const generateWhatsAppText = useCallback((itinerary) => {
    if (!itinerary) return ''
    const lines = [`*${itinerary.destination} Trip Plan*`]
    lines.push(`${itinerary.total_days} Days`)
    if (itinerary.budget?.total_inr) {
      lines.push(`Budget: INR ${itinerary.budget.total_inr.toLocaleString('en-IN')}`)
    }
    lines.push('')
    for (const day of itinerary.days || []) {
      lines.push(`*Day ${day.day}: ${day.theme}*`)
      for (const act of day.activities || []) {
        lines.push(`  ${act.time_slot}: ${act.name} (INR ${act.cost_inr})`)
      }
      if (day.hotel?.name) {
        lines.push(`  Hotel: ${day.hotel.name} - INR ${day.hotel.price_per_night_inr}/night`)
      }
      lines.push('')
    }
    lines.push('Created with WanderMind AI')
    return lines.join('\n')
  }, [])

  return { finalizeTrip, exportTrip, generateWhatsAppText }
}
