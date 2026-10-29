// GET /products, GET /products/{id}, GET /categories
import { db, findCategory, findProduct } from '../mockDb'
import { ok, problem } from '../mockResponses'
import { canRoleBuyCategory } from '../rules/categoryAccess'
import { currentPrice } from '../rules/pricing'
import { getWeatherSnapshot } from '../rules/weatherClock'

const SORT_FIELDS = ['name', 'price']
const SORT_DIRECTIONS = ['asc', 'desc']

// Shapes one product for the caller: price for today's weather + can they buy it?
export function toProductDto(product, role) {
  const category = findCategory(product.categoryId)
  const weather = getWeatherSnapshot(db.weatherOverride)
  return {
    productId: product.productId,
    name: product.name,
    categoryId: product.categoryId,
    categoryName: category ? category.categoryName : 'Unknown',
    description: product.description,
    basePrice: product.priceCredits,
    currentPrice: currentPrice(product.priceCredits, weather.condition),
    canPurchase: category ? canRoleBuyCategory(role, category.categoryName) : false,
    iconKey: product.iconKey,
  }
}

export function listProducts({ query, user }) {
  const search = (query.search || '').trim().slice(0, 50).toLowerCase()
  const sortBy = (query.sortBy || 'name').toLowerCase()
  const sortDir = (query.sortDir || 'asc').toLowerCase()

  if (!SORT_FIELDS.includes(sortBy)) {
    return problem(400, 'One or more validation errors occurred.', {
      sortBy: ['sortBy must be "name" or "price".'],
    })
  }
  if (!SORT_DIRECTIONS.includes(sortDir)) {
    return problem(400, 'One or more validation errors occurred.', {
      sortDir: ['sortDir must be "asc" or "desc".'],
    })
  }

  const matches = db.products
    .filter((product) => product.name.toLowerCase().includes(search))
    .map((product) => toProductDto(product, user.role))

  matches.sort((a, b) => {
    const byName = a.name.localeCompare(b.name)
    const result = sortBy === 'price' ? a.currentPrice - b.currentPrice || byName : byName
    return sortDir === 'desc' ? -result : result
  })

  return ok(matches)
}

export function getProduct({ params, user }) {
  const product = findProduct(Number(params.id))
  if (!product) return problem(404, 'Product not found.')
  return ok(toProductDto(product, user.role))
}

export function listCategories() {
  return ok(db.categories)
}
