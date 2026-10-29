import { Search } from 'lucide-react'
import GlassPanel from '../common/GlassPanel'
import './SearchSortPanel.css'

// Left sidebar: search box and sort controls. The parent owns the values;
// the server does the actual searching and sorting.
export default function SearchSortPanel({ searchText, onSearchChange, sortBy, onSortByChange, sortDir, onSortDirChange }) {
  const ascLabel = sortBy === 'price' ? 'Low to high' : 'A to Z'
  const descLabel = sortBy === 'price' ? 'High to low' : 'Z to A'

  return (
    <GlassPanel as="aside" className="search-sort" aria-label="Search and sort products">
      <div className="search-sort__search">
        <label htmlFor="product-search" className="visually-hidden">Search products</label>
        <Search size={18} className="search-sort__icon" aria-hidden="true" />
        <input
          id="product-search"
          type="search"
          className="field-input search-sort__input"
          placeholder="Search products..."
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
          maxLength={50}
          autoComplete="off"
        />
      </div>

      <p className="search-sort__heading">Sort options</p>

      <div className="search-sort__field">
        <label htmlFor="sort-by" className="search-sort__label">Sort by</label>
        <select
          id="sort-by"
          className="field-input"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
        >
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </div>

      <div className="search-sort__field">
        <label htmlFor="sort-dir" className="search-sort__label">Order</label>
        <select
          id="sort-dir"
          className="field-input"
          value={sortDir}
          onChange={(event) => onSortDirChange(event.target.value)}
        >
          <option value="asc">{ascLabel}</option>
          <option value="desc">{descLabel}</option>
        </select>
      </div>
    </GlassPanel>
  )
}
