import { Outlet } from 'react-router-dom'
import { useMocks } from '../../config'
import { useWeather } from '../../hooks/useWeather'
import WeatherBanner from '../inventory/WeatherBanner'
import DevToolbar from './DevToolbar'
import NavBar from './NavBar'
import './AppLayout.css'

// Frame for every signed-in page: nav bar, weather banner, then the page.
// Weather is loaded once here and handed to pages through the Outlet context
// (pages read it with useOutletContext()).
export default function AppLayout() {
  const weatherState = useWeather()

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <NavBar />
      <WeatherBanner
        weather={weatherState.weather}
        error={weatherState.error}
        secondsLeft={weatherState.secondsLeft}
      />
      <main id="main-content" className="app-main" tabIndex={-1}>
        <Outlet context={weatherState} />
      </main>
      {useMocks && (
        <DevToolbar weather={weatherState.weather} onWeatherChanged={weatherState.refresh} />
      )}
    </div>
  )
}
