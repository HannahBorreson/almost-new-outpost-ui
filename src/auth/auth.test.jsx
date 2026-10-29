// AuthProvider and the route guards. AuthProvider talks to the mock API (mock mode).
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createMockToken } from '../mocks/mockToken'
import AdminRoute from './AdminRoute'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './ProtectedRoute'
import { getToken, saveToken } from './tokenStorage'
import { AuthContext, useAuth } from './useAuth'

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600
const tokenFor = (sub, exp = inOneHour()) => createMockToken({ sub: String(sub), exp })

// Shows what AuthProvider currently knows.
function WhoAmI() {
  const { user, isChecking, isAdmin } = useAuth()
  if (isChecking) return <p>checking</p>
  return <p>{user ? `${user.username} admin=${isAdmin}` : 'signed out'}</p>
}

beforeEach(() => {
  // A 401 from /auth/me would otherwise try to navigate, which jsdom can't do.
  window.history.replaceState({}, '', '/login')
})
afterEach(() => window.history.replaceState({}, '', '/'))

describe('AuthProvider', () => {
  it('starts signed out when nothing is stored', async () => {
    render(<AuthProvider><WhoAmI /></AuthProvider>)
    expect(await screen.findByText('signed out')).toBeInTheDocument()
  })

  it('restores the user from a saved token', async () => {
    saveToken(tokenFor(5), true)
    render(<AuthProvider><WhoAmI /></AuthProvider>)
    expect(screen.getByText('checking')).toBeInTheDocument()
    expect(await screen.findByText('admin admin=true')).toBeInTheDocument()
  })

  it('throws away an expired token without calling the API', async () => {
    saveToken(tokenFor(3, 1), true)
    render(<AuthProvider><WhoAmI /></AuthProvider>)
    expect(await screen.findByText('signed out')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('throws away a token the API rejects', async () => {
    saveToken(tokenFor(999), true) // unknown user
    render(<AuthProvider><WhoAmI /></AuthProvider>)
    expect(await screen.findByText('signed out', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })
})

describe('useAuth', () => {
  it('complains when used outside AuthProvider', () => {
    const quiet = console.error
    console.error = () => {}
    expect(() => render(<WhoAmI />)).toThrow('useAuth must be used inside <AuthProvider>.')
    console.error = quiet
  })
})

// Renders the guards with a hand-made auth value, at `path`.
function renderGuards(auth, path) {
  const value = { user: null, isAdmin: false, isChecking: false, ...auth }
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/inventory" element={<ProtectedRoute><p>inventory page</p></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><p>admin page</p></AdminRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

const medic = { id: 3, username: 'medic', role: 'Medic' }
const admin = { id: 5, username: 'admin', role: 'MerchantAdmin' }

describe('ProtectedRoute', () => {
  it('shows a spinner while checking', () => {
    renderGuards({ isChecking: true }, '/inventory')
    expect(screen.getByRole('status')).toHaveTextContent('Checking your outpost pass...')
  })

  it('sends signed-out visitors to /login', () => {
    renderGuards({}, '/inventory')
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('lets signed-in users through', () => {
    renderGuards({ user: medic }, '/inventory')
    expect(screen.getByText('inventory page')).toBeInTheDocument()
  })
})

describe('AdminRoute', () => {
  it('shows a spinner while checking', () => {
    renderGuards({ isChecking: true }, '/admin')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('sends signed-out visitors to /login', () => {
    renderGuards({}, '/admin')
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('sends non-admins back to /inventory', () => {
    renderGuards({ user: medic }, '/admin')
    expect(screen.getByText('inventory page')).toBeInTheDocument()
  })

  it('lets admins through', () => {
    renderGuards({ user: admin, isAdmin: true }, '/admin')
    expect(screen.getByText('admin page')).toBeInTheDocument()
  })
})
