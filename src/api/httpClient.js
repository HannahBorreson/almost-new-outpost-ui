// The ONE place that talks HTTP. Every *Api.js file uses this client.
// It is also the only file that knows the mocks exist.
import axios from 'axios'
import { apiBaseUrl, useMocks } from '../config'
import { clearToken, getToken } from '../auth/tokenStorage'
import { mockAdapter } from '../mocks/mockAdapter'

const httpClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Mock mode: answer requests in the browser instead of over the network.
if (useMocks) {
  httpClient.defaults.adapter = mockAdapter
}

// The error every API function rejects with: { status, title, errors }
// errors is ProblemDetails' "field -> messages" map (empty unless it was a 400/409).
export class ApiError extends Error {
  constructor(status, title, errors = {}) {
    super(title)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.errors = errors
  }
}

function toApiError(error) {
  if (!error.response) {
    return new ApiError(0, "Can't reach the outpost server. Check that the API is running and try again.")
  }

  const { status, data } = error.response
  if (status === 403) return new ApiError(403, 'You are not authorized to do that.')

  const title = data?.title || data?.detail || `Request failed (${status}).`
  return new ApiError(status, title, data?.errors || {})
}

// Before every request: attach the token if we have one.
httpClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// After every response: turn failures into ApiError and handle 401 globally.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error)
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    // 401 = token missing, expired or invalid -> sign out.
    // (A 401 from the login form just means "wrong password", so leave it alone.)
    if (apiError.status === 401 && !isLoginRequest) {
      clearToken()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }

    // 403 is NOT a sign-out: the user is known but not allowed. Pages show the message.
    return Promise.reject(apiError)
  },
)

export default httpClient
