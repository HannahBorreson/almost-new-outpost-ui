import { useCallback, useEffect, useState } from 'react'
import { getMyPurchases } from '../api/purchasesApi'

// Loads the signed-in user's purchases (newest first). limit is optional.
export function usePurchases(limit) {
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    setError(null)

    getMyPurchases(limit)
      .then((data) => {
        if (!ignore) setPurchases(data)
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
  }, [limit, reloadCount])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  return { purchases, isLoading, error, reload }
}
