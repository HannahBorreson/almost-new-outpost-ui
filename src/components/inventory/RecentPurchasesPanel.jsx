import { Link } from 'react-router-dom'
import GlassPanel from '../common/GlassPanel'
import Spinner from '../common/Spinner'
import { formatRelativeTime } from '../../utils/formatRelativeTime'
import './RecentPurchasesPanel.css'

export default function RecentPurchasesPanel({ purchases, isLoading, error }) {
  let content
  if (error) {
    content = <p className="recent__muted">Couldn't load your purchases.</p>
  } else if (isLoading && purchases.length === 0) {
    content = <Spinner size="sm" label="Loading..." />
  } else if (purchases.length === 0) {
    content = <p className="recent__muted">No purchases yet.</p>
  } else {
    content = (
      <ul className="recent__list">
        {purchases.map((purchase) => (
          <li key={purchase.purchaseId}>
            <span className="recent__name">{purchase.productName}</span>
            <span className="recent__time"> — {formatRelativeTime(purchase.purchaseDate)}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <GlassPanel as="section" className="recent" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="recent__heading">Recent purchases</h2>
      {content}
      {purchases.length > 0 && (
        <Link to="/purchases" className="recent__link">View full history</Link>
      )}
    </GlassPanel>
  )
}
