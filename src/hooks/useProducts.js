import { useCallback, useEffect, useState } from 'react'
import { getProducts } from '../api/productsApi'

// Loads products whenever search, sort or refreshKey changes.
// refreshKey: pass anything that should trigger a reload (e.g. the weather condition).
export function useProducts({ search, sortBy, sortDir, refreshKey }) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let ignore = false // stops an old, slow response from overwriting a newer one
    setIsLoading(true)
    setError(null)

    getProducts({ search, sortBy, sortDir })
      .then((data) => {
        if (!ignore) setProducts(data)
      })
      .catch((err) => {
        if (!ignore) setError(err)
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [search, sortBy, sortDir, refreshKey, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return { products, isLoading, error, reload }
}
