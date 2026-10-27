import { useCallback, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ProductDetailsModal from '../../components/inventory/ProductDetailsModal'
import ProductGrid from '../../components/inventory/ProductGrid'
import RecentPurchasesPanel from '../../components/inventory/RecentPurchasesPanel'
import SearchSortPanel from '../../components/inventory/SearchSortPanel'
import { useDebounce } from '../../hooks/useDebounce'
import { useProducts } from '../../hooks/useProducts'
import { usePurchases } from '../../hooks/usePurchases'
import './InventoryPage.css'

export default function InventoryPage() {
  // Weather comes from AppLayout; when the condition changes, prices change too.
  const { weather } = useOutletContext()

  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const search = useDebounce(searchText, 300)
  const productsState = useProducts({ search, sortBy, sortDir, refreshKey: weather?.condition })
  const recent = usePurchases(5)

  const closeModal = useCallback(() => setSelectedProduct(null), [])
  const reloadRecent = recent.reload

  return (
    <div className="inventory">
      <h1 className="visually-hidden">Inventory</h1>

      <div className="inventory__side">
        <SearchSortPanel
          searchText={searchText}
          onSearchChange={setSearchText}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortDir={sortDir}
          onSortDirChange={setSortDir}
        />
      </div>

      <section className="inventory__grid" aria-label="Products">
        <ProductGrid
          products={productsState.products}
          isLoading={productsState.isLoading}
          error={productsState.error}
          onRetry={productsState.reload}
          onOpen={setSelectedProduct}
          searchText={search}
        />
      </section>

      <div className="inventory__recent">
        <RecentPurchasesPanel
          purchases={recent.purchases}
          isLoading={recent.isLoading}
          error={recent.error}
        />
      </div>

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={closeModal}
          onPurchased={reloadRecent}
        />
      )}
    </div>
  )
}
