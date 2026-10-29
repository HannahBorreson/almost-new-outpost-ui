import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { formatRole } from '../../utils/formatRole'
import Button from '../common/Button'
import BrandMark from './BrandMark'
import './NavBar.css'

export default function NavBar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar glass-panel">
      <NavLink to="/inventory" className="navbar__brand">
        <BrandMark size={44} />
        <span className="navbar__brand-text">
          <span className="navbar__name">Almost New 24/7 Outpost</span>
          <span className="navbar__tagline">Mostly New Goods Since The Collapse</span>
        </span>
      </NavLink>

      <nav className="navbar__links" aria-label="Main">
        <NavLink to="/inventory" className="navbar__link">Inventory</NavLink>
        <NavLink to="/purchases" className="navbar__link">Purchase History</NavLink>
        {isAdmin && (
          <NavLink to="/admin/products" className="navbar__link">Manage Products</NavLink>
        )}
      </nav>

      <div className="navbar__user">
        <span className="navbar__who">
          Logged In As: <strong>{formatRole(user?.role)}</strong>
        </span>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          Logout
        </Button>
      </div>
    </header>
  )
}
