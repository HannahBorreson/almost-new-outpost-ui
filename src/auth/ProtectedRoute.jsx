import { Navigate, useLocation } from 'react-router-dom'
import Spinner from '../components/common/Spinner'
import { useAuth } from './useAuth'

// Only signed-in users get through; everyone else goes to /login.
export default function ProtectedRoute({ children }) {
  const { user, isChecking } = useAuth()
  const location = useLocation()

  if (isChecking) return <Spinner fullPage label="Checking your outpost pass..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return children
}
