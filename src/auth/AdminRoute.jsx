import { Navigate } from 'react-router-dom'
import Spinner from '../components/common/Spinner'
import { useAuth } from './useAuth'

// Only MerchantAdmin gets through; other signed-in users go back to /inventory.
// This is a convenience for the UI only - the API enforces the real rule.
export default function AdminRoute({ children }) {
  const { user, isAdmin, isChecking } = useAuth()

  if (isChecking) return <Spinner fullPage label="Checking your outpost pass..." />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/inventory" replace />

  return children
}
