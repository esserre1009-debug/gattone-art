import ArtworkCard from './ArtworkCard'

export default function FeaturedGrid({ artworks }) {
  return (
    <section className="intro-section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="section-heading">
          <div>
            <h2>Opere in evidenza</h2>
            <p className="subtitle">Il catalogo completo delle opere disponibili.</p>
          </div>
        </div>
        <div className="artwork-grid masonry">
          {artworks.map((a) => <ArtworkCard key={a.id} artwork={a} masonry />)}
        </div>
      </div>
    </section>
  )
}
