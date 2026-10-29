import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ConfirmDialog from '../admin/ConfirmDialog'
import Alert from './Alert'
import Button from './Button'
import EmptyState from './EmptyState'
import Modal from './Modal'
import Spinner from './Spinner'

describe('Button', () => {
  it('is a plain button by default and calls onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Buy</Button>)
    const button = screen.getByRole('button', { name: 'Buy' })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('btn', 'btn--primary', 'btn--md')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled and busy while loading', () => {
    render(<Button isLoading variant="danger" size="sm" fullWidth>Delete</Button>)
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveClass('btn--danger', 'btn--sm', 'btn--full')
  })
})

describe('Alert', () => {
  it('announces errors as an alert', () => {
    render(<Alert title="It broke">Details</Alert>)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('It broke')
    expect(alert).toHaveTextContent('Details')
  })

  it('uses role="status" for other tones and shows an action', () => {
    render(<Alert tone="success" title="Saved" action={<button>Undo</button>} />)
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('falls back to the info icon for an unknown tone', () => {
    render(<Alert tone="mystery" title="Hmm" />)
    expect(screen.getByRole('status')).toHaveClass('alert--mystery')
  })
})

describe('Spinner', () => {
  it('shows a full-page status with a default label', () => {
    render(<Spinner fullPage />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading...')
  })

  it('shows an inline label', () => {
    render(<Spinner label="Saving" />)
    expect(screen.getByRole('status')).toHaveTextContent('Saving')
  })

  it('is just a hidden spinner without a label', () => {
    const { container } = render(<Spinner size="lg" />)
    expect(screen.queryByRole('status')).toBeNull()
    expect(container.querySelector('.spinner--lg')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('shows the title and text', () => {
    render(<EmptyState title="Nothing here">Try again later.</EmptyState>)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Try again later.')).toBeInTheDocument()
  })
})

describe('Modal', () => {
  it('is a labelled dialog that focuses its first control', () => {
    render(<Modal title="Details" onClose={() => {}}><input aria-label="Qty" /></Modal>)
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('closes on Escape, the close button and a backdrop click', async () => {
    const onClose = vi.fn()
    render(<Modal title="Details" onClose={onClose}>Body</Modal>)

    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await userEvent.click(document.querySelector('.modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('does not close when clicking inside the dialog', async () => {
    const onClose = vi.fn()
    render(<Modal title="Details" onClose={onClose}>Body text</Modal>)
    await userEvent.click(screen.getByText('Body text'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps Tab inside the dialog', async () => {
    render(
      <Modal title="Form" onClose={() => {}} footer={<button>Save</button>}>
        <input aria-label="Name" />
      </Modal>,
    )
    const close = screen.getByRole('button', { name: 'Close' })
    const save = screen.getByRole('button', { name: 'Save' })

    save.focus()
    await userEvent.tab()
    expect(close).toHaveFocus() // wrapped from last to first

    await userEvent.tab({ shift: true })
    expect(save).toHaveFocus() // wrapped from first to last
  })

  it('restores focus and scrolling when it closes', () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()

    const { unmount } = render(<Modal title="Details" onClose={() => {}}>Body</Modal>)
    unmount()
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
    opener.remove()
  })
})

describe('ConfirmDialog', () => {
  it('confirms, cancels and shows an error', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog title="Delete Water?" confirmLabel="Delete" onConfirm={onConfirm} onCancel={onCancel} error="It has purchases.">
        This can't be undone.
      </ConfirmDialog>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('It has purchases.')
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
