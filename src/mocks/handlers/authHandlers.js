// POST /auth/login and GET /auth/me
import { db } from '../mockDb'
import { createMockToken } from '../mockToken'
import { ok, problem, hasErrors } from '../mockResponses'

const TOKEN_LIFETIME_MINUTES = 60

export function login({ body }) {
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  const errors = {}
  if (!username) errors.username = ['Username is required.']
  if (!password) errors.password = ['Password is required.']
  if (hasErrors(errors)) return problem(400, 'One or more validation errors occurred.', errors)

  const user = db.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password,
  )
  // Same message whether the username or the password was wrong.
  if (!user) return problem(401, 'Invalid username or password.')

  const exp = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_MINUTES * 60
  const accessToken = createMockToken({
    sub: String(user.id),
    unique_name: user.username,
    role: user.role,
    exp,
  })

  return ok({
    accessToken,
    expiresAtUtc: new Date(exp * 1000).toISOString(),
    user: { id: user.id, username: user.username, role: user.role },
  })
}

export function getMe({ user }) {
  return ok(user)
}
