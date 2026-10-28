// The add/edit product form, answered by the mock API as an admin.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveToken } from '../../auth/tokenStorage'
import { createMockToken } from '../../mocks/mockToken'
import ProductForm from './ProductForm'

const categories = [
  { categoryId: 1, categoryName: 'Basic' },
  { categoryId: 3, categoryName: 'Medical' },
]
const SLOW = { timeout: 2000 }

beforeEach(() => {
  saveToken(createMockToken({ sub: '5', exp: Math.floor(Date.now() / 1000) + 3600 }), false) // admin
})

describe('ProductForm', () => {
  it('shows the server\'s messages under each field', async () => {
    render(<ProductForm categories={categories} onClose={() => {}} onSaved={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add product' }))

    expect(await screen.findByText('Name is required.', {}, SLOW)).toBeInTheDocument()
    expect(screen.getByText('Choose a valid category.')).toBeInTheDocument()
    expect(screen.getByText('Price must be a whole number from 1 to 100,000.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('One or more validation errors occurred.')
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
  })

  it('adds a product', async () => {
    const onSaved = vi.fn()
    const user = userEvent.setup()
    render(<ProductForm categories={categories} onClose={() => {}} onSaved={onSaved} />)

    await user.type(screen.getByLabelText('Name'), 'Splint')
    await user.selectOptions(screen.getByLabelText('Category'), '3')
    await user.type(screen.getByLabelText('Base price (credits)'), '30')
    await user.selectOptions(screen.getByLabelText(/Icon/), 'bandage')
    await user.click(screen.getByRole('button', { name: 'Add product' }))

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled(), SLOW)
    expect(onSaved.mock.calls[0][0]).toMatchObject({ name: 'Splint', categoryName: 'Medical', priceCredits: 30, iconKey: 'bandage' })
  })

  it('edits an existing product', async () => {
    const onSaved = vi.fn()
    const water = { productId: 1, name: 'Clean Water', description: null, categoryId: 1, priceCredits: 12, iconKey: 'water' }
    const user = userEvent.setup()
    render(<ProductForm product={water} categories={categories} onClose={() => {}} onSaved={onSaved} />)

    expect(screen.getByRole('dialog', { name: 'Edit Clean Water' })).toBeInTheDocument()
    const price = screen.getByLabelText('Base price (credits)')
    expect(price).toHaveValue(12)
    await user.clear(price)
    await user.type(price, '14')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await vi.waitFor(() => expect(onSaved).toHaveBeenCalled(), SLOW)
    expect(onSaved.mock.calls[0][0]).toMatchObject({ productId: 1, priceCredits: 14 })
  })

  it('cancels', async () => {
    const onClose = vi.fn()
    render(<ProductForm categories={categories} onClose={onClose} onSaved={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })
})
