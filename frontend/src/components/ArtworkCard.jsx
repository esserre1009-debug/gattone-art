import { Link } from 'react-router-dom'
import { AvailabilityBadge, PriceBadge } from './Badge'

function aspectClass(orientation) {
  if (orientation === 'horizontal') return 'aspect-horizontal'
  if (orientation === 'vertical') return 'aspect-vertical'
  return 'aspect-square'
}

export default function ArtworkCard({ artwork, masonry = false }) {
  const wrapClass = masonry ? 'image-wrap' : `image-wrap ${aspectClass(artwork.orientation)}`

  return (
    <Link to={`/opera/${artwork.id}`} className="artwork-card">
      <div className={wrapClass}>
        <img src={artwork.cover} alt={artwork.title} loading="lazy" />
        <div className="card-overlay">
          <h3>{artwork.title}</h3>
          <div className="meta">{artwork.subject}</div>
          <div className="meta">{artwork.dimensions}</div>
          <div className="badges">
            <AvailabilityBadge availability={artwork.availability} />
            <PriceBadge priceDisplay={artwork.priceDisplay} />
          </div>
          <span className="view-link">Vedi dettagli &rarr;</span>
        </div>
      </div>
    </Link>
  )
}
