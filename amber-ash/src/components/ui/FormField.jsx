export default function FormField({
  id,
  label,
  error,
  as: Component = 'input',
  children,
  ...props
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children ? (
        <Component id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props}>
          {children}
        </Component>
      ) : (
        <Component id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      )}
      {error && <span id={`${id}-error`} className="field-error">{error}</span>}
    </div>
  )
}
