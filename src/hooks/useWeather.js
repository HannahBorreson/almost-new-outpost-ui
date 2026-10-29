import { useCallback, useEffect, useState } from 'react'
import { getCurrentWeather } from '../api/weatherApi'
import { useCountdown } from './useCountdown'

// Loads the current weather and counts down to the server's next refresh.
// When the countdown reaches 0:00 it asks the server again.
export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(null)
  const [clockOffsetMs, setClockOffsetMs] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const data = await getCurrentWeather()
      setClockOffsetMs(Date.parse(data.serverTimeUtc) - Date.now())
      setWeather(data)
      setError(null)
    } catch (err) {
      setError(err)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const secondsLeft = useCountdown(weather?.nextRefreshUtc, clockOffsetMs)

  useEffect(() => {
    if (!weather || secondsLeft !== 0) return
    // Give the server a moment to roll over, then fetch. If it hasn't changed
    // yet, `weather` is replaced and this runs again two seconds later.
    const timer = setTimeout(refresh, 2000)
    return () => clearTimeout(timer)
  }, [weather, secondsLeft, refresh])

  return { weather, error, secondsLeft, refresh }
}
