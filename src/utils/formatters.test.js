import { Package, Droplets } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { formatCountdown } from './formatCountdown'
import { formatCredits } from './formatCredits'
import { formatDateTime, formatRelativeTime } from './formatRelativeTime'
import { formatRole } from './formatRole'
import { iconFor, iconKeys } from './iconFor'

describe('formatCountdown', () => {
  it('shows minutes and zero-padded seconds', () => {
    expect(formatCountdown(272)).toBe('4:32')
    expect(formatCountdown(65)).toBe('1:05')
    expect(formatCountdown(0)).toBe('0:00')
  })

  it('never goes below zero and treats missing values as zero', () => {
    expect(formatCountdown(-10)).toBe('0:00')
    expect(formatCountdown(undefined)).toBe('0:00')
    expect(formatCountdown(9.9)).toBe('0:09')
  })
})

describe('formatCredits', () => {
  it('uses "credit" for exactly one and "credits" otherwise', () => {
    expect(formatCredits(1)).toBe('1 credit')
    expect(formatCredits(0)).toBe('0 credits')
    expect(formatCredits(12)).toBe('12 credits')
  })

  it('adds a thousands separator', () => {
    expect(formatCredits(1250)).toBe(`${(1250).toLocaleString()} credits`)
  })

  it('treats non-numbers as zero', () => {
    expect(formatCredits('abc')).toBe('0 credits')
  })
})

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-10-27T20:00:00Z')

  it.each([
    ['2026-10-27T19:59:30Z', 'just now'],
    ['2026-10-27T19:55:00Z', '5m ago'],
    ['2026-10-27T17:00:00Z', '3h ago'],
    ['2026-10-25T20:00:00Z', '2d ago'],
  ])('%s -> %s', (iso, expected) => {
    expect(formatRelativeTime(iso, now)).toBe(expected)
  })

  it('treats a date in the future as "just now"', () => {
    expect(formatRelativeTime('2026-10-28T20:00:00Z', now)).toBe('just now')
  })
})

describe('formatDateTime', () => {
  it('includes the year', () => {
    expect(formatDateTime('2026-10-27T19:40:00Z')).toContain('2026')
  })
})

describe('formatRole', () => {
  it('splits camel-case role names into words', () => {
    expect(formatRole('MerchantAdmin')).toBe('Merchant Admin')
    expect(formatRole('Medic')).toBe('Medic')
  })

  it('returns an empty string for a missing role', () => {
    expect(formatRole(undefined)).toBe('')
  })
})

describe('iconFor', () => {
  it('maps a known icon key to its icon', () => {
    expect(iconFor('water')).toBe(Droplets)
  })

  it('falls back to the package icon for unknown or missing keys', () => {
    expect(iconFor('not-a-key')).toBe(Package)
    expect(iconFor(null)).toBe(Package)
  })

  it('lists every key for the admin dropdown', () => {
    expect(iconKeys).toContain('first-aid')
    expect(iconKeys.length).toBeGreaterThan(10)
  })
})
