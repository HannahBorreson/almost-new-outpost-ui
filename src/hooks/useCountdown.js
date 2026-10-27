import { useEffect, useState } from 'react'

// Whole seconds left until `targetIso`, ticking once per second.
// clockOffsetMs = server clock minus browser clock, so a wrong PC clock
// doesn't break the countdown. Returns null when there is no target.
export function useCountdown(targetIso, clockOffsetMs = 0) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!targetIso) return
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [targetIso])

  if (!targetIso) return null
  const msLeft = Date.parse(targetIso) - (now + clockOffsetMs)
  return Math.max(0, Math.ceil(msLeft / 1000))
}
