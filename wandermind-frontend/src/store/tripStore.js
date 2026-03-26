import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTripStore = create(
  persist(
    (set, get) => ({
      tripId: null,
      sessionId: null,
      itinerary: null,
      isLoading: false,
      activeDay: 1,
      viewMode: 'chat', // 'chat' | 'itinerary' | 'final'
      language: 'en',

      setItinerary: (itinerary) => set({ itinerary }),
      setActiveDay: (day) => set({ activeDay: day }),
      setSessionId: (id) => set({ sessionId: id }),
      setTripId: (id) => set({ tripId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setLanguage: (lang) => set({ language: lang }),
      setLoading: (loading) => set({ isLoading: loading }),

      resetTrip: () =>
        set({
          tripId: null,
          sessionId: null,
          itinerary: null,
          activeDay: 1,
          viewMode: 'chat',
        }),

      getBudget: () => {
        const it = get().itinerary
        if (!it?.budget) return null
        return it.budget
      },

      getBudgetStatus: () => {
        const it = get().itinerary
        if (!it?.budget) return 'safe'
        const { total_inr, remaining_inr } = it.budget
        if (!total_inr) return 'safe'
        const pct = ((total_inr - remaining_inr) / total_inr) * 100
        if (pct > 90) return 'danger'
        if (pct > 70) return 'warning'
        return 'safe'
      },

      getBudgetPercentage: () => {
        const it = get().itinerary
        if (!it?.budget) return 0
        const { total_inr, remaining_inr } = it.budget
        if (!total_inr) return 0
        return Math.round(((total_inr - remaining_inr) / total_inr) * 100)
      },

      getQuickEditPrompt: (dayNum, section) => {
        const prompts = {
          hotel: `Change Day ${dayNum} hotel to something different`,
          activities: `Suggest alternative activities for Day ${dayNum}`,
          meals: `Recommend different restaurants for Day ${dayNum}`,
          transport: `Find a cheaper transport option for Day ${dayNum}`,
        }
        return prompts[section] || `Modify Day ${dayNum} ${section}`
      },
    }),
    { name: 'wandermind-trip' }
  )
)
