import { describe, expect, it } from 'vitest'
import { createMockToken } from '../mocks/mockToken'
import { clearToken, getToken, isTokenExpired, readTokenPayload, saveToken } from './tokenStorage'

const KEY = 'outpost.accessToken'
const inOneHour = () => Math.floor(Date.now() / 1000) + 3600

describe('saveToken / getToken / clearToken', () => {
  it('"Remember me" keeps the token in localStorage', () => {
    saveToken('abc', true)
    expect(localStorage.getItem(KEY)).toBe('abc')
    expect(sessionStorage.getItem(KEY)).toBeNull()
    expect(getToken()).toBe('abc')
  })

  it('without "Remember me" the token goes in sessionStorage', () => {
    saveToken('abc', false)
    expect(sessionStorage.getItem(KEY)).toBe('abc')
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(getToken()).toBe('abc')
  })

  it('saving replaces a token kept in the other storage', () => {
    saveToken('old', true)
    saveToken('new', false)
    expect(localStorage.getItem(KEY)).toBeNull()
    expect(getToken()).toBe('new')
  })

  it('clearToken removes it from both', () => {
    localStorage.setItem(KEY, 'a')
    sessionStorage.setItem(KEY, 'b')
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('readTokenPayload', () => {
  it('decodes the middle part of a token', () => {
    const token = createMockToken({ sub: '3', role: 'Medic', exp: 123 })
    expect(readTokenPayload(token)).toEqual({ sub: '3', role: 'Medic', exp: 123 })
  })

  it('decodes a real JWT-shaped token (header.payload.signature)', () => {
    const payload = btoa(JSON.stringify({ sub: '5' })).replace(/=+$/, '')
    expect(readTokenPayload(`header.${payload}.signature`)).toEqual({ sub: '5' })
  })

  it('returns null for garbage', () => {
    expect(readTokenPayload('not-a-token')).toBeNull()
    expect(readTokenPayload('a.!!!.c')).toBeNull()
    expect(readTokenPayload(null)).toBeNull()
  })
})

describe('isTokenExpired', () => {
  it('is false before exp', () => {
    expect(isTokenExpired(createMockToken({ exp: inOneHour() }))).toBe(false)
  })

  it('is true at or after exp', () => {
    expect(isTokenExpired(createMockToken({ exp: Math.floor(Date.now() / 1000) - 1 }))).toBe(true)
  })

  it('is true when there is no exp or the token cannot be read', () => {
    expect(isTokenExpired(createMockToken({ sub: '1' }))).toBe(true)
    expect(isTokenExpired('garbage')).toBe(true)
  })
})
