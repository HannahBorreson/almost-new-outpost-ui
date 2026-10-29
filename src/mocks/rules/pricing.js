// Mirrors the server's PricingService. Delete once the real API is in use.

export const DANGER_MULTIPLIER = 1.25

export function isDangerous(condition) {
  return condition !== 'Clear'
}

// 2.5 -> 3 and -2.5 -> -3 (like C#'s MidpointRounding.AwayFromZero)
export function roundHalfAwayFromZero(value) {
  return Math.sign(value) * Math.round(Math.abs(value))
}

export function currentPrice(basePrice, condition) {
  if (!isDangerous(condition)) return basePrice
  return roundHalfAwayFromZero(basePrice * DANGER_MULTIPLIER)
}
