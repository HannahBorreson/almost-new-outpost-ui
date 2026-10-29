// End-to-end in the browser: routes, guards, nav bar and pages, answered by the mock API.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'

const SLOW = { timeout: 3000 } // a page can make a few mock calls of up to 600 ms each

// After logout, a request still in flight can come back 401. httpClient then
// navigates to /login unless it's already there, and jsdom can't navigate.
beforeEach(() => window.history.replaceState({}, '', '/login'))
afterEach(() => window.history.replaceState({}, '', '/'))

function renderApp(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function logIn(username) {
  const user = userEvent.setup()
  await user.type(await screen.findByPlaceholderText('Username'), username)
  await user.type(screen.getByPlaceholderText('Password'), `${username}123`)
  await user.click(screen.getByRole('button', { name: 'Log In' }))
  return user
}

describe('App', () => {
  it('sends a signed-out visitor from / to the login page', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { name: 'Almost New 24/7 Outpost' })).toBeInTheDocument()
  })

  it('shows the not-found page for an unknown address', async () => {
    renderApp('/no-such-aisle')
    expect(await screen.findByRole('heading', { name: 'This aisle is overgrown.' })).toBeInTheDocument()
  })

  it('a citizen logs in, sees the inventory and no admin link, then logs out', async () => {
    renderApp('/inventory')
    const user = await logIn('citizen')

    const nav = await screen.findByRole('navigation', { name: 'Main' }, SLOW)
    expect(within(nav).getByRole('link', { name: 'Inventory' })).toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Manage Products' })).toBeNull()
    expect(screen.getByText('Citizen')).toBeInTheDocument()

    // Products load into the grid
    expect(await screen.findByRole('heading', { name: 'Clean Water' }, SLOW)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Logout/ }))
    expect(await screen.findByPlaceholderText('Username')).toBeInTheDocument()
  })

  it('an admin can open Manage Products', async () => {
    renderApp('/admin/products')
    const user = await logIn('admin')

    expect(await screen.findByRole('heading', { name: 'Manage Products' }, SLOW)).toBeInTheDocument()
    expect(screen.getByText('Merchant Admin')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Purchase History' }))
    expect(await screen.findByRole('heading', { name: 'Purchase History' }, SLOW)).toBeInTheDocument()
  })
})
