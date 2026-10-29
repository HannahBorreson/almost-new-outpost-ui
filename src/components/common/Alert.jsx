import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import './Alert.css'

const icons = { error: CircleAlert, success: CircleCheck, warning: TriangleAlert, info: Info }

// tone: error | success | warning | info. `action` is an optional button (e.g. Retry).
export default function Alert({ tone = 'error', title, children, action, className = '' }) {
  const Icon = icons[tone] || Info
  const role = tone === 'error' ? 'alert' : 'status'

  return (
    <div className={`alert alert--${tone} ${className}`} role={role}>
      <Icon className="alert__icon" size={20} aria-hidden="true" />
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        {children && <div className="alert__text">{children}</div>}
      </div>
      {action && <div className="alert__action">{action}</div>}
    </div>
  )
}
