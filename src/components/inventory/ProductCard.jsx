import { iconFor } from '../../utils/iconFor'
import './ProductCard.css'

// One product tile. Green = this user may buy it, red = not authorized.
// The words "Available" / "Unauthorized" carry the meaning too, not just colour.
export default function ProductCard({ product, onOpen }) {
  const Icon = iconFor(product.iconKey)
  const status = product.canPurchase ? 'ok' : 'denied'
  const statusText = product.canPurchase ? 'Available' : 'Unauthorized'
  const isRaised = product.currentPrice > product.basePrice

  return (
    // The whole card is clickable for mouse users; keyboard users use the button.
    <article className={`product-card product-card--${status}`} onClick={() => onOpen(product)}>
      <h3 className="product-card__name">{product.name}</h3>
      <Icon className="product-card__icon" size={60} strokeWidth={1.4} aria-hidden="true" />
      <p className="product-card__category">{product.categoryName}</p>
      <p className="product-card__price">
        <span className="product-card__current">{product.currentPrice} credits</span>
        {isRaised && (
          <s className="product-card__base">
            <span className="visually-hidden">was </span>
            {product.basePrice}
          </s>
        )}
      </p>
      <button
        type="button"
        className={`product-card__status product-card__status--${status}`}
        onClick={(event) => {
          event.stopPropagation()
          onOpen(product)
        }}
        aria-label={`${product.name}: ${statusText}. View details`}
      >
        {statusText}
      </button>
    </article>
  )
}
