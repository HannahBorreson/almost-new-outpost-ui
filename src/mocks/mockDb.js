// In-memory "database" for mock mode.
// It starts as a copy of the JSON files in ./data and lives only in browser
// memory: purchases, product edits and weather overrides reset on page reload.
import usersFile from './data/users.json'
import categoriesFile from './data/categories.json'
import productsFile from './data/products.json'
import purchasesFile from './data/purchases.json'

const HOUR_MS = 60 * 60 * 1000

function copy(value) {
  return JSON.parse(JSON.stringify(value))
}

export const db = {
  users: copy(usersFile.users),
  categories: copy(categoriesFile),
  products: copy(productsFile),
  purchases: purchasesFile.purchases.map((seed) => ({
    purchaseId: seed.purchaseId,
    userId: seed.userId,
    productId: seed.productId,
    finalPrice: seed.finalPrice,
    purchaseDate: new Date(Date.now() - seed.hoursAgo * HOUR_MS).toISOString(),
  })),
  // null = follow the weather schedule; otherwise a condition such as "Storm"
  weatherOverride: null,
}

// Like an auto-increment primary key.
export function nextId(rows, idField) {
  const ids = rows.map((row) => row[idField])
  return Math.max(0, ...ids) + 1
}

export function findCategory(categoryId) {
  return db.categories.find((category) => category.categoryId === categoryId)
}

export function findProduct(productId) {
  return db.products.find((product) => product.productId === productId)
}
