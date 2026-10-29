// "2026-10-27T19:40:00Z" -> "2h ago"
export function formatRelativeTime(isoDate, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - Date.parse(isoDate)) / 1000))
  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// "2026-10-27T19:40:00Z" -> "Oct 27, 2026, 2:40 PM" (in the viewer's time zone)
export function formatDateTime(isoDate) {
  return new Date(isoDate).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
