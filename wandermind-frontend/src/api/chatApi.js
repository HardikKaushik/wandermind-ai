import api from './axiosInstance'

export const chatApi = {
  startSession: (data = {}) =>
    api.post('/chat/start/', data),

  sendMessage: (sessionId, message, language = 'en') =>
    api.post(`/chat/${sessionId}/send/`, { message, language }),

  getHistory: (sessionId) =>
    api.get(`/chat/${sessionId}/history/`),
}

export const tripApi = {
  get: (tripId) =>
    api.get(`/trips/${tripId}/`),

  update: (tripId, data) =>
    api.patch(`/trips/${tripId}/`, data),

  finalize: (tripId) =>
    api.post(`/trips/${tripId}/finalize/`),

  getShared: (token) =>
    api.get(`/trips/shared/${token}/`),

  export: (tripId) =>
    api.get(`/trips/${tripId}/export/`),

  getCompanions: (tripId) =>
    api.get(`/trips/${tripId}/companions/`),

  addCompanion: (tripId, data) =>
    api.post(`/trips/${tripId}/companions/`, data),

  resolveCompanions: (tripId) =>
    api.post(`/trips/${tripId}/companions/resolve/`),
}

export const budgetApi = {
  getBreakdown: (tripId) =>
    api.get(`/budget/${tripId}/breakdown/`),

  recalculate: (tripId) =>
    api.patch(`/budget/${tripId}/update/`),
}
