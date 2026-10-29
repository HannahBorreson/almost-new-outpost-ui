import { Pencil, Trash2 } from 'lucide-react'
import Button from '../common/Button'
import { formatCredits } from '../../utils/formatCredits'
import { iconFor } from '../../utils/iconFor'

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Category</th>
            <th scope="col" className="data-table__num">Base Price</th>
            <th scope="col" className="data-table__actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const Icon = iconFor(product.iconKey)
            return (
              <tr key={product.productId}>
                <td>
                  <span className="data-table__name">
                    <Icon size={18} aria-hidden="true" />
                    {product.name}
                  </span>
                </td>
                <td>{product.categoryName}</td>
                <td className="data-table__num">{formatCredits(product.priceCredits)}</td>
                <td className="data-table__actions">
                  <Button size="sm" variant="outline" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}>
                    <Pencil size={14} aria-hidden="true" />
                    <span className="data-table__btn-text">Edit</span>
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`}>
                    <Trash2 size={14} aria-hidden="true" />
                    <span className="data-table__btn-text">Delete</span>
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
