import { useEffect, useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import { purchaseProduct } from '../../api/purchasesApi'
import Alert from '../common/Alert'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { formatCredits } from '../../utils/formatCredits'
import { iconFor } from '../../utils/iconFor'
import './ProductDetailsModal.css'

const CLOSE_AFTER_SUCCESS_MS = 1500

export default function ProductDetailsModal({ product, onClose, onPurchased }) {
  const [isBuying, setIsBuying] = useState(false)
  const [error, setError] = useState(null)
  const [purchase, setPurchase] = useState(null)

  // After a successful purchase, show the message briefly, then close.
  useEffect(() => {
    if (!purchase) return
    const timer = setTimeout(onClose, CLOSE_AFTER_SUCCESS_MS)
    return () => clearTimeout(timer)
  }, [purchase, onClose])

  async function handlePurchase() {
    setIsBuying(true)
    setError(null)
    try {
      // Unauthorized products still send the request on purpose:
      // the server is the one that says no (403).
      const result = await purchaseProduct(product.productId)
      setPurchase(result)
      onPurchased(result)
    } catch (err) {
      setError(err)
    } finally {
      setIsBuying(false)
    }
  }

  const Icon = iconFor(product.iconKey)
  const isRaised = product.currentPrice > product.basePrice
  const StatusIcon = product.canPurchase ? CircleCheck : CircleX

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose}>Close</Button>
      <Button
        variant={product.canPurchase ? 'ok' : 'danger'}
        onClick={handlePurchase}
        isLoading={isBuying}
        disabled={Boolean(purchase)}
      >
        Purchase
      </Button>
    </>
  )

  return (
    <Modal title={product.name} onClose={onClose} footer={footer}>
      <div className="details">
        <div className={`details__icon details__icon--${product.canPurchase ? 'ok' : 'denied'}`}>
          <Icon size={56} strokeWidth={1.4} aria-hidden="true" />
        </div>
        <dl className="details__facts">
          <div>
            <dt>Category</dt>
            <dd>{product.categoryName}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>
              <strong>{formatCredits(product.currentPrice)}</strong>
              {isRaised && (
                <s className="details__base">
                  <span className="visually-hidden">was </span>
                  {formatCredits(product.basePrice)}
                </s>
              )}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className={`details__status details__status--${product.canPurchase ? 'ok' : 'denied'}`}>
              <StatusIcon size={16} aria-hidden="true" />
              {product.canPurchase ? 'Available' : 'Unauthorized'}
            </dd>
          </div>
        </dl>
      </div>

      <p className="details__description">{product.description || 'No description yet.'}</p>

      {purchase && (
        <Alert tone="success" title={`Purchased for ${formatCredits(purchase.finalPrice)}`} />
      )}
      {error && <Alert tone="error" title={error.message} />}
    </Modal>
  )
}
