import { useState, useEffect } from 'react'

const LOADING_MESSAGES = [
  'Planning your trip...',
  'Finding the best places...',
  'Checking hotel availability...',
  'Calculating budget...',
  'Creating your itinerary...',
]

export default function TypingIndicator() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-start gap-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700
                      flex items-center justify-center text-sm flex-shrink-0 text-white font-bold">
        W
      </div>
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="typing-dot w-2 h-2 bg-blue-600 rounded-full" />
            <span className="typing-dot w-2 h-2 bg-blue-600 rounded-full" />
            <span className="typing-dot w-2 h-2 bg-blue-600 rounded-full" />
          </div>
          <span className="text-xs text-gray-500 ml-1 transition-opacity duration-300">
            {LOADING_MESSAGES[msgIndex]}
          </span>
        </div>
      </div>
    </div>
  )
}
