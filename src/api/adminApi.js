import httpClient from './httpClient'

// Every call here needs the MerchantAdmin role; anyone else gets 403.

// GET /admin/products
export async function getAdminProducts() {
  const response = await httpClient.get('/admin/products')
  return response.data
}

// POST /admin/products  body { name, description, categoryId, priceCredits, iconKey }
export async function createProduct(product) {
  const response = await httpClient.post('/admin/products', product)
  return response.data
}

// PUT /admin/products/{id}
export async function updateProduct(productId, product) {
  const response = await httpClient.put(`/admin/products/${productId}`, product)
  return response.data
}

// DELETE /admin/products/{id}
export async function deleteProduct(productId) {
  await httpClient.delete(`/admin/products/${productId}`)
}

// The mock-mode DevToolbar sends an extra header so any signed-in user can
// change the weather while demoing. The real API ignores it.
function devToolsHeaders(fromDevTools) {
  return fromDevTools ? { headers: { 'X-Mock-Dev-Tools': 'true' } } : {}
}

// PUT /admin/weather/override  body { condition }
export async function setWeatherOverride(condition, { fromDevTools = false } = {}) {
  const response = await httpClient.put(
    '/admin/weather/override',
    { condition },
    devToolsHeaders(fromDevTools),
  )
  return response.data
}

// DELETE /admin/weather/override
export async function clearWeatherOverride({ fromDevTools = false } = {}) {
  await httpClient.delete('/admin/weather/override', devToolsHeaders(fromDevTools))
}
