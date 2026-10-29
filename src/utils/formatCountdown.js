// 272 -> "4:32"
export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0))
  const minutes = Math.floor(safe / 60)
  const seconds = String(safe % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}
