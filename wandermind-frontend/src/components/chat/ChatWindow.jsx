import { useRef, useEffect, useState } from 'react'
import { useChatStore } from '../../store/chatStore'
import { useTripStore } from '../../store/tripStore'
import { useChat } from '../../hooks/useChat'
import ChatMessage from './ChatMessage'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow({ onViewItinerary }) {
  const messages = useChatStore((s) => s.messages)
  const isTyping = useChatStore((s) => s.isTyping)
  const { sendMessage } = useChat()
  const scrollRef = useRef(null)
  const [prefillText, setPrefillText] = useState('')

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleViewItinerary = (dayNum) => {
    if (dayNum) {
      useTripStore.getState().setActiveDay(dayNum)
    }
    onViewItinerary?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id || i}
            message={msg}
            onViewItinerary={handleViewItinerary}
          />
        ))}
        {isTyping && <TypingIndicator />}

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="font-display text-2xl font-bold gradient-text mb-2">
              WanderMind AI
            </h2>
            <p className="text-gray-700 text-sm max-w-md">
              Your AI travel concierge. Tell me where you want to go, your budget,
              and travel dates — I'll create the perfect itinerary.
            </p>
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        disabled={isTyping}
        prefillText={prefillText}
        onClearPrefill={() => setPrefillText('')}
      />
    </div>
  )
}

// Export for external use (quick-edit pencil buttons)
export function useChatPrefill() {
  return useChatStore
}
