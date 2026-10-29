import './GlassPanel.css'

// A frosted-glass box. `as` picks the HTML element (div, section, aside...).
export default function GlassPanel({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`glass-panel ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
