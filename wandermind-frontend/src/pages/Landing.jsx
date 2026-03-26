import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Globe, IndianRupee, MessageSquare, Map,
  Train as TrainIcon, Share2, Languages, Users, ArrowRight, Plane, Search
} from 'lucide-react'

const FEATURES = [
  { icon: MessageSquare, title: 'Chat to Plan', desc: 'Just describe your dream trip and get a complete itinerary' },
  { icon: IndianRupee, title: 'INR-Native Budget', desc: 'All prices in Rupees with live budget tracking' },
  { icon: Languages, title: 'Hindi & Hinglish', desc: '"Goa ka 3 din trip banao" — we understand!' },
  { icon: TrainIcon, title: 'Indian Transport', desc: 'Train suggestions, flight prices, IRCTC booking tips' },
  { icon: Map, title: 'Real Photos', desc: 'See actual destination photos inline while chatting' },
  { icon: Share2, title: 'WhatsApp Share', desc: 'Share your itinerary with travel companions instantly' },
  { icon: Users, title: 'Group Planning', desc: 'Resolve conflicts between group travel preferences' },
  { icon: Globe, title: 'Festival Alerts', desc: 'Know about local festivals during your travel dates' },
]

const SAMPLE_PROMPTS = [
  { text: 'Plan a 5-day trip to Bali for 2 in ₹80,000', icon: '🏝️' },
  { text: 'Goa mein 3 din ka trip, budget ₹30,000', icon: '🏖️' },
  { text: 'Honeymoon in Maldives, luxury budget', icon: '💕' },
  { text: 'Weekend getaway from Mumbai under ₹15,000', icon: '🚗' },
  { text: '7 days Europe trip for family of 4', icon: '🏰' },
  { text: 'Thailand solo backpacking, ₹40,000', icon: '🎒' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌍</span>
          <span className="font-display font-extrabold text-lg gradient-text">WanderMind</span>
        </div>
        <button
          onClick={() => navigate('/planner')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold
                     hover:bg-blue-700 transition-colors"
        >
          Start Planning
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-6">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-xs text-blue-700 font-bold">Powered by AI</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
            Plan Your Dream Trip
            <br />
            <span className="gradient-text">in Seconds</span>
          </h1>

          <p className="text-gray-700 max-w-2xl mx-auto mb-8 text-lg font-medium">
            The smartest AI travel planner built for Indian travelers.
            Just chat, and get a complete itinerary with hotels, activities,
            food, transport — all in &#8377; INR.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/planner')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
                         bg-blue-600 text-white
                         font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200
                         transition-all active:scale-[0.98]"
            >
              Start Planning <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate('/planner', { state: { openFlights: true } })}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl
                         bg-white border-2 border-blue-200 text-blue-700
                         font-bold text-lg hover:bg-blue-50 hover:border-blue-400
                         transition-all active:scale-[0.98]"
            >
              <Plane size={20} /> Flights
            </button>
            <button
              onClick={() => navigate('/planner', { state: { openTrains: true } })}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl
                         bg-white border-2 border-green-200 text-green-700
                         font-bold text-lg hover:bg-green-50 hover:border-green-400
                         transition-all active:scale-[0.98]"
            >
              <TrainIcon size={20} /> Trains
            </button>
          </div>
        </motion.div>
      </section>

      {/* Sample prompts */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <p className="text-center text-xs text-gray-700 mb-4 font-bold uppercase tracking-wider">Try asking:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SAMPLE_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => navigate('/planner', { state: { prompt: p.text } })}
              className="flex items-center gap-2 px-4 py-2 rounded-full
                         bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300
                         text-sm text-gray-700 hover:text-blue-700 transition-colors font-bold"
            >
              <span>{p.icon}</span>
              {p.text}
            </button>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="font-display text-2xl font-extrabold text-center mb-10 text-gray-900">
          Why <span className="gradient-text">WanderMind</span>?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="rounded-xl p-5 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
            >
              <f.icon
                size={24}
                className="text-blue-600 mb-3 group-hover:scale-110 transition-transform"
              />
              <h3 className="font-extrabold text-sm mb-1 text-gray-900">{f.title}</h3>
              <p className="text-xs text-gray-700 font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-700 font-bold">
          WanderMind AI · Built for Indian Travelers
        </p>
      </footer>
    </div>
  )
}
