// The login page with the real AuthProvider, answered by the mock API.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from '../../auth/AuthContext'
import LoginPage from './LoginPage'

function WhereAmI() {
  return <p>now at {useLocation().pathname}</p>
}

function renderLogin(entry = '/login') {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<WhereAmI />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function fillAndSubmit(username, password, { remember = false } = {}) {
  const user = userEvent.setup()
  if (username) await user.type(await screen.findByPlaceholderText('Username'), username)
  if (password) await user.type(screen.getByPlaceholderText('Password'), password)
  if (remember) await user.click(screen.getByLabelText('Remember me'))
  await user.click(screen.getByRole('button', { name: 'Log In' }))
}

describe('LoginPage', () => {
  it('shows the title and, in mock mode, the demo accounts', async () => {
    renderLogin()
    expect(await screen.findByRole('heading', { name: 'Almost New 24/7 Outpost' })).toBeInTheDocument()
    expect(screen.getByText('Demo accounts (mock mode)')).toBeInTheDocument()
  })

  it('asks for both fields before calling the server', async () => {
    renderLogin()
    await fillAndSubmit('', '')
    expect(screen.getByText('Please enter your username.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your password.')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Username')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows one message for a wrong username or password', async () => {
    renderLogin()
    await fillAndSubmit('medic', 'wrong')
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.')
    expect(screen.getByRole('button', { name: 'Log In' })).toBeEnabled()
  })

  it('logs in and goes to the inventory', async () => {
    renderLogin()
    await fillAndSubmit('medic', 'medic123')
    expect(screen.getByRole('button', { name: 'Logging In...' })).toBeDisabled()
    expect(await screen.findByText('now at /inventory')).toBeInTheDocument()
    expect(sessionStorage.length).toBe(1) // not remembered
    expect(localStorage.length).toBe(0)
  })

  it('"Remember me" keeps the token after the browser closes', async () => {
    renderLogin()
    await fillAndSubmit('scout', 'scout123', { remember: true })
    await screen.findByText('now at /inventory')
    expect(localStorage.length).toBe(1)
  })

  it('goes back to the page the user first asked for', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/purchases' } }]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<WhereAmI />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
    await fillAndSubmit('medic', 'medic123')
    expect(await screen.findByText('now at /purchases')).toBeInTheDocument()
  })
})
