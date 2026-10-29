// The api/ functions running against the in-browser mock API (mock mode).
// These tests double as a check that the mocks follow the API contract in README.md.
// The mock adapter waits 250-600 ms per call, so fake timers skip that wait.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveToken } from '../auth/tokenStorage'
import { db } from '../mocks/mockDb'
import * as adminApi from './adminApi'
import * as authApi from './authApi'
import * as productsApi from './productsApi'
import * as purchasesApi from './purchasesApi'
import * as weatherApi from './weatherApi'

// Starts the call, skips the fake network delay, then returns the result (or throws).
async function call(startRequest) {
  const promise = startRequest()
  promise.catch(() => {}) // the test awaits it below; this avoids an "unhandled" warning
  await vi.advanceTimersByTimeAsync(1000)
  return promise
}

async function signInAs(username) {
  const result = await call(() => authApi.login(username, `${username}123`))
  saveToken(result.accessToken, false)
  return result
}

beforeAll(() => {
  // A 401 would otherwise try to navigate to /login, which jsdom can't do.
  window.history.replaceState({}, '', '/login')
})
afterAll(() => window.history.replaceState({}, '', '/'))

// One minute into the next 30-minute weather cycle, which always starts "Clear".
// It's after the real time, so purchases made in a test are newer than the seed data.
const CYCLE_MS = 30 * 60 * 1000
const clearMoment = Math.ceil(Date.now() / CYCLE_MS) * CYCLE_MS + 60_000

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(clearMoment)
  db.weatherOverride = null
})
afterEach(() => vi.useRealTimers())

describe('auth', () => {
  it('logs in and returns a token plus the user', async () => {
    const result = await call(() => authApi.login('medic', 'medic123'))
    expect(result.user).toEqual({ id: 3, username: 'medic', role: 'Medic' })
    expect(result.accessToken).toMatch(/^mock\./)
    expect(Date.parse(result.expiresAtUtc)).toBeGreaterThan(Date.now())
  })

  it('accepts the username in any case', async () => {
    const result = await call(() => authApi.login('MEDIC', 'medic123'))
    expect(result.user.username).toBe('medic')
  })

  it('rejects a wrong password with 401', async () => {
    await expect(call(() => authApi.login('medic', 'nope'))).rejects.toMatchObject({
      status: 401,
      title: 'Invalid username or password.',
    })
  })

  it('rejects blank fields with 400 and field errors', async () => {
    const error = await call(() => authApi.login('  ', '')).catch((e) => e)
    expect(error.status).toBe(400)
    expect(Object.keys(error.errors)).toEqual(['username', 'password'])
  })

  it('getMe returns the signed-in user', async () => {
    await signInAs('scout')
    expect(await call(() => authApi.getMe())).toEqual({ id: 2, username: 'scout', role: 'Scout' })
  })

  it('getMe without a token is 401', async () => {
    await expect(call(() => authApi.getMe())).rejects.toMatchObject({ status: 401 })
  })
})

describe('products', () => {
  beforeEach(() => signInAs('medic'))

  it('lists products with canPurchase worked out for the role', async () => {
    const products = await call(() => productsApi.getProducts())
    const byCategory = (name) => products.filter((p) => p.categoryName === name)

    expect(products.length).toBeGreaterThan(0)
    expect(byCategory('Medical').every((p) => p.canPurchase)).toBe(true)
    expect(byCategory('Security').every((p) => !p.canPurchase)).toBe(true)
  })

  it('searches by name and sorts by price', async () => {
    const kits = await call(() => productsApi.getProducts({ search: 'kit', sortBy: 'price', sortDir: 'asc' }))
    expect(kits.every((p) => p.name.toLowerCase().includes('kit'))).toBe(true)
    const prices = kits.map((p) => p.currentPrice)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('sorts by name descending', async () => {
    const products = await call(() => productsApi.getProducts({ sortDir: 'desc' }))
    const names = products.map((p) => p.name)
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)))
  })

  it('rejects an unknown sort field or direction', async () => {
    await expect(call(() => productsApi.getProducts({ sortBy: 'colour' }))).rejects.toMatchObject({ status: 400 })
    await expect(call(() => productsApi.getProducts({ sortDir: 'sideways' }))).rejects.toMatchObject({ status: 400 })
  })

  it('gets one product, or 404', async () => {
    const product = await call(() => productsApi.getProduct(1))
    expect(product).toMatchObject({ productId: 1, name: 'Clean Water', basePrice: 12, currentPrice: 12 })
    await expect(call(() => productsApi.getProduct(9999))).rejects.toMatchObject({ status: 404 })
  })

  it('lists categories', async () => {
    const categories = await call(() => productsApi.getCategories())
    expect(categories.map((c) => c.categoryName)).toEqual(['Basic', 'Exploration', 'Medical', 'Security'])
  })
})

describe('purchases', () => {
  it('buys an allowed product at the current price', async () => {
    await signInAs('medic')
    const purchase = await call(() => purchasesApi.purchaseProduct(1))
    expect(purchase).toMatchObject({ productId: 1, productName: 'Clean Water', finalPrice: 12 })

    const mine = await call(() => purchasesApi.getMyPurchases(1))
    expect(mine).toHaveLength(1)
    expect(mine[0].purchaseId).toBe(purchase.purchaseId) // newest first
  })

  it('refuses a product outside the role with 403', async () => {
    await signInAs('citizen')
    const security = (await call(() => productsApi.getProducts())).find((p) => p.categoryName === 'Security')
    await expect(call(() => purchasesApi.purchaseProduct(security.productId))).rejects.toMatchObject({
      status: 403,
      message: 'You are not authorized to do that.',
    })
  })

  it('rejects a missing product id (400) and an unknown product (404)', async () => {
    await signInAs('citizen')
    await expect(call(() => purchasesApi.purchaseProduct(undefined))).rejects.toMatchObject({ status: 400 })
    await expect(call(() => purchasesApi.purchaseProduct(9999))).rejects.toMatchObject({ status: 404 })
  })

  it('getMyPurchases works without a limit', async () => {
    await signInAs('scout')
    const mine = await call(() => purchasesApi.getMyPurchases())
    expect(Array.isArray(mine)).toBe(true)
  })
})

describe('weather', () => {
  it('reports the scheduled weather', async () => {
    await signInAs('citizen')
    const weather = await call(() => weatherApi.getCurrentWeather())
    expect(weather).toMatchObject({ condition: 'Clear', isDangerous: false, source: 'Mock' })
  })

  it('an admin override raises prices by 25% until it is cleared', async () => {
    await signInAs('admin')
    const storm = await call(() => adminApi.setWeatherOverride('Storm'))
    expect(storm).toMatchObject({ condition: 'Storm', source: 'Override', multiplier: 1.25 })
    expect((await call(() => productsApi.getProduct(1))).currentPrice).toBe(15)

    await call(() => adminApi.clearWeatherOverride())
    expect((await call(() => productsApi.getProduct(1))).currentPrice).toBe(12)
  })

  it('rejects an unknown condition', async () => {
    await signInAs('admin')
    await expect(call(() => adminApi.setWeatherOverride('Snow'))).rejects.toMatchObject({ status: 400 })
  })

  it('only admins may override, unless the call comes from the mock dev toolbar', async () => {
    await signInAs('citizen')
    await expect(call(() => adminApi.setWeatherOverride('Storm'))).rejects.toMatchObject({ status: 403 })

    const fromToolbar = await call(() => adminApi.setWeatherOverride('DustStorm', { fromDevTools: true }))
    expect(fromToolbar.condition).toBe('DustStorm')
    await call(() => adminApi.clearWeatherOverride({ fromDevTools: true }))
    expect(db.weatherOverride).toBeNull()
  })
})

describe('admin products', () => {
  const newProduct = { name: 'Rain Poncho', description: 'Keeps you dry.', categoryId: 1, priceCredits: 9, iconKey: 'vest' }

  it('is forbidden for non-admins', async () => {
    await signInAs('medic')
    await expect(call(() => adminApi.getAdminProducts())).rejects.toMatchObject({ status: 403 })
  })

  it('lists products sorted by name with priceCredits', async () => {
    await signInAs('admin')
    const products = await call(() => adminApi.getAdminProducts())
    expect(products[0]).toHaveProperty('priceCredits')
    const names = products.map((p) => p.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('creates, updates and deletes a product', async () => {
    await signInAs('admin')
    const created = await call(() => adminApi.createProduct(newProduct))
    expect(created).toMatchObject({ name: 'Rain Poncho', categoryName: 'Basic', priceCredits: 9 })

    const updated = await call(() => adminApi.updateProduct(created.productId, { ...newProduct, priceCredits: 11 }))
    expect(updated.priceCredits).toBe(11)

    await call(() => adminApi.deleteProduct(created.productId))
    await expect(call(() => productsApi.getProduct(created.productId))).rejects.toMatchObject({ status: 404 })
  })

  it('returns field errors for invalid input', async () => {
    await signInAs('admin')
    const error = await call(() =>
      adminApi.createProduct({ name: 'x', description: 'y'.repeat(501), categoryId: 99, priceCredits: 0, iconKey: 'z'.repeat(51) }),
    ).catch((e) => e)

    expect(error.status).toBe(400)
    expect(Object.keys(error.errors).sort()).toEqual(['categoryId', 'description', 'iconKey', 'name', 'priceCredits'])
  })

  it('requires a name and a price', async () => {
    await signInAs('admin')
    const error = await call(() => adminApi.createProduct({ categoryId: 1, priceCredits: '' })).catch((e) => e)
    expect(error.errors.name).toEqual(['Name is required.'])
    expect(error.errors.priceCredits).toBeDefined()
  })

  it('refuses a duplicate name with 409, on create and on update', async () => {
    await signInAs('admin')
    await expect(call(() => adminApi.createProduct({ ...newProduct, name: 'clean water' }))).rejects.toMatchObject({ status: 409 })
    await expect(call(() => adminApi.updateProduct(2, { ...newProduct, name: 'Clean Water' }))).rejects.toMatchObject({ status: 409 })
  })

  it('returns 404 when updating or deleting a missing product', async () => {
    await signInAs('admin')
    await expect(call(() => adminApi.updateProduct(9999, newProduct))).rejects.toMatchObject({ status: 404 })
    await expect(call(() => adminApi.deleteProduct(9999))).rejects.toMatchObject({ status: 404 })
  })

  it('refuses to delete a product with purchase history (409)', async () => {
    await signInAs('admin')
    const boughtId = db.purchases[0].productId
    await expect(call(() => adminApi.deleteProduct(boughtId))).rejects.toMatchObject({ status: 409 })
  })
})

describe('mock adapter', () => {
  it('answers 404 for a route it does not know', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await signInAs('citizen')
    const { default: httpClient } = await import('./httpClient')
    await expect(call(() => httpClient.get('/nowhere'))).rejects.toMatchObject({ status: 404 })
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
