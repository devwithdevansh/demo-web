import { FlameDivider } from '../components/FlameGlyph'
import ReserveBand from '../components/ReserveBand'
import { teamMembers } from '../data/siteData'
import './pages.css'
import './about.css'

const values = [
  {
    title: 'Fire First',
    desc: 'Every dish meets the hearth before it meets the plate — no shortcuts, no exceptions.',
  },
  {
    title: 'Seasonal by Default',
    desc: 'The menu follows the market. If it isn\u2019t in season, it isn\u2019t on the menu.',
  },
  {
    title: 'Small Producers',
    desc: 'We buy from farmers and winemakers we know by name, not by catalog.',
  },
  {
    title: 'A Loud, Warm Room',
    desc: 'This is a place for long dinners and second bottles, not quiet fine dining.',
  },
]

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow eyebrow--gold">Our Story</span>
          <h1>Built around a single fire.</h1>
          <p>
            Amber &amp; Ash started as a single wood-fired oven and a folding table. Eight years
            later, the fire is bigger, but the idea hasn't changed.
          </p>
        </div>
      </section>

      <section className="section about-story">
        <div className="wrap about-story-grid">
          <div className="about-story-media">
            <img
              src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900&q=80&auto=format&fit=crop"
              alt="The kitchen team plating a dish"
              loading="lazy"
            />
          </div>
          <div className="about-story-copy">
            <h2>From a folding table to a full hearth.</h2>
            <p>
              Chef Rohan Vaid spent years cooking over open fire across three countries before
              deciding a city needed a restaurant built the same way. Amber &amp; Ash opened its
              doors in 2018 with a single wood oven, twelve seats, and a menu that changed
              whenever the market did.
            </p>
            <p>
              Today the hearth runs the length of the open kitchen, but the rule hasn't moved:
              if it can go over flame, it does. Bread, vegetables, meat, even dessert — the fire
              touches almost everything that leaves the kitchen.
            </p>
            <p>
              We work with a small group of local farmers, foragers, and a natural wine importer
              who shares our taste for things that aren't overly polished. The result is a menu
              that's a little different every week, and a room that feels the same every time you
              walk in.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--ash about-values">
        <div className="wrap">
          <div className="section-head">
            <FlameDivider color="var(--gold)" />
            <h2>What we won't compromise on</h2>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={v.title}>
                <span className="value-index">{String(i + 1).padStart(2, '0')}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-team">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow eyebrow--inkSoft">The People</span>
            <h2>Who's behind the hearth</h2>
          </div>
          <div className="team-grid">
            {teamMembers.map((member) => (
              <article className="team-card" key={member.name}>
                <div className="team-media">
                  <img src={member.img} alt={member.name} loading="lazy" />
                </div>
                <h3>{member.name}</h3>
                <span className="team-role">{member.role}</span>
                <p>{member.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ReserveBand />
    </>
  )
}
