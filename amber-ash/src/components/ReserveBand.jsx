import { Link } from 'react-router-dom'
import Button from './ui/Button'
import './reserveBand.css'

export default function ReserveBand({
  title = 'The hearth is lit tonight.',
  subtitle = 'Tables move quickly on weekends — reserve yours before service starts.',
}) {
  return (
    <section className="reserve-band">
      <div className="wrap reserve-band-inner">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <Button to="/reservations" variant="outline-dark" className="reserve-band-btn">
          Reserve a Table
        </Button>
      </div>
    </section>
  )
}
