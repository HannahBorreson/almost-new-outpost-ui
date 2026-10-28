import { describe, expect, it } from 'vitest'
import { authenticate, createMockToken } from './mockToken'

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600
const bearer = (payload) => `Bearer ${createMockToken(payload)}`

describe('authenticate (the mock JwtBearer check)', () => {
  it('returns the user for a valid token', () => {
    expect(authenticate(bearer({ sub: '3', exp: inOneHour() }))).toEqual({
      id: 3,
      username: 'medic',
      role: 'Medic',
    })
  })

  it('looks the user up by id, ignoring any role claimed in the token', () => {
    const user = authenticate(bearer({ sub: '1', role: 'MerchantAdmin', exp: inOneHour() }))
    expect(user.role).toBe('Citizen')
  })

  it.each([
    ['no header', undefined],
    ['not a Bearer header', 'Basic abc'],
    ['not a mock token', 'Bearer real.jwt.token'],
    ['missing payload', 'Bearer mock.'],
    ['unreadable payload', 'Bearer mock.%%%'],
  ])('rejects %s', (_label, header) => {
    expect(authenticate(header)).toBeNull()
  })

  it('rejects an expired token', () => {
    expect(authenticate(bearer({ sub: '3', exp: 1 }))).toBeNull()
  })

  it('rejects a token without exp', () => {
    expect(authenticate(bearer({ sub: '3' }))).toBeNull()
  })

  it('rejects an unknown user', () => {
    expect(authenticate(bearer({ sub: '999', exp: inOneHour() }))).toBeNull()
  })
})
