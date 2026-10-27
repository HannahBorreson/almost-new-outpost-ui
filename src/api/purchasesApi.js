import httpClient from './httpClient'

// POST /purchases  body { productId }
// Only the product id is sent: the server decides the price, the user and the date.
export async function purchaseProduct(productId) {
  const response = await httpClient.post('/purchases', { productId })
  return response.data
}

// GET /purchases/me?limit= -> the signed-in user's purchases, newest first
export async function getMyPurchases(limit) {
  const response = await httpClient.get('/purchases/me', {
    params: limit ? { limit } : {},
  })
  return response.data
}
