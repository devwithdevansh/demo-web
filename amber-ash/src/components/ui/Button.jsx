import { Link } from 'react-router-dom'

export default function Button({ 
  to, 
  href, 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}) {
  const baseClass = variant === 'ghost' ? 'btn-ghost' : `btn btn-${variant}`
  const classes = `${baseClass} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
