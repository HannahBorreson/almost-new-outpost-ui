import { useState } from 'react'
import { createProduct, updateProduct } from '../../api/adminApi'
import Alert from '../common/Alert'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { iconFor, iconKeys } from '../../utils/iconFor'
import './ProductForm.css'

const emptyProduct = { name: '', description: '', categoryId: '', priceCredits: '', iconKey: '' }

// ASP.NET may send "Name" or "name" as the error key, so check both.
function errorFor(errors, field) {
  const pascal = field.charAt(0).toUpperCase() + field.slice(1)
  const messages = errors[field] || errors[pascal]
  return messages ? messages.join(' ') : ''
}

// The red message under a field (renders nothing when the field is fine).
function FieldError({ errors, field }) {
  const message = errorFor(errors, field)
  if (!message) return null
  return <p id={`product-${field}-error`} className="field-error">{message}</p>
}

// Add / edit form. The server does the real validation; its messages
// are shown under each field.
export default function ProductForm({ product, categories, onClose, onSaved }) {
  const isEdit = Boolean(product)
  const [values, setValues] = useState(() =>
    product
      ? {
          name: product.name,
          description: product.description || '',
          categoryId: String(product.categoryId),
          priceCredits: String(product.priceCredits),
          iconKey: product.iconKey || '',
        }
      : emptyProduct,
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setErrors({})
    setFormError('')

    const body = {
      name: values.name,
      description: values.description,
      categoryId: values.categoryId === '' ? null : Number(values.categoryId),
      priceCredits: values.priceCredits === '' ? null : Number(values.priceCredits),
      iconKey: values.iconKey,
    }

    try {
      const saved = isEdit
        ? await updateProduct(product.productId, body)
        : await createProduct(body)
      onSaved(saved)
    } catch (err) {
      setErrors(err.errors || {})
      setFormError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // One labelled input with its error message underneath.
  function fieldProps(field) {
    const message = errorFor(errors, field)
    return {
      id: `product-${field}`,
      name: field,
      value: values[field],
      onChange: handleChange,
      className: 'field-input',
      'aria-invalid': message ? true : undefined,
      'aria-describedby': message ? `product-${field}-error` : undefined,
    }
  }

  const PreviewIcon = iconFor(values.iconKey)

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="ok" type="submit" form="product-form" isLoading={isSaving}>
        {isEdit ? 'Save changes' : 'Add product'}
      </Button>
    </>
  )

  return (
    <Modal title={isEdit ? `Edit ${product.name}` : 'Add product'} onClose={onClose} footer={footer} size="lg">
      <form id="product-form" className="product-form" onSubmit={handleSubmit} noValidate>
        {formError && <Alert tone="error" title={formError} />}

        <div className="form-field">
          <label htmlFor="product-name">Name</label>
          <input type="text" maxLength={100} {...fieldProps('name')} />
          <FieldError errors={errors} field="name" />
        </div>

        <div className="form-field">
          <label htmlFor="product-description">Description <span className="optional">(optional)</span></label>
          <textarea rows={3} maxLength={500} {...fieldProps('description')} />
          <FieldError errors={errors} field="description" />
        </div>

        <div className="product-form__row">
          <div className="form-field">
            <label htmlFor="product-categoryId">Category</label>
            <select {...fieldProps('categoryId')}>
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            <FieldError errors={errors} field="categoryId" />
          </div>

          <div className="form-field">
            <label htmlFor="product-priceCredits">Base price (credits)</label>
            <input type="number" min={1} max={100000} step={1} inputMode="numeric" {...fieldProps('priceCredits')} />
            <FieldError errors={errors} field="priceCredits" />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="product-iconKey">Icon <span className="optional">(optional)</span></label>
          <div className="product-form__icon-row">
            <select {...fieldProps('iconKey')}>
              <option value="">Default package</option>
              {iconKeys.map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            <span className="product-form__icon-preview" aria-hidden="true">
              <PreviewIcon size={28} strokeWidth={1.5} />
            </span>
          </div>
          <FieldError errors={errors} field="iconKey" />
        </div>
      </form>
    </Modal>
  )
}
