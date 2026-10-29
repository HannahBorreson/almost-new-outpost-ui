import { useEffect, useState } from 'react'

// Returns `value`, but only after it has stopped changing for `delayMs`.
// Used so the search box doesn't call the API on every keystroke.
export function useDebounce(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
