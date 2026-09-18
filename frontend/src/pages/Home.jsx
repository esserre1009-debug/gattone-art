import { useState } from 'react'
import HeroSlider from '../components/HeroSlider'
import ArtworkCard from '../components/ArtworkCard'
import Pagination from '../components/Pagination'
import { ARTWORKS } from '../data/artworks'
import { FEATURE_FLAGS } from '../config/flags'
import { Link } from 'react-router-dom'

const PAGE_SIZE = 14

export default function Home() {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(ARTWORKS.length / PAGE_SIZE))
  const visible = ARTWORKS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function goToPage(p) {
    setPage(p)
    document.getElementById('opere-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <HeroSlider />

      <section className="intro-section">
        <div className="container">
          <p className="lead">
            Un catalogo dedicato a opere di collage e assemblaggio: cinema
            vintage, pop art e supereroi, pin-up e cultura visiva del
            Novecento, reinterpretati attraverso composizioni originali,
            colorate e uniche.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link to="/galleria" className="btn btn-outline">Vai al catalogo completo</Link>
          </div>
        </div>
      </section>

      <section className="intro-section" style={{ paddingTop: 0 }} id="opere-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Opere in evidenza</h2>
              <p className="subtitle">Pagina {page} di {totalPages}</p>
            </div>
          </div>
          <div className="artwork-grid masonry">
            {visible.map((a) => <ArtworkCard key={a.id} artwork={a} masonry />)}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </section>

      {FEATURE_FLAGS.enableBio && (
        <section className="intro-section">
          <div className="container">
            <h2>Biografia</h2>
            <p>Sezione biografia artista - da attivare dal backend.</p>
          </div>
        </section>
      )}
    </>
  )
}
