import httpClient from './httpClient'

// GET /weather/current
export async function getCurrentWeather() {
  const response = await httpClient.get('/weather/current')
  return response.data
}
