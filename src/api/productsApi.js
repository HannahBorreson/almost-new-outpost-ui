import httpClient from './httpClient'

// GET /products?search=&sortBy=name|price&sortDir=asc|desc
// The server filters and sorts; the page never does it locally.
export async function getProducts({ search = '', sortBy = 'name', sortDir = 'asc' } = {}) {
  const response = await httpClient.get('/products', {
    params: { search, sortBy, sortDir },
  })
  return response.data
}

// GET /products/{id}
export async function getProduct(productId) {
  const response = await httpClient.get(`/products/${productId}`)
  return response.data
}

// GET /categories -> [{ categoryId, categoryName }]
export async function getCategories() {
  const response = await httpClient.get('/categories')
  return response.data
}
