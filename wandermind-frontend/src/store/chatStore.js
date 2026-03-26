import { create } from 'zustand'

export const useChatStore = create((set, get) => ({
  messages: [],
  isTyping: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, { ...msg, id: Date.now() + Math.random() }],
    })),

  setMessages: (messages) => set({ messages }),

  setTyping: (isTyping) => set({ isTyping }),

  clearMessages: () => set({ messages: [] }),

  getLastItinerary: () => {
    const msgs = get().messages
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].itinerary_snapshot) return msgs[i].itinerary_snapshot
    }
    return null
  },
}))
