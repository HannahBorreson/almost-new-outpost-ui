// POST /purchases and GET /purchases/me
import { db, findCategory, findProduct, nextId } from '../mockDb'
import { created, ok, problem } from '../mockResponses'
import { canRoleBuyCategory } from '../rules/categoryAccess'
import { currentPrice } from '../rules/pricing'
import { getWeatherSnapshot } from '../rules/weatherClock'

function toPurchaseDto(purchase) {
  const product = findProduct(purchase.productId)
  return {
    purchaseId: purchase.purchaseId,
    productId: purchase.productId,
    productName: product ? product.name : 'Removed product',
    purchaseDate: purchase.purchaseDate,
    finalPrice: purchase.finalPrice,
  }
}

export function createPurchase({ body, user }) {
  // Only productId is read. Any price, user or date sent by the client is ignored.
  const productId = Number(body?.productId)
  if (!Number.isInteger(productId) || productId < 1) {
    return problem(400, 'One or more validation errors occurred.', {
      productId: ['productId is required.'],
    })
  }

  const product = findProduct(productId)
  if (!product) return problem(404, 'Product not found.')

  const category = findCategory(product.categoryId)
  if (!canRoleBuyCategory(user.role, category.categoryName)) {
    return problem(403, 'Forbidden')
  }

  const weather = getWeatherSnapshot(db.weatherOverride)
  const purchase = {
    purchaseId: nextId(db.purchases, 'purchaseId'),
    userId: user.id,
    productId: product.productId,
    purchaseDate: new Date().toISOString(),
    finalPrice: currentPrice(product.priceCredits, weather.condition),
  }
  db.purchases.push(purchase)

  return created(toPurchaseDto(purchase))
}

export function listMyPurchases({ query, user }) {
  const requested = Number(query.limit) || 50
  const limit = Math.min(Math.max(requested, 1), 100)

  const mine = db.purchases
    .filter((purchase) => purchase.userId === user.id)
    .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
    .slice(0, limit)
    .map(toPurchaseDto)

  return ok(mine)
}
