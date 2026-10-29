import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useMocks } from '../../config'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import BrandMark from '../../components/layout/BrandMark'
import './LoginPage.css'

// Shown under the card in mock mode only (these accounts exist only in the mock data).
const demoAccounts = [
  { username: 'citizen', password: 'citizen123' },
  { username: 'scout', password: 'scout123' },
  { username: 'medic', password: 'medic123' },
  { username: 'security', password: 'security123' },
  { username: 'admin', password: 'admin123' },
]

export default function LoginPage() {
  const { user, isChecking, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goTo = location.state?.from || '/inventory'

  if (isChecking) return <Spinner fullPage label="Checking your outpost pass..." />
  if (user) return <Navigate to={goTo} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setServerError('')

    // Quick checks in the browser; the server checks again.
    const errors = {}
    if (!username.trim()) errors.username = 'Please enter your username.'
    if (!password) errors.password = 'Please enter your password.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await login(username.trim(), password, rememberMe)
      navigate(goTo, { replace: true })
    } catch (err) {
      setServerError(err.status === 401 ? 'Invalid username or password.' : err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <main className="login-page__main">
        <div className="login-card-wrap">
          <BrandMark size={112} className="login-card__logo" />
          <section className="login-card" aria-labelledby="login-title">
            <h1 id="login-title" className="login-card__title">Almost New 24/7 Outpost</h1>
            <p className="login-card__tagline">Mostly New Goods Since The Collapse</p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="username" className="visually-hidden">Username</label>
                <input
                  id="username"
                  className="field-input field-input--large"
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  aria-invalid={fieldErrors.username ? true : undefined}
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  maxLength={50}
                />
                {fieldErrors.username && <p id="username-error" className="field-error">{fieldErrors.username}</p>}
              </div>

              <div className="form-field">
                <label htmlFor="password" className="visually-hidden">Password</label>
                <input
                  id="password"
                  className="field-input field-input--large"
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={fieldErrors.password ? true : undefined}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  maxLength={128}
                />
                {fieldErrors.password && <p id="password-error" className="field-error">{fieldErrors.password}</p>}
              </div>

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>

              {serverError && <Alert tone="error" title={serverError} />}

              <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </Button>
            </form>
          </section>
        </div>

        {useMocks && (
          <aside className="demo-accounts" aria-labelledby="demo-title">
            <p id="demo-title" className="demo-accounts__title">Demo accounts (mock mode)</p>
            <ul>
              {demoAccounts.map((account) => (
                <li key={account.username}>
                  <code>{account.username}</code> / <code>{account.password}</code>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>
    </div>
  )
}
