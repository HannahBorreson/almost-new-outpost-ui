// An axios "adapter" that answers requests from memory instead of the network.
// httpClient.js plugs it in when VITE_USE_MOCKS=true. It returns the same
// response / error objects axios builds for a real server, so the interceptors
// and every page behave exactly the same with mocks or the real API.
import { AxiosError } from 'axios'
import { authenticate } from './mockToken'
import { problem } from './mockResponses'
import * as auth from './handlers/authHandlers'
import * as products from './handlers/productHandlers'
import * as purchases from './handlers/purchaseHandlers'
import * as weather from './handlers/weatherHandlers'
import * as admin from './handlers/adminHandlers'

// access: 'anonymous' | 'user' | 'admin'
const routes = [
  { method: 'post', path: '/auth/login', access: 'anonymous', handler: auth.login },
  { method: 'get', path: '/auth/me', access: 'user', handler: auth.getMe },

  { method: 'get', path: '/products', access: 'user', handler: products.listProducts },
  { method: 'get', path: '/products/:id', access: 'user', handler: products.getProduct },
  { method: 'get', path: '/categories', access: 'user', handler: products.listCategories },

  { method: 'post', path: '/purchases', access: 'user', handler: purchases.createPurchase },
  { method: 'get', path: '/purchases/me', access: 'user', handler: purchases.listMyPurchases },

  { method: 'get', path: '/weather/current', access: 'user', handler: weather.getCurrentWeather },

  { method: 'get', path: '/admin/products', access: 'admin', handler: admin.listAdminProducts },
  { method: 'post', path: '/admin/products', access: 'admin', handler: admin.createProduct },
  { method: 'put', path: '/admin/products/:id', access: 'admin', handler: admin.updateProduct },
  { method: 'delete', path: '/admin/products/:id', access: 'admin', handler: admin.deleteProduct },

  // allowDevTools: the mock-mode DevToolbar may call these as any signed-in user.
  { method: 'put', path: '/admin/weather/override', access: 'admin', allowDevTools: true, handler: weather.setWeatherOverride },
  { method: 'delete', path: '/admin/weather/override', access: 'admin', allowDevTools: true, handler: weather.clearWeatherOverride },
]

const STATUS_TEXT = {
  200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 401: 'Unauthorized',
  403: 'Forbidden', 404: 'Not Found', 409: 'Conflict', 500: 'Internal Server Error',
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// "/products/12" matched against "/products/:id" -> { id: "12" }, or null
function matchPath(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null

  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i])
    } else if (patternParts[i] !== pathParts[i]) {
      return null
    }
  }
  return params
}

// Splits the request into a path relative to /api and a query object.
function readUrl(config) {
  let url = config.url || ''
  const base = config.baseURL || ''
  if (base && url.startsWith(base)) url = url.slice(base.length)

  const parsed = new URL(url, 'http://mock.local')
  let path = parsed.pathname
  if (path.startsWith('/api/')) path = path.slice(4)

  const query = Object.fromEntries(parsed.searchParams)
  for (const [key, value] of Object.entries(config.params || {})) {
    if (value !== undefined && value !== null) query[key] = String(value)
  }
  return { path, query }
}

function readBody(data) {
  if (!data) return {}
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

function readHeader(config, name) {
  const headers = config.headers || {}
  if (typeof headers.get === 'function') return headers.get(name)
  return headers[name] || headers[name.toLowerCase()]
}

function runRoute(config) {
  const method = (config.method || 'get').toLowerCase()
  const { path, query } = readUrl(config)

  for (const route of routes) {
    if (route.method !== method) continue
    const params = matchPath(route.path, path)
    if (!params) continue

    // Authentication (like the API's "authenticated by default" policy)
    const user = authenticate(readHeader(config, 'Authorization'))
    if (route.access !== 'anonymous' && !user) return problem(401, 'Unauthorized')

    // Role check (like the API's AdminOnly policy)
    const isDevTools = route.allowDevTools && readHeader(config, 'X-Mock-Dev-Tools') === 'true'
    if (route.access === 'admin' && user.role !== 'MerchantAdmin' && !isDevTools) {
      return problem(403, 'Forbidden')
    }

    return route.handler({ params, query, body: readBody(config.data), user })
  }

  console.warn(`[mock api] No mock route for ${method.toUpperCase()} ${path}`)
  return problem(404, `No mock route for ${method.toUpperCase()} ${path}`)
}

export async function mockAdapter(config) {
  await wait(250 + Math.random() * 350) // pretend the network is slow

  let result
  try {
    result = runRoute(config)
  } catch (error) {
    console.error('[mock api] Handler crashed', error)
    result = problem(500, 'The mock server had a problem.')
  }

  const response = {
    // A JSON string, like a real response body; axios parses it for us.
    data: result.data === undefined ? '' : JSON.stringify(result.data),
    status: result.status,
    statusText: STATUS_TEXT[result.status] || '',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    config,
    request: { mock: true },
  }

  const isSuccess = config.validateStatus ? config.validateStatus(response.status) : true
  if (isSuccess) return response

  // Build the exact error axios produces for a real 4xx/5xx response.
  const code = response.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST
  throw new AxiosError(
    `Request failed with status code ${response.status}`,
    code,
    config,
    response.request,
    response,
  )
}
