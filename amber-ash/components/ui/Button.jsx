import { Link } from 'react-router-dom'
import { useMagneticHover } from '../../hooks/useMagneticHover'

export default function Button({ 
  to, 
  href, 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}) {
  const magneticRef = useMagneticHover()
  const baseClass = variant === 'ghost' ? 'btn-ghost' : `btn btn-${variant}`
  const classes = `${baseClass} ${className} btn--magnetic`.trim()

  if (to) {
    return (
      <Link ref={magneticRef} to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a ref={magneticRef} href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button ref={magneticRef} className={classes} {...props}>
      {children}
    </button>
  )
}
