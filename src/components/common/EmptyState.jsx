import { Sprout } from 'lucide-react'
import './EmptyState.css'

export default function EmptyState({ icon: Icon = Sprout, title, children }) {
  return (
    <div className="empty-state">
      <Icon size={36} strokeWidth={1.5} aria-hidden="true" />
      <p className="empty-state__title">{title}</p>
      {children && <div className="empty-state__text">{children}</div>}
    </div>
  )
}
