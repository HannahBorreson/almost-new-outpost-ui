// A FAKE, NON-SECURE token for mock mode: "mock.<base64url JSON payload>".
// It is shaped so the payload sits in the same place as a real JWT's
// (token.split('.')[1]), which lets the UI decode both the same way.
// Nothing is signed, so never use this outside mock mode.
import { db } from './mockDb'

function toBase64Url(text) {
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text) {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return atob(padded)
}

// payload: { sub, unique_name, role, exp }  (exp = seconds since 1970, like a JWT)
export function createMockToken(payload) {
  return 'mock.' + toBase64Url(JSON.stringify(payload))
}

// Plays the part of the JwtBearer middleware: returns the signed-in user,
// or null when the token is missing, malformed, expired or for an unknown user.
export function authenticate(authorizationHeader) {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) return null

  const token = authorizationHeader.slice('Bearer '.length)
  const parts = token.split('.')
  if (parts[0] !== 'mock' || !parts[1]) return null

  let payload
  try {
    payload = JSON.parse(fromBase64Url(parts[1]))
  } catch {
    return null
  }

  const isExpired = !payload.exp || payload.exp * 1000 <= Date.now()
  if (isExpired) return null

  const user = db.users.find((u) => String(u.id) === String(payload.sub))
  if (!user) return null

  return { id: user.id, username: user.username, role: user.role }
}
