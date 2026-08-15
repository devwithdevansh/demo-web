import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import FadeIn from '../components/ui/FadeIn'
import MenuList from '../components/MenuList'
import ReserveBand from '../components/ReserveBand'
import { FlameDivider } from '../components/FlameGlyph'
import { menuCategories } from '../data/menuData'
import './pages.css'
import './menu.css'

export default function Menu() {
  const [activeId, setActiveId] = useState(menuCategories[0].id)
  const active = menuCategories.find((c) => c.id === activeId)

  return (
    <>
      <section className="page-hero menu-hero">
        <FadeIn className="wrap" y={20}>
          <span className="eyebrow eyebrow--gold">The Full Menu</span>
          <h1>What's cooking tonight</h1>
          <p>
            Our menu shifts with the seasons and whatever the fire calls for that week — this is
            what's currently on offer. Ask your server about tonight's specials.
          </p>
        </FadeIn>
      </section>

      <section className="section section--tight menu-page">
        <div className="wrap">
          <div className="menu-tabs" role="tablist" aria-label="Menu categories">
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={cat.id === activeId}
                className={`menu-tab ${cat.id === activeId ? 'is-active' : ''}`}
                onClick={() => setActiveId(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="menu-page-card">
            <MenuList category={active} />
          </div>

          <p className="menu-footnote">
            Prices in USD. A 20% gratuity is added to parties of six or more. Please tell your
            server about any allergies before ordering.
          </p>
        </div>
      </section>

      <section className="section section--dark menu-bar-note">
        <FadeIn className="wrap" style={{ textAlign: 'center' }}>
          <FlameDivider color="var(--gold)" />
          <h2>Prefer to sit at the bar?</h2>
          <p>
            Walk-ins are always welcome at the bar — full menu, full wine list, first come, first
            served.
          </p>
          <Button to="/contact" variant="outline-dark" style={{ marginTop: 24 }}>
            Get Directions
          </Button>
        </FadeIn>
      </section>

      <ReserveBand
        title="Ready to taste the menu?"
        subtitle="Reserve a table and we'll have the hearth going when you arrive."
      />
    </>
  )
}
