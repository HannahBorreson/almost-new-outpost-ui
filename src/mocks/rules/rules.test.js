// These rules copy the server's rules, so the tests mirror the API's unit tests.
import { describe, expect, it } from 'vitest'
import { canRoleBuyCategory } from './categoryAccess'
import { currentPrice, DANGER_MULTIPLIER, isDangerous, roundHalfAwayFromZero } from './pricing'
import { getWeatherSnapshot, knownConditions } from './weatherClock'

describe('canRoleBuyCategory', () => {
  const categories = ['Basic', 'Exploration', 'Medical', 'Security']
  const allowed = {
    Citizen: ['Basic'],
    Scout: ['Basic', 'Exploration'],
    Medic: ['Basic', 'Medical'],
    Security: ['Basic', 'Security'],
    MerchantAdmin: categories,
  }

  for (const [role, canBuy] of Object.entries(allowed)) {
    for (const category of categories) {
      const expected = canBuy.includes(category)
      it(`${role} ${expected ? 'can' : 'cannot'} buy ${category}`, () => {
        expect(canRoleBuyCategory(role, category)).toBe(expected)
      })
    }
  }

  it('denies an unknown role everything', () => {
    expect(canRoleBuyCategory('Raider', 'Basic')).toBe(false)
  })
})

describe('pricing', () => {
  it('treats every condition except Clear as dangerous', () => {
    expect(isDangerous('Clear')).toBe(false)
    expect(isDangerous('Storm')).toBe(true)
    expect(isDangerous('DustStorm')).toBe(true)
    expect(isDangerous('RadiationEvent')).toBe(true)
  })

  it('rounds halves away from zero, like C#', () => {
    expect(roundHalfAwayFromZero(2.5)).toBe(3)
    expect(roundHalfAwayFromZero(-2.5)).toBe(-3)
    expect(roundHalfAwayFromZero(2.4)).toBe(2)
  })

  it('keeps the base price in clear weather', () => {
    expect(currentPrice(12, 'Clear')).toBe(12)
  })

  it('adds 25% in dangerous weather, rounded', () => {
    expect(DANGER_MULTIPLIER).toBe(1.25)
    expect(currentPrice(12, 'Storm')).toBe(15)
    expect(currentPrice(10, 'DustStorm')).toBe(13) // 12.5 -> 13
  })
})

describe('getWeatherSnapshot', () => {
  const FIVE_MINUTES = 5 * 60 * 1000

  it('follows the schedule from the clock', () => {
    expect(getWeatherSnapshot(null, 0).condition).toBe('Clear')
    expect(getWeatherSnapshot(null, FIVE_MINUTES).condition).toBe('DustStorm')
    expect(getWeatherSnapshot(null, 3 * FIVE_MINUTES).condition).toBe('Storm')
    // The six-step sequence repeats
    expect(getWeatherSnapshot(null, 7 * FIVE_MINUTES).condition).toBe('DustStorm')
  })

  it('describes a clear slot', () => {
    const snapshot = getWeatherSnapshot(null, 60_000)
    expect(snapshot).toMatchObject({
      condition: 'Clear',
      displayName: 'Clear Conditions',
      isDangerous: false,
      multiplier: 1,
      source: 'Mock',
      isStale: false,
      fetchedAtUtc: new Date(0).toISOString(),
      nextRefreshUtc: new Date(FIVE_MINUTES).toISOString(),
      serverTimeUtc: new Date(60_000).toISOString(),
    })
  })

  it('uses an override instead of the schedule', () => {
    const snapshot = getWeatherSnapshot('RadiationEvent', 0)
    expect(snapshot).toMatchObject({
      condition: 'RadiationEvent',
      displayName: 'Radiation Event',
      isDangerous: true,
      multiplier: 1.25,
      source: 'Override',
    })
  })

  it('knows all four conditions', () => {
    expect(knownConditions).toEqual(['Clear', 'Storm', 'DustStorm', 'RadiationEvent'])
  })
})
