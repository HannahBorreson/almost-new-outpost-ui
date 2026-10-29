// Reads the Vite environment variables once, so the rest of the app never
// touches import.meta.env directly. See .env.example for what each one does.
const env = import.meta.env

// true  -> every API call is answered by the in-browser mocks (src/mocks)
// false -> requests go to the real ASP.NET Core API at apiBaseUrl
// Mocks stay ON unless VITE_USE_MOCKS is set to exactly "false".
export const useMocks = env.VITE_USE_MOCKS !== 'false'

export const apiBaseUrl = env.VITE_API_BASE_URL || 'https://localhost:7001/api'

// Mock mode only: how many minutes each weather condition lasts.
export const mockWeatherMinutes = Number(env.VITE_MOCK_WEATHER_MINUTES) || null
