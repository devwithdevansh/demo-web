// The signature glyph — echoes the live-fire concept wherever a
// divider, bullet, or small mark is needed across the site.
export default function FlameGlyph({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5c.8 3-1 4.3-2.3 5.9-1.7 2.1-2.2 3.9-1.8 5.8.3 1.5 1.3 2.6 2.7 3.1-.8-1.4-.8-2.7-.1-4 .4-.8 1.1-1.5 1.5-2.3.4.9.3 1.7.8 2.3.7.9 1.6 1.3 1.8 2.6.2 1.1-.2 2.1-1 2.9 1.7-.4 3.1-1.7 3.5-3.6.5-2.3-.4-4-1.8-5.7C14 6.8 11.6 5.4 12 2.5z"
        fill={color}
      />
    </svg>
  )
}

export function FlameDivider({ className = '', color }) {
  return (
    <div className="flame-divider" style={color ? { color } : undefined}>
      <span className="line" />
      <FlameGlyph />
      <span className="line right" />
    </div>
  )
}
