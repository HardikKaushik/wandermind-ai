export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700
                      flex items-center justify-center text-sm flex-shrink-0">
        W
      </div>
      <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span className="typing-dot w-2 h-2 bg-blue-600 rounded-full" />
          <span className="typing-dot w-2 h-2 bg-blue-600 rounded-full" />
          <span className="typing-dot w-2 h-2 bg-blue-600 rounded-full" />
        </div>
      </div>
    </div>
  )
}
