import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// JWT interceptor
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('wandermind-tokens')
  if (tokens) {
    const { access } = JSON.parse(tokens)
    if (access) {
      config.headers.Authorization = `Bearer ${access}`
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const tokens = localStorage.getItem('wandermind-tokens')
      if (tokens) {
        try {
          const { refresh } = JSON.parse(tokens)
          const res = await axios.post(
            `${api.defaults.baseURL}/auth/token/refresh/`,
            { refresh }
          )
          const newTokens = { access: res.data.access, refresh: res.data.refresh || refresh }
          localStorage.setItem('wandermind-tokens', JSON.stringify(newTokens))
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('wandermind-tokens')
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
