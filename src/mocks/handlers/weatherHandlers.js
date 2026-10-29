// GET /weather/current, PUT/DELETE /admin/weather/override
import { db } from '../mockDb'
import { noContent, ok, problem } from '../mockResponses'
import { getWeatherSnapshot, knownConditions } from '../rules/weatherClock'

export function getCurrentWeather() {
  return ok(getWeatherSnapshot(db.weatherOverride))
}

export function setWeatherOverride({ body }) {
  const condition = body?.condition
  if (!knownConditions.includes(condition)) {
    return problem(400, 'One or more validation errors occurred.', {
      condition: [`condition must be one of: ${knownConditions.join(', ')}.`],
    })
  }
  db.weatherOverride = condition
  return ok(getWeatherSnapshot(db.weatherOverride))
}

export function clearWeatherOverride() {
  db.weatherOverride = null
  return noContent()
}
