import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ProductCard from './ProductCard'
import ProductGrid from './ProductGrid'
import SearchSortPanel from './SearchSortPanel'
import WeatherBanner from './WeatherBanner'

const water = {
  productId: 1,
  name: 'Clean Water',
  categoryName: 'Basic',
  basePrice: 12,
  currentPrice: 12,
  canPurchase: true,
  iconKey: 'water',
}
const baton = { ...water, productId: 15, name: 'Stun Baton', categoryName: 'Security', canPurchase: false }

describe('ProductCard', () => {
  it('shows an available product', () => {
    render(<ProductCard product={water} onOpen={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Clean Water' })).toBeInTheDocument()
    expect(screen.getByText('12 credits')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clean Water: Available. View details' })).toBeInTheDocument()
    expect(screen.queryByText('was')).toBeNull()
  })

  it('marks a product the role cannot buy as unauthorized', () => {
    render(<ProductCard product={baton} onOpen={() => {}} />)
    expect(screen.getByRole('button', { name: /Unauthorized/ })).toHaveTextContent('Unauthorized')
  })

  it('strikes through the base price when the weather raised it', () => {
    render(<ProductCard product={{ ...water, currentPrice: 15 }} onOpen={() => {}} />)
    expect(screen.getByText('15 credits')).toBeInTheDocument()
    expect(screen.getByText('was').closest('s')).toHaveTextContent('was 12')
  })

  it('opens once from the button and once from the card', async () => {
    const onOpen = vi.fn()
    render(<ProductCard product={water} onOpen={onOpen} />)

    await userEvent.click(screen.getByRole('button'))
    expect(onOpen).toHaveBeenCalledTimes(1) // the button stops the card's click

    await userEvent.click(screen.getByRole('heading'))
    expect(onOpen).toHaveBeenCalledTimes(2)
    expect(onOpen).toHaveBeenCalledWith(water)
  })
})

describe('ProductGrid', () => {
  it('shows skeleton cards on the first load', () => {
    render(<ProductGrid products={[]} isLoading onOpen={() => {}} />)
    expect(screen.getByLabelText('Loading products')).toHaveAttribute('aria-busy', 'true')
  })

  it('shows an error with a retry button', async () => {
    const onRetry = vi.fn()
    render(<ProductGrid products={[]} error={new Error('Server down')} onRetry={onRetry} onOpen={() => {}} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Server down')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('explains an empty search', () => {
    render(<ProductGrid products={[]} searchText="laser" onOpen={() => {}} />)
    expect(screen.getByText('No products found for "laser".')).toBeInTheDocument()
  })

  it('explains an empty shop', () => {
    render(<ProductGrid products={[]} onOpen={() => {}} />)
    expect(screen.getByText('No products yet.')).toBeInTheDocument()
  })

  it('shows one card per product, keeping them while refreshing', () => {
    const { container } = render(<ProductGrid products={[water, baton]} isLoading onOpen={() => {}} />)
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(container.querySelector('.product-grid--refreshing')).toBeInTheDocument()
  })
})

describe('SearchSortPanel', () => {
  function renderPanel(props) {
    const handlers = { onSearchChange: vi.fn(), onSortByChange: vi.fn(), onSortDirChange: vi.fn() }
    render(<SearchSortPanel searchText="" sortBy="name" sortDir="asc" {...handlers} {...props} />)
    return handlers
  }

  it('reports search and sort changes to the parent', async () => {
    const handlers = renderPanel()
    await userEvent.type(screen.getByLabelText('Search products'), 'k')
    await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'price')
    await userEvent.selectOptions(screen.getByLabelText('Order'), 'desc')

    expect(handlers.onSearchChange).toHaveBeenCalledWith('k')
    expect(handlers.onSortByChange).toHaveBeenCalledWith('price')
    expect(handlers.onSortDirChange).toHaveBeenCalledWith('desc')
  })

  it('labels the order alphabetically when sorting by name', () => {
    renderPanel()
    expect(within(screen.getByLabelText('Order')).getByRole('option', { name: 'A to Z' })).toBeInTheDocument()
  })

  it('labels the order low/high when sorting by price', () => {
    renderPanel({ sortBy: 'price' })
    expect(within(screen.getByLabelText('Order')).getByRole('option', { name: 'High to low' })).toBeInTheDocument()
  })
})

describe('WeatherBanner', () => {
  const dustStorm = { displayName: 'Dust Storm', isDangerous: true, multiplier: 1.25, isStale: false }
  const clear = { displayName: 'Clear Conditions', isDangerous: false, multiplier: 1, isStale: false }

  it('says it is checking while the weather loads', () => {
    render(<WeatherBanner weather={null} />)
    expect(screen.getByRole('status')).toHaveTextContent('Checking the skies...')
  })

  it('says the report is unavailable after an error', () => {
    render(<WeatherBanner weather={null} error={new Error('x')} />)
    expect(screen.getByRole('status')).toHaveTextContent('Weather report unavailable right now.')
  })

  it('warns about dangerous weather with the surcharge and a countdown', () => {
    render(<WeatherBanner weather={dustStorm} secondsLeft={272} />)
    expect(screen.getByRole('status')).toHaveTextContent('DUST STORM ACTIVE. All prices increased by 25%.')
    expect(screen.getByText('4:32')).toBeInTheDocument()
  })

  it('shows clear weather with no adjustments', () => {
    render(<WeatherBanner weather={clear} />)
    expect(screen.getByRole('status')).toHaveTextContent('CLEAR CONDITIONS. No active price adjustments.')
  })

  it('notes when the weather is stale', () => {
    render(<WeatherBanner weather={{ ...clear, isStale: true }} />)
    expect(screen.getByText('(last known conditions)')).toBeInTheDocument()
  })
})
