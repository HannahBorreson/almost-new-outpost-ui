import httpClient from './httpClient'

// POST /auth/login -> { accessToken, expiresAtUtc, user: { id, username, role } }
export async function login(username, password) {
  const response = await httpClient.post('/auth/login', { username, password })
  return response.data
}

// GET /auth/me -> { id, username, role }
export async function getMe() {
  const response = await httpClient.get('/auth/me')
  return response.data
}
