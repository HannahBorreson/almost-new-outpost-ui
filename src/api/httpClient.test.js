// The shared axios client: token header, error shape and the global 401 rule.
// Each test passes its own `adapter`, so no request reaches the mocks or a network.
import { AxiosError } from 'axios'
import { afterEach, describe, expect, it } from 'vitest'
import { saveToken, getToken } from '../auth/tokenStorage'
import httpClient, { ApiError } from './httpClient'

// An adapter that answers with this status and body.
function respondWith(status, data) {
  return async (config) => {
    const response = { status, data, statusText: '', headers: {}, config, request: {} }
    if (status < 400) return response
    throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response)
  }
}

// An adapter that behaves like the server is down.
const networkDown = async (config) => {
  throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {})
}

afterEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('request interceptor', () => {
  it('sends the saved token as a Bearer header', async () => {
    saveToken('abc123', false)
    let sentHeader
    await httpClient.get('/anything', {
      adapter: async (config) => {
        sentHeader = config.headers.Authorization
        return { status: 200, data: {}, headers: {}, config }
      },
    })
    expect(sentHeader).toBe('Bearer abc123')
  })

  it('sends no Authorization header when signed out', async () => {
    let sentHeader = 'not checked'
    await httpClient.get('/anything', {
      adapter: async (config) => {
        sentHeader = config.headers.Authorization
        return { status: 200, data: {}, headers: {}, config }
      },
    })
    expect(sentHeader).toBeUndefined()
  })
})

describe('response errors become ApiError', () => {
  it('no response -> status 0 with a "can\'t reach" message', async () => {
    const error = await httpClient.get('/x', { adapter: networkDown }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
    expect(error.message).toMatch(/Can't reach the outpost server/)
  })

  it('403 -> a fixed "not authorized" message', async () => {
    const error = await httpClient.get('/x', { adapter: respondWith(403, { title: 'Forbidden' }) }).catch((e) => e)
    expect(error.status).toBe(403)
    expect(error.message).toBe('You are not authorized to do that.')
  })

  it('400 -> ProblemDetails title and field errors', async () => {
    const body = { title: 'One or more validation errors occurred.', errors: { name: ['Name is required.'] } }
    const error = await httpClient.post('/x', {}, { adapter: respondWith(400, body) }).catch((e) => e)
    expect(error.status).toBe(400)
    expect(error.title).toBe(body.title)
    expect(error.errors).toEqual(body.errors)
  })

  it('falls back to "detail", then to a generic message', async () => {
    const withDetail = await httpClient.get('/x', { adapter: respondWith(500, { detail: 'Boom' }) }).catch((e) => e)
    expect(withDetail.message).toBe('Boom')

    const empty = await httpClient.get('/x', { adapter: respondWith(502, '') }).catch((e) => e)
    expect(empty.message).toBe('Request failed (502).')
    expect(empty.errors).toEqual({})
  })
})

describe('401 handling', () => {
  it('signs out on a 401 from any request except login', async () => {
    // Already on /login, so the client clears the token without navigating
    // (jsdom can't do real page navigation).
    window.history.replaceState({}, '', '/login')
    saveToken('expired', true)

    const error = await httpClient.get('/products', { adapter: respondWith(401, {}) }).catch((e) => e)
    expect(error.status).toBe(401)
    expect(getToken()).toBeNull()
  })

  it('keeps the token on a 401 from the login form (it just means a wrong password)', async () => {
    saveToken('keep-me', true)
    const error = await httpClient
      .post('/auth/login', {}, { adapter: respondWith(401, { title: 'Invalid username or password.' }) })
      .catch((e) => e)
    expect(error.message).toBe('Invalid username or password.')
    expect(getToken()).toBe('keep-me')
  })
})
