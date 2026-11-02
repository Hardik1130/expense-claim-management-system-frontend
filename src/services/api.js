
import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 20000,
})

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Token Refresh Queue
let refreshing = false
let waiting = []

const flush = (error, token = null) => {
  waiting.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )

  waiting = []
}

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (
      error.response?.status !== 401 ||
      original?._retry ||
      original?.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }

    // Wait for the ongoing token refresh
    if (refreshing) {
      return new Promise((resolve, reject) => {
        waiting.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    refreshing = true

    try {
      const response = await axios.post(
        `${baseURL}/auth/refresh`,
        { refreshToken }
      )

      const access =
        response.data?.data?.accessToken ||
        response.data?.accessToken

      const refresh =
        response.data?.data?.refreshToken ||
        response.data?.refreshToken ||
        refreshToken

      if (!access) {
        throw new Error(
          'Refresh response did not contain accessToken'
        )
      }

      // Store updated tokens
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)

      // Retry queued requests
      flush(null, access)

      original.headers.Authorization = `Bearer ${access}`

      return api(original)
    } catch (e) {
      flush(e)
      window.dispatchEvent(new Event('auth:logout'))

      return Promise.reject(e)
    } finally {
      refreshing = false
    }
  }
)

export default api
