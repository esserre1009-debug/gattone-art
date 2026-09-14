import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useArtwork } from '../hooks/useArtwork'
import { AvailabilityBadge } from '../components/Badge'
import ArtworkCard from '../components/ArtworkCard'

function aspectClass(orientation) {
  if (orientation === 'horizontal') return 'aspect-horizontal'
  if (orientation === 'vertical') return 'aspect-vertical'
  return 'aspect-square'
}

export default function ArtworkDetail() {
  const { id } = useParams()
  const { artwork, related } = useArtwork(id)
  const [activeImage, setActiveImage] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  if (artwork === undefined) {
    return (
      <section className="detail-section">
        <div className="container">
          <div className="loader-row">Caricamento opera...</div>
        </div>
      </section>
    )
  }

  if (!artwork) return <Navigate to="/galleria" replace />

  return (
    <section className="detail-section">
      <div className="container">
        <Link to="/galleria" className="back-link">&larr; Torna alla galleria</Link>

        <div className="detail-grid">
          <div className="detail-gallery">
            <div
              className={`main-image ${aspectClass(artwork.orientation)} ${zoomed ? 'zoomed' : ''}`}
              onClick={() => setZoomed(!zoomed)}
            >
              <img src={artwork.images[activeImage]} alt={artwork.title} />
            </div>
            {artwork.images.length > 1 && (
              <div className="thumb-row">
                {artwork.images.map((img, i) => (
                  <div
                    key={i}
                    className={`thumb ${i === activeImage ? 'active' : ''}`}
                    onClick={() => { setActiveImage(i); setZoomed(false) }}
                  >
                    <img src={img} alt={`${artwork.title} vista ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detail-info">
            <span className="eyebrow">{artwork.subject}</span>
            <h1>{artwork.title}</h1>
            <div className="badges">
              <AvailabilityBadge availability={artwork.availability} />
            </div>
            <div className="price-display">{artwork.priceDisplay}</div>

            <div className="specs">
              <div className="spec-item">
                <div className="label">Dimensioni</div>
                <div className="value">{artwork.dimensions}</div>
              </div>
              <div className="spec-item">
                <div className="label">Soggetto</div>
                <div className="value">{artwork.subject}</div>
              </div>
              <div className="spec-item">
                <div className="label">Disponibilita</div>
                <div className="value">{artwork.availability}</div>
              </div>
            </div>

            <p className="description">{artwork.description}</p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-section">
            <div className="section-heading">
              <div>
                <h2>Opere correlate</h2>
                <p className="subtitle">Altre opere della stessa categoria</p>
              </div>
            </div>
            <div className="artwork-grid masonry">
              {related.map((a) => <ArtworkCard key={a.id} artwork={a} masonry />)}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
