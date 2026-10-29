import { CloudSun, Sun, TriangleAlert } from 'lucide-react'
import { formatCountdown } from '../../utils/formatCountdown'
import './WeatherBanner.css'

// Full-width bar under the nav: amber when the weather is dangerous, green when clear.
export default function WeatherBanner({ weather, error, secondsLeft }) {
  if (!weather) {
    return (
      <div className="weather-banner weather-banner--muted" role="status">
        <CloudSun size={18} aria-hidden="true" />
        <span>{error ? 'Weather report unavailable right now.' : 'Checking the skies...'}</span>
      </div>
    )
  }

  const staleNote = weather.isStale && (
    <span className="weather-banner__stale"> (last known conditions)</span>
  )
  const condition = weather.displayName.toUpperCase()

  if (weather.isDangerous) {
    const percent = Math.round((weather.multiplier - 1) * 100)
    return (
      <div className="weather-banner weather-banner--danger">
        <TriangleAlert size={18} aria-hidden="true" />
        <p>
          {/* Screen readers hear the condition once, not every countdown tick */}
          <span role="status">
            {condition} ACTIVE. All prices increased by {percent}%.
          </span>{' '}
          <span>
            Prices return to normal in{' '}
            <span className="weather-banner__clock">{formatCountdown(secondsLeft)}</span>.
          </span>
          {staleNote}
        </p>
      </div>
    )
  }

  return (
    <div className="weather-banner weather-banner--clear">
      <Sun size={18} aria-hidden="true" />
      <p>
        <span role="status">{condition}. No active price adjustments.</span>
        {staleNote}
      </p>
    </div>
  )
}
