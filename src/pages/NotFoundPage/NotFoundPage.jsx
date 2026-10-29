import { Link } from 'react-router-dom'
import BrandMark from '../../components/layout/BrandMark'
import GlassPanel from '../../components/common/GlassPanel'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <GlassPanel className="not-found__card">
        <BrandMark size={88} />
        <h1>This aisle is overgrown.</h1>
        <p>The page you're looking for has gone back to nature.</p>
        <Link to="/inventory" className="not-found__link">Back to Inventory</Link>
      </GlassPanel>
    </main>
  )
}
