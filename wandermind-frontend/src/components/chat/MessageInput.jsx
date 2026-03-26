import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { useTripStore } from '../../store/tripStore'

const QUICK_PROMPTS = [
  'Plan a 3-day trip to Goa for 2 people in ₹30,000',
  '5 din ka Thailand trip ₹80,000 budget',
  'Weekend getaway from Mumbai under ₹15,000',
  'Bali trip for honeymoon, 7 days, luxury budget',
]

export default function MessageInput({ onSend, disabled, prefillText, onClearPrefill }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)
  const isLoading = useTripStore((s) => s.isLoading)

  useEffect(() => {
    if (prefillText) {
      setText(prefillText)
      onClearPrefill?.()
      textareaRef.current?.focus()
    }
  }, [prefillText, onClearPrefill])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }
  }, [text])

  return (
    <div className="border-t border-gray-200 bg-white/90 backdrop-blur-xl">
      {/* Quick prompts */}
      {!disabled && !text && (
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setText(prompt)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full
                         bg-gray-100 border border-gray-200 hover:bg-blue-50 hover:border-blue-300
                         text-gray-700 hover:text-blue-700 transition-colors whitespace-nowrap font-bold"
            >
              <Sparkles size={10} className="inline mr-1 text-blue-500" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Plan your dream trip... (e.g., '4 din ka Goa trip, ₹45,000 budget')"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium
                     text-gray-900 placeholder:text-gray-700 focus:outline-none focus:border-blue-500
                     focus:ring-2 focus:ring-blue-100
                     resize-none transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="p-3 rounded-xl bg-blue-600
                     text-white disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all
                     active:scale-95 flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
