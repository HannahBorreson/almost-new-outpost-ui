import { SearchX } from 'lucide-react'
import Alert from '../common/Alert'
import Button from '../common/Button'
import EmptyState from '../common/EmptyState'
import GlassPanel from '../common/GlassPanel'
import ProductCard from './ProductCard'
import './ProductGrid.css'

function SkeletonCard() {
  return (
    <div className="product-card product-card--skeleton" aria-hidden="true">
      <div className="skeleton-bar" style={{ width: '70%', height: 18 }} />
      <div className="skeleton-bar" style={{ width: 60, height: 60, borderRadius: 12, margin: '8px 0' }} />
      <div className="skeleton-bar" style={{ width: '40%', height: 12 }} />
      <div className="skeleton-bar" style={{ width: '50%', height: 14 }} />
      <div className="skeleton-bar" style={{ width: '100%', height: 36 }} />
    </div>
  )
}

export default function ProductGrid({ products, isLoading, error, onRetry, onOpen, searchText }) {
  if (error) {
    return (
      <Alert
        tone="error"
        title="We couldn't load the shelves."
        action={<Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}
      >
        {error.message}
      </Alert>
    )
  }

  // First load: show placeholder cards
  if (isLoading && products.length === 0) {
    return (
      <div className="product-grid" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <GlassPanel>
        <EmptyState icon={SearchX} title="Nothing on the shelves matches that.">
          {searchText ? `No products found for "${searchText}".` : 'No products yet.'}
        </EmptyState>
      </GlassPanel>
    )
  }

  return (
    <div className={`product-grid ${isLoading ? 'product-grid--refreshing' : ''}`} aria-busy={isLoading}>
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} onOpen={onOpen} />
      ))}
    </div>
  )
}
