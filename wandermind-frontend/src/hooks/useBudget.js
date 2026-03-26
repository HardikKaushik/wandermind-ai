import { useMemo } from 'react'
import { useTripStore } from '../store/tripStore'

export function useBudget() {
  const itinerary = useTripStore((s) => s.itinerary)

  return useMemo(() => {
    if (!itinerary?.budget) {
      return {
        total: 0,
        used: 0,
        remaining: 0,
        percentage: 0,
        status: 'safe',
        breakdown: {},
      }
    }

    const { total_inr = 0, remaining_inr = 0, breakdown = {} } = itinerary.budget
    const used = total_inr - remaining_inr
    const pct = total_inr > 0 ? Math.round((used / total_inr) * 100) : 0
    const status = pct > 90 ? 'danger' : pct > 70 ? 'warning' : 'safe'

    return {
      total: total_inr,
      used,
      remaining: remaining_inr,
      percentage: pct,
      status,
      breakdown,
    }
  }, [itinerary])
}
