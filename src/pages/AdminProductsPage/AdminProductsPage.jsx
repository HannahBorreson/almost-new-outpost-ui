import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { deleteProduct, getAdminProducts } from '../../api/adminApi'
import { getCategories } from '../../api/productsApi'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import ProductForm from '../../components/admin/ProductForm'
import ProductTable from '../../components/admin/ProductTable'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import GlassPanel from '../../components/common/GlassPanel'
import Spinner from '../../components/common/Spinner'
import './AdminProductsPage.css'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [notice, setNotice] = useState('')

  // editing: null = form closed, 'new' = adding, a product = editing it
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [productList, categoryList] = await Promise.all([getAdminProducts(), getCategories()])
      setProducts(productList)
      setCategories(categoryList)
    } catch (err) {
      setLoadError(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  function handleSaved(saved) {
    setNotice(editing === 'new' ? `Added "${saved.name}".` : `Saved "${saved.name}".`)
    setEditing(null)
    loadAll()
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await deleteProduct(deleting.productId)
      setNotice(`Deleted "${deleting.name}".`)
      setDeleting(null)
      loadAll()
    } catch (err) {
      setDeleteError(
        err.status === 409 ? "This product has purchase history and can't be deleted." : err.message,
      )
    } finally {
      setIsDeleting(false)
    }
  }

  let content
  if (loadError) {
    content = (
      <Alert
        tone="error"
        title="We couldn't load the products."
        action={<Button size="sm" variant="outline" onClick={loadAll}>Retry</Button>}
      >
        {loadError.message}
      </Alert>
    )
  } else if (isLoading && products.length === 0) {
    content = <Spinner label="Loading products..." />
  } else if (products.length === 0) {
    content = <EmptyState title="No products yet.">Use Add Product to stock the first shelf.</EmptyState>
  } else {
    content = (
      <ProductTable
        products={products}
        onEdit={(product) => setEditing(product)}
        onDelete={(product) => {
          setDeleteError('')
          setDeleting(product)
        }}
      />
    )
  }

  return (
    <GlassPanel as="section" className="admin-products" aria-labelledby="admin-title">
      <div className="admin-products__header">
        <h1 id="admin-title" className="page-title">Manage Products</h1>
        <Button variant="ok" onClick={() => setEditing('new')} disabled={categories.length === 0}>
          <Plus size={18} aria-hidden="true" /> Add Product
        </Button>
      </div>

      {notice && (
        <Alert tone="success" title={notice} className="admin-products__notice" />
      )}

      {content}

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete product?"
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleting(null)}
          isWorking={isDeleting}
          error={deleteError}
        >
          <p>
            Remove <strong>{deleting.name}</strong> from the outpost? This can't be undone.
          </p>
        </ConfirmDialog>
      )}
    </GlassPanel>
  )
}
