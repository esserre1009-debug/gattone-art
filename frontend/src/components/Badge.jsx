export function AvailabilityBadge({ availability }) {
  const cls = availability === 'Disponibile' ? 'badge-disponibile'
    : availability === 'Riservato' ? 'badge-riservato'
    : 'badge-venduto'
  return <span className={`badge ${cls}`}>{availability}</span>
}

export function PriceBadge({ priceDisplay }) {
  return <span className="badge badge-price">{priceDisplay}</span>
}
