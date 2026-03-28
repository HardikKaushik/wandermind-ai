import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MessageSquare, Map, Info, CheckCircle, PanelLeftClose,
  PanelRightClose, ArrowLeft, Sparkles
} from 'lucide-react'
import { useTripStore } from '../store/tripStore'
import { useChatStore } from '../store/chatStore'
import { useChat } from '../hooks/useChat'
import ChatWindow from '../components/chat/ChatWindow'
import ItineraryPanel from '../components/itinerary/ItineraryPanel'
import BudgetTracker from '../components/budget/BudgetTracker'
import TravelEssentials from '../components/travel-info/TravelEssentials'
import FinalItinerary from '../components/itinerary/FinalItinerary'
import LanguageToggle from '../components/language/LanguageToggle'
import FestivalAlert from '../components/travel-info/FestivalAlert'
import TransportSearch from '../components/transport/TransportSearch'

export default function Planner() {
  const location = useLocation()
  const navigate = useNavigate()
  const itinerary = useTripStore((s) => s.itinerary)
  const theme = useTripStore((s) => s.theme)
  const toggleTheme = useTripStore((s) => s.toggleTheme)
  const { sendMessage, startSession } = useChat()

  const [showFinal, setShowFinal] = useState(false)
  const [showTransport, setShowTransport] = useState(false)
  const [transportTab, setTransportTab] = useState('flights')
  const [leftPanel, setLeftPanel] = useState(true)
  const [rightPanel, setRightPanel] = useState(true)
  const [mobileTab, setMobileTab] = useState('chat')
  const [prefillText, setPrefillText] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    useTripStore.getState().resetTrip()
    useChatStore.getState().clearMessages()

    if (location.state?.openFlights) {
      setShowTransport(true)
      setTransportTab('flights')
      window.history.replaceState({}, '')
    }
    if (location.state?.openTrains) {
      setShowTransport(true)
      setTransportTab('trains')
      window.history.replaceState({}, '')
    }

    const prompt = location.state?.prompt
    if (prompt) {
      const init = async () => {
        await startSession()
        setTimeout(() => sendMessage(prompt), 500)
      }
      init()
      window.history.replaceState({}, '')
    } else {
      startSession()
    }
  }, [])

  const handleQuickEdit = useCallback((dayNum, section) => {
    const prompt = useTripStore.getState().getQuickEditPrompt(dayNum, section)
    setPrefillText(prompt)
    setMobileTab('chat')
  }, [])

  const handleBudgetOptimize = useCallback(() => {
    const it = useTripStore.getState().itinerary
    if (!it) return
    const remaining = it.budget?.remaining_inr || 0
    const prompt = remaining < 0
      ? `I'm ₹${Math.abs(remaining).toLocaleString('en-IN')} over budget. What can I cut without ruining the trip?`
      : `Optimize my budget — I want to save more money. Current remaining: ₹${remaining.toLocaleString('en-IN')}`
    setPrefillText(prompt)
    setMobileTab('chat')
  }, [])

  const handleViewItinerary = useCallback(() => {
    setShowFinal(true)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Top navbar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-slate-700
                         bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <span className="font-display font-extrabold text-sm gradient-text hidden sm:block">
              WanderMind
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-lg transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Desktop panel toggles */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setLeftPanel(!leftPanel)}
              className={`p-1.5 rounded-lg transition-colors ${
                leftPanel ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-700 dark:text-slate-400 hover:text-gray-700'
              }`}
              title="Toggle info panel"
            >
              <PanelLeftClose size={14} />
            </button>
            <button
              onClick={() => setRightPanel(!rightPanel)}
              className={`p-1.5 rounded-lg transition-colors ${
                rightPanel ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-700 dark:text-slate-400 hover:text-gray-700'
              }`}
              title="Toggle itinerary panel"
            >
              <PanelRightClose size={14} />
            </button>
          </div>

          {/* Search Flights/Trains button */}
          <button
            onClick={() => { setShowTransport(true); setTransportTab('flights') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                       bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-600 text-blue-700 dark:text-blue-400
                       hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-slate-500 transition-all"
          >
            <span className="hidden sm:inline">✈️ Flights / 🚂 Trains</span>
            <span className="sm:hidden">✈️🚂</span>
          </button>

          {/* Finalize button */}
          {itinerary?.days?.length >= 1 && (
            <button
              onClick={() => setShowFinal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                         bg-blue-600 text-white
                         hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-blue-900/40 transition-all"
            >
              <CheckCircle size={12} />
              <span className="hidden sm:inline">Finalize Trip</span>
            </button>
          )}
        </div>
      </header>

      {/* Festival alert */}
      <FestivalAlert />

      {/* Main three-column layout (desktop) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Travel Essentials (desktop only) */}
        <AnimatePresence>
          {leftPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:flex flex-col border-r border-gray-200 dark:border-slate-700 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-slate-800/50"
            >
              <TravelEssentials />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center: Chat */}
        <main className={`flex-1 flex-col min-w-0 bg-white dark:bg-slate-900 ${
          mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
        }`}>
          <ChatWindow
            onViewItinerary={handleViewItinerary}
            prefillText={prefillText}
            onClearPrefill={() => setPrefillText('')}
          />
        </main>

        {/* Right panel: Itinerary + Budget (desktop) */}
        <AnimatePresence>
          {rightPanel && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex-col border-l border-gray-200 dark:border-slate-700 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-slate-800/50 ${
                mobileTab === 'itinerary' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-slate-700">
                <BudgetTracker onOptimize={handleBudgetOptimize} />
              </div>
              <div className="flex-1 overflow-hidden">
                <ItineraryPanel onQuickEdit={handleQuickEdit} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile: Travel Info panel */}
        {mobileTab === 'info' && (
          <div className="flex-1 lg:hidden overflow-hidden">
            <TravelEssentials />
          </div>
        )}
      </div>

      {/* Mobile bottom tabs */}
      <div className="lg:hidden flex items-center border-t border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95
                      backdrop-blur-xl flex-shrink-0">
        {[
          { key: 'chat', icon: MessageSquare, label: 'Chat' },
          { key: 'itinerary', icon: Map, label: 'Itinerary' },
          { key: 'info', icon: Info, label: 'Info' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMobileTab(tab.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-bold transition-colors ${
              mobileTab === tab.key
                ? 'text-blue-600'
                : 'text-gray-700 dark:text-slate-400'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Final itinerary modal */}
      <AnimatePresence>
        {showFinal && <FinalItinerary onClose={() => setShowFinal(false)} />}
      </AnimatePresence>

      {/* Flights / Trains modal */}
      <AnimatePresence>
        {showTransport && (
          <TransportSearch
            destination={itinerary?.destination || ''}
            travelDate={itinerary?.travel_dates?.start || ''}
            onClose={() => setShowTransport(false)}
            initialTab={transportTab}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
