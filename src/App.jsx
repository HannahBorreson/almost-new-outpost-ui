import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './auth/AdminRoute'
import ProtectedRoute from './auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import AdminProductsPage from './pages/AdminProductsPage/AdminProductsPage'
import InventoryPage from './pages/InventoryPage/InventoryPage'
import LoginPage from './pages/LoginPage/LoginPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import PurchaseHistoryPage from './pages/PurchaseHistoryPage/PurchaseHistoryPage'

// The route table. Guards decide who may see each page.
export default function App() {
  return (
    <Routes>
      {/* "/" -> /inventory when signed in (ProtectedRoute sends everyone else to /login) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/inventory" replace />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginPage />} />

      {/* Signed-in pages share the nav bar, weather banner and background */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/purchases" element={<PurchaseHistoryPage />} />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
