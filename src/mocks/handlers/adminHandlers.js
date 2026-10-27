// /admin/products CRUD (MerchantAdmin only - the adapter checks the role)
import { db, findCategory, findProduct, nextId } from '../mockDb'
import { created, hasErrors, noContent, ok, problem } from '../mockResponses'

function toAdminProductDto(product) {
  const category = findCategory(product.categoryId)
  return {
    productId: product.productId,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    categoryName: category ? category.categoryName : 'Unknown',
    priceCredits: product.priceCredits,
    iconKey: product.iconKey,
  }
}

// Same rules the server's validator will use.
function validateProduct(body) {
  const errors = {}

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) errors.name = ['Name is required.']
  else if (name.length < 2 || name.length > 100) {
    errors.name = ['Name must be between 2 and 100 characters.']
  }

  const description = typeof body?.description === 'string' ? body.description.trim() : ''
  if (description.length > 500) {
    errors.description = ['Description must be 500 characters or fewer.']
  }

  const categoryId = Number(body?.categoryId)
  if (!findCategory(categoryId)) errors.categoryId = ['Choose a valid category.']

  const priceCredits = Number(body?.priceCredits)
  const priceIsBlank = body?.priceCredits === '' || body?.priceCredits == null
  if (priceIsBlank || !Number.isInteger(priceCredits) || priceCredits < 1 || priceCredits > 100000) {
    errors.priceCredits = ['Price must be a whole number from 1 to 100,000.']
  }

  const iconKey = typeof body?.iconKey === 'string' ? body.iconKey.trim() : ''
  if (iconKey.length > 50) errors.iconKey = ['Icon key must be 50 characters or fewer.']

  const values = {
    name,
    description: description || null,
    categoryId,
    priceCredits,
    iconKey: iconKey || null,
  }
  return { errors, values }
}

function nameIsTaken(name, ignoreProductId) {
  return db.products.some(
    (product) =>
      product.productId !== ignoreProductId && product.name.toLowerCase() === name.toLowerCase(),
  )
}

function duplicateNameProblem() {
  return problem(409, 'A product with this name already exists.', {
    name: ['A product with this name already exists.'],
  })
}

export function listAdminProducts() {
  const products = [...db.products].sort((a, b) => a.name.localeCompare(b.name))
  return ok(products.map(toAdminProductDto))
}

export function createProduct({ body }) {
  const { errors, values } = validateProduct(body)
  if (hasErrors(errors)) return problem(400, 'One or more validation errors occurred.', errors)
  if (nameIsTaken(values.name)) return duplicateNameProblem()

  const product = { productId: nextId(db.products, 'productId'), ...values }
  db.products.push(product)
  return created(toAdminProductDto(product))
}

export function updateProduct({ params, body }) {
  const product = findProduct(Number(params.id))
  if (!product) return problem(404, 'Product not found.')

  const { errors, values } = validateProduct(body)
  if (hasErrors(errors)) return problem(400, 'One or more validation errors occurred.', errors)
  if (nameIsTaken(values.name, product.productId)) return duplicateNameProblem()

  Object.assign(product, values)
  return ok(toAdminProductDto(product))
}

export function deleteProduct({ params }) {
  const product = findProduct(Number(params.id))
  if (!product) return problem(404, 'Product not found.')

  const hasPurchases = db.purchases.some((purchase) => purchase.productId === product.productId)
  if (hasPurchases) {
    return problem(409, "This product has purchase history and can't be deleted.")
  }

  db.products = db.products.filter((p) => p.productId !== product.productId)
  return noContent()
}
