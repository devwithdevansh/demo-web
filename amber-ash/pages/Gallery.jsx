import { useEffect, useState } from 'react'
import ReserveBand from '../components/ReserveBand'
import { galleryImages } from '../data/siteData'
import './pages.css'
import './gallery.css'

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setActiveIndex(null)
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i === null ? i : (i + 1) % galleryImages.length))
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i === null ? i : (i - 1 + galleryImages.length) % galleryImages.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.body.style.overflow = activeIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeIndex])

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow eyebrow--gold">Gallery</span>
          <h1>A look inside the room</h1>
          <p>The hearth, the bar, and a few of the plates that come off the fire each night.</p>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap">
          <div className="masonry">
            {galleryImages.map((img, i) => (
              <button
                key={img.src + img.alt}
                className={`masonry-item span-${img.span}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`Open image: ${img.alt}`}
              >
                <img src={img.src} alt={img.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <ReserveBand
        title="Seen enough? Come taste it."
        subtitle="The room looks even better with the hearth lit and a glass poured."
      />

      {activeIndex !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setActiveIndex(null)}>
          <button className="lightbox-close" aria-label="Close" onClick={() => setActiveIndex(null)}>
            ✕
          </button>
          <button
            className="lightbox-nav prev"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + galleryImages.length) % galleryImages.length) }}
          >
            ‹
          </button>
          <img
            src={galleryImages[activeIndex].src}
            alt={galleryImages[activeIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-nav next"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % galleryImages.length) }}
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
