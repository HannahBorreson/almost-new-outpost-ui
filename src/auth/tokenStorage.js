// Where the access token lives in the browser.
// Remember me checked   -> localStorage   (survives closing the browser)
// Remember me unchecked -> sessionStorage (cleared when the tab session ends)
const TOKEN_KEY = 'outpost.accessToken'

export function saveToken(token, rememberMe) {
  clearToken()
  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

// Reads the payload (middle part) of a JWT: header.PAYLOAD.signature
// The mock token "mock.PAYLOAD" is decoded the same way.
// This only READS the token; the server is what verifies it.
export function readTokenPayload(token) {
  try {
    const payloadPart = token.split('.')[1]
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = readTokenPayload(token)
  if (!payload || !payload.exp) return true
  return payload.exp * 1000 <= Date.now()
}
