import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import FadeIn from '../components/ui/FadeIn'
import { TextReveal } from '../components/ui/TextReveal'
import { Parallax } from '../components/ui/Parallax'
import { StaggerContainer, StaggerItem } from '../components/ui/Stagger'
import FlameGlyph, { FlameDivider } from '../components/FlameGlyph'
import MenuList from '../components/MenuList'
import ReserveBand from '../components/ReserveBand'
import EmberCanvas from '../components/EmberCanvas'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion'
import { menuCategories, signatureDishes } from '../data/menuData'
import { galleryImages, testimonials } from '../data/siteData'
import './home.css'

export default function Home() {
  const menuPreview = menuCategories.find((c) => c.id === 'wood-fired')
  const reducedMotion = usePrefersReducedMotion()

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <Parallax className="hero-glow" offset={100} style={{ position: 'absolute', inset: 0 }} aria-hidden="true" />
        <Parallax className="hero-embers" offset={-80} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          {reducedMotion ? (
            Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className={`ember-particle ep-${i}`} />
            ))
          ) : (
            <EmberCanvas />
          )}
        </Parallax>
        <FadeIn className="wrap hero-inner" y={40} duration={1}>
          <span className="eyebrow eyebrow--gold">
            <FlameGlyph size={13} color="var(--gold)" /> Wood-Fire Kitchen &amp; Bar · Est. 2018
          </span>
          <h1 className="hero-title">
            <TextReveal text="Cooked over" />
            <br />
            <TextReveal text="open flame." delay={0.3} />
          </h1>
          <p className="hero-sub">
            A hearth-lit dining room in the heart of the city. Live-fire plates, natural wine,
            and a table that's always warm.
          </p>
          <div className="hero-actions">
            <Button to="/reservations">Reserve a Table</Button>
            <Button to="/menu" variant="outline-dark">View Menu →</Button>
          </div>
        </FadeIn>
        <div className="hero-scroll" aria-hidden="true">
          <span className="eyebrow eyebrow--soft">Scroll</span>
          <span className="hero-scroll-line" />
        </div>
      </section>

      {/* ---------- STORY ---------- */}
      <section className="section story">
        <FadeIn className="wrap story-grid" delay={0.1}>
          <div className="story-copy">
            <span className="eyebrow eyebrow--inkSoft">Our Story</span>
            <h2>Everything touches the fire before it touches the plate.</h2>
            <p>
              Amber &amp; Ash opened in 2018 with one idea: cook the way people have for
              thousands of years, and let the ingredients speak for themselves. Our hearth burns
              oak and applewood every service, and it's the first and last thing every dish sees
              before it reaches your table.
            </p>
            <p>
              From the bread to the dessert, if it can go over flame, it does. The result is a
              menu that changes with the seasons but never loses its smoke.
            </p>
            <Button to="/about" variant="ghost">Read our full story →</Button>
          </div>
          <div className="story-media" style={{ overflow: 'hidden' }}>
            <Parallax offset={40} style={{ height: '115%', marginTop: '-7.5%' }}>
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop"
                alt="Chef tending the open hearth at Amber & Ash"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Parallax>
            <div className="story-media-tag">
              <span className="eyebrow--gold eyebrow">Since 2018</span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ---------- SIGNATURE DISHES ---------- */}
      <section className="section section--dark signature">
        <div className="wrap">
          <FadeIn className="section-head">
            <FlameDivider color="var(--ember)" />
            <h2>Signature Dishes</h2>
            <p>The three plates every table at Amber &amp; Ash ends up ordering.</p>
          </FadeIn>
          <StaggerContainer className="signature-grid">
            {signatureDishes.map((dish) => (
              <StaggerItem as="article" className="dish-card" key={dish.name}>
                <div className="dish-media" style={{ overflow: 'hidden' }}>
                  <Parallax offset={20}>
                    <img src={dish.img} alt={dish.name} loading="lazy" style={{ width: '100%', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                  </Parallax>
                </div>
                <div className="dish-info">
                  <span className="eyebrow eyebrow--gold">{dish.tag}</span>
                  <div className="dish-name-row">
                    <h3>{dish.name}</h3>
                    <span className="dish-price">${dish.price}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ---------- MENU PREVIEW ---------- */}
      <section className="section menu-preview">
        <div className="wrap menu-preview-grid">
          <div className="menu-preview-intro">
            <span className="eyebrow eyebrow--inkSoft">From the Menu</span>
            <h2>
              Straight off
              <br />
              the hearth.
            </h2>
            <p>
              A preview of what's cooking this week. The full menu changes seasonally — see
              everything currently on offer, from starters to the bar list.
            </p>
            <Button to="/menu" variant="outline-light">See Full Menu</Button>
          </div>
          <div className="menu-preview-card">
            <MenuList category={menuPreview} />
          </div>
        </div>
      </section>

      {/* ---------- GALLERY STRIP ---------- */}
      <section className="section section--tight gallery-strip">
        <div className="wrap">
          <FadeIn className="section-head">
            <span className="eyebrow eyebrow--inkSoft">Inside the Room</span>
            <h2>A look around</h2>
          </FadeIn>
        </div>
        <StaggerContainer className="gallery-strip-row">
          {galleryImages.slice(0, 5).map((img) => (
            <StaggerItem className="gallery-strip-item" key={img.src + img.alt}>
              <img src={img.src} alt={img.alt} loading="lazy" />
            </StaggerItem>
          ))}
        </StaggerContainer>
        <div className="wrap gallery-strip-more">
          <Button to="/gallery" variant="ghost">View full gallery →</Button>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="section section--ash testimonials">
        <div className="wrap">
          <FadeIn className="section-head">
            <FlameDivider color="var(--gold)" />
            <h2>What guests are saying</h2>
          </FadeIn>
          <StaggerContainer className="testimonial-grid">
            {testimonials.map((t) => (
              <StaggerItem as="figure" className="testimonial-card" key={t.name}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <span className="t-name">{t.name}</span>
                  <span className="t-role">{t.role}</span>
                </figcaption>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <ReserveBand />
    </>
  )
}
