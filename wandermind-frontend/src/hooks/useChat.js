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
  const sessionReady = useRef(false)
  const sessionPromise = useRef(null)

  const startSession = useCallback(async (initialData = {}) => {
    // Prevent duplicate session starts
    if (sessionPromise.current) return sessionPromise.current

    sessionPromise.current = (async () => {
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
        sessionReady.current = true
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
        sessionReady.current = true
        return fakeId
      }
    })()

    const result = await sessionPromise.current
    sessionPromise.current = null
    return result
  }, [addMessage, setSessionId, setTripId])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    // Ensure session is ready before sending
    let currentSessionId = useTripStore.getState().sessionId
    if (!currentSessionId || !sessionReady.current) {
      setTyping(true)
      currentSessionId = await startSession()
      if (!currentSessionId) {
        setTyping(false)
        return
      }
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
        toast('Using demo mode — AI is temporarily rate-limited', { icon: '⚠️', duration: 5000 })
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
      } else if (status === 500 && errMsg?.includes('429')) {
        // Rate limit hit — fall back to demo for this message
        console.warn('Rate limit hit, using demo mode for this message')
        demoMode.current = true
        toast('AI rate-limited — using curated data. Try again later for live AI!', { icon: '⚠️', duration: 5000 })
        const demoResult = generateDemoResponse(text)
        addMessage({
          role: 'assistant',
          content: demoResult.message + '\n\n(Note: Generated from curated data as AI is temporarily rate-limited. You can modify this anytime!)',
          itinerary_snapshot: demoResult.itinerary,
          change_summary: demoResult.change_summary,
          timestamp: new Date().toISOString(),
        })
        if (demoResult.itinerary) {
          setItinerary(demoResult.itinerary)
        }
      } else if (err.response?.data?.error) {
        // Other API error — try demo fallback instead of showing error
        demoMode.current = true
        const demoResult = generateDemoResponse(text)
        addMessage({
          role: 'assistant',
          content: demoResult.message + '\n\n(Note: Generated from curated data as AI is temporarily rate-limited. You can modify this anytime!)',
          itinerary_snapshot: demoResult.itinerary,
          change_summary: demoResult.change_summary,
          timestamp: new Date().toISOString(),
        })
        if (demoResult.itinerary) {
          setItinerary(demoResult.itinerary)
        }
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
