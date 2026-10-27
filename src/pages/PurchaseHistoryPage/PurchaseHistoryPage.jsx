import { ReceiptText } from 'lucide-react'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import GlassPanel from '../../components/common/GlassPanel'
import Spinner from '../../components/common/Spinner'
import { usePurchases } from '../../hooks/usePurchases'
import { formatCredits } from '../../utils/formatCredits'
import { formatDateTime } from '../../utils/formatRelativeTime'
import './PurchaseHistoryPage.css'

export default function PurchaseHistoryPage() {
  const { purchases, isLoading, error, reload } = usePurchases()

  let content
  if (error) {
    content = (
      <Alert
        tone="error"
        title="We couldn't load your purchase history."
        action={<Button size="sm" variant="outline" onClick={reload}>Retry</Button>}
      >
        {error.message}
      </Alert>
    )
  } else if (isLoading) {
    content = <Spinner label="Loading your purchases..." />
  } else if (purchases.length === 0) {
    content = (
      <EmptyState icon={ReceiptText} title="No purchases yet.">
        Anything you buy at the outpost will be listed here.
      </EmptyState>
    )
  } else {
    content = (
      <div className="table-scroll">
        <table className="data-table">
          <caption className="visually-hidden">Your purchases, newest first</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Product Name</th>
              <th scope="col" className="data-table__num">Final Price</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.purchaseId}>
                <td className="data-table__nowrap">{formatDateTime(purchase.purchaseDate)}</td>
                <td>{purchase.productName}</td>
                <td className="data-table__num">{formatCredits(purchase.finalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <GlassPanel as="section" className="history" aria-labelledby="history-title">
      <h1 id="history-title" className="page-title">Purchase History</h1>
      {content}
    </GlassPanel>
  )
}
