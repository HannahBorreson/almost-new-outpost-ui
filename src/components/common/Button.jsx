import Spinner from './Spinner'
import './Button.css'

// variant: primary | outline | ok | danger | ghost      size: md | sm
// isLoading shows a spinner and disables the button.
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    className,
  ].join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || isLoading} aria-busy={isLoading} {...rest}>
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
