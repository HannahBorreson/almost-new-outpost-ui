import { useState } from 'react'
import { ChevronDown, ChevronUp, FlaskConical } from 'lucide-react'
import { clearWeatherOverride, setWeatherOverride } from '../../api/adminApi'
import Button from '../common/Button'
import './DevToolbar.css'

const CONDITIONS = [
  { value: 'Clear', label: 'Clear Conditions' },
  { value: 'Storm', label: 'Storm' },
  { value: 'DustStorm', label: 'Dust Storm' },
  { value: 'RadiationEvent', label: 'Radiation Event' },
]

// Only rendered when VITE_USE_MOCKS=true. Lets you flip the weather instantly.
export default function DevToolbar({ weather, onWeatherChanged }) {
  // Starts open on wide screens, collapsed on phones so it doesn't cover the cards
  const [isOpen, setIsOpen] = useState(() => window.innerWidth > 700)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(action) {
    setIsBusy(true)
    setError('')
    try {
      await action()
      await onWeatherChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsBusy(false)
    }
  }

  function handleConditionChange(event) {
    const condition = event.target.value
    run(() => setWeatherOverride(condition, { fromDevTools: true }))
  }

  function handleClear() {
    run(() => clearWeatherOverride({ fromDevTools: true }))
  }

  const isOverridden = weather?.source === 'Override'

  return (
    <aside className="dev-toolbar" aria-label="Mock mode tools">
      <button
        type="button"
        className="dev-toolbar__toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="dev-toolbar-body"
      >
        <FlaskConical size={16} aria-hidden="true" />
        Mock mode
        {isOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronUp size={16} aria-hidden="true" />}
      </button>

      {isOpen && (
        <div id="dev-toolbar-body" className="dev-toolbar__body">
          <label htmlFor="dev-weather" className="dev-toolbar__label">Weather</label>
          <select
            id="dev-weather"
            className="field-input"
            value={weather?.condition || 'Clear'}
            onChange={handleConditionChange}
            disabled={isBusy || !weather}
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <Button size="sm" variant="ghost" onClick={handleClear} disabled={isBusy || !isOverridden}>
            Clear override
          </Button>
          <p className="dev-toolbar__note">
            {isOverridden ? 'Override active.' : 'Following the mock schedule.'} Data resets on reload.
          </p>
          {error && <p className="dev-toolbar__error" role="alert">{error}</p>}
        </div>
      )}
    </aside>
  )
}
