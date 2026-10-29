import './Spinner.css'

// size: sm | md | lg. fullPage centers it on the screen with a label.
export default function Spinner({ size = 'md', label, fullPage = false }) {
  const spinner = <span className={`spinner spinner--${size}`} aria-hidden="true" />

  if (fullPage) {
    return (
      <div className="spinner-page" role="status">
        {spinner}
        <p>{label || 'Loading...'}</p>
      </div>
    )
  }

  if (label) {
    return (
      <span className="spinner-inline" role="status">
        {spinner}
        <span>{label}</span>
      </span>
    )
  }

  return spinner
}
