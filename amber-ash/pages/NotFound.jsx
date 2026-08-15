import { Link } from 'react-router-dom'
import { FlameDivider } from '../components/FlameGlyph'
import Button from '../components/ui/Button'
import './notfound.css'

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="wrap notfound-inner">
        <span className="eyebrow eyebrow--gold">404</span>
        <h1>This table isn't set.</h1>
        <FlameDivider color="var(--gold)" />
        <p>The page you're looking for burned down or never existed. Let's get you back.</p>
        <Button to="/">Back to Home</Button>
      </div>
    </section>
  )
}
