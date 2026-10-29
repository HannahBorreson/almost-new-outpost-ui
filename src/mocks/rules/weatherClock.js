// Mirrors the server's simulated weather provider.
// The condition is worked out from the wall clock, so reloading the page does
// not restart the cycle: every `minutes` the next entry in `sequence` begins.
import weatherFile from '../data/weather.json'
import { mockWeatherMinutes } from '../../config'
import { DANGER_MULTIPLIER, isDangerous } from './pricing'

const minutesPerCondition = mockWeatherMinutes || weatherFile.refreshMinutes

export const knownConditions = Object.keys(weatherFile.displayNames)

export function getWeatherSnapshot(override, now = Date.now()) {
  const periodMs = minutesPerCondition * 60 * 1000
  const slot = Math.floor(now / periodMs)
  const scheduled = weatherFile.sequence[slot % weatherFile.sequence.length]
  const condition = override || scheduled
  const dangerous = isDangerous(condition)

  return {
    condition,
    displayName: weatherFile.displayNames[condition],
    isDangerous: dangerous,
    multiplier: dangerous ? DANGER_MULTIPLIER : 1,
    fetchedAtUtc: new Date(slot * periodMs).toISOString(),
    nextRefreshUtc: new Date((slot + 1) * periodMs).toISOString(),
    serverTimeUtc: new Date(now).toISOString(),
    source: override ? 'Override' : 'Mock',
    isStale: false,
  }
}
