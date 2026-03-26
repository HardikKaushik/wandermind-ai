import { useCallback, useRef } from 'react'
import { chatApi } from '../api/chatApi'
import { useChatStore } from '../store/chatStore'
import { useTripStore } from '../store/tripStore'
import { generateDemoResponse } from '../utils/demoData'
import toast from 'react-hot-toast'

export function useChat() {
  const { addMessage, setTyping } = useChatStore()
  const { sessionId, setSessionId, setTripId, setItinerary, language } = useTripStore()
  const demoMode = useRef(false)

  const startSession = useCallback(async (initialData = {}) => {
    try {
      const res = await chatApi.startSession(initialData)
      const { session_id, trip_id, welcome_message } = res.data
      setSessionId(session_id)
      setTripId(trip_id)
      addMessage({
        role: 'assistant',
        content: welcome_message,
        timestamp: new Date().toISOString(),
      })
      demoMode.current = false
      return session_id
    } catch (err) {
      // Backend unavailable — switch to demo mode
      console.log('Backend unavailable, switching to demo mode')
      demoMode.current = true
      const fakeId = 'demo-' + Date.now()
      setSessionId(fakeId)
      setTripId(fakeId)
      addMessage({
        role: 'assistant',
        content:
          "Namaste! I'm WanderMind, your AI travel concierge. " +
          "Tell me where you want to go! For example:\n\n" +
          "- 'Plan a 5-day trip to Bali for 2 people in \u20b980,000 budget'\n" +
          "- 'Thailand 3 din ka trip \u20b960,000 mein banao'\n" +
          "- 'Weekend getaway from Mumbai under \u20b915,000'\n\n" +
          "I'll create a complete itinerary with hotels, activities, " +
          "food, and transport — all optimized for Indian travelers!",
        timestamp: new Date().toISOString(),
      })
      return fakeId
    }
  }, [addMessage, setSessionId, setTripId])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    let currentSessionId = sessionId
    if (!currentSessionId) {
      currentSessionId = await startSession()
      if (!currentSessionId) return
    }

    addMessage({
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    })

    setTyping(true)

    // Demo mode: generate mock response
    if (demoMode.current) {
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500))
      const demoResult = generateDemoResponse(text)
      addMessage({
        role: 'assistant',
        content: demoResult.message,
        itinerary_snapshot: demoResult.itinerary,
        change_summary: demoResult.change_summary,
        timestamp: new Date().toISOString(),
      })
      if (demoResult.itinerary) {
        setItinerary(demoResult.itinerary)
      }
      setTyping(false)
      return
    }

    // Real API mode
    try {
      const res = await chatApi.sendMessage(currentSessionId, text, language)
      const { message, itinerary, change_summary } = res.data

      addMessage({
        role: 'assistant',
        content: message,
        itinerary_snapshot: itinerary,
        change_summary,
        timestamp: new Date().toISOString(),
      })

      if (itinerary) {
        setItinerary(itinerary)
      }
    } catch (err) {
      const status = err.response?.status
      const errMsg = err.response?.data?.message || err.response?.data?.error

      if (status === 503 && errMsg?.includes('API key')) {
        // API key not configured — fall back to demo with notice
        console.warn('ANTHROPIC_API_KEY not set, using demo mode')
        demoMode.current = true
        toast('Using demo mode — set ANTHROPIC_API_KEY in backend .env for live AI', { icon: '⚠️', duration: 5000 })
        const demoResult = generateDemoResponse(text)
        addMessage({
          role: 'assistant',
          content: demoResult.message,
          itinerary_snapshot: demoResult.itinerary,
          change_summary: demoResult.change_summary,
          timestamp: new Date().toISOString(),
        })
        if (demoResult.itinerary) {
          setItinerary(demoResult.itinerary)
        }
      } else if (err.response?.data?.error) {
        addMessage({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errMsg}`,
          timestamp: new Date().toISOString(),
        })
        toast.error(errMsg)
      } else {
        // Network error or backend down — switch to demo
        demoMode.current = true
        const demoResult = generateDemoResponse(text)
        addMessage({
          role: 'assistant',
          content: demoResult.message,
          itinerary_snapshot: demoResult.itinerary,
          change_summary: demoResult.change_summary,
          timestamp: new Date().toISOString(),
        })
        if (demoResult.itinerary) {
          setItinerary(demoResult.itinerary)
        }
      }
    } finally {
      setTyping(false)
    }
  }, [sessionId, language, addMessage, setTyping, setItinerary, startSession])

  return { sendMessage, startSession }
}
