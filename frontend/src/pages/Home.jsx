import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroSlider from '../components/HeroSlider'
import ArtworkCard from '../components/ArtworkCard'
import Pagination from '../components/Pagination'
import InstagramFeed from '../components/InstagramFeed'
import { getArtworks } from '../lib/dataClient'
import { useFlags } from '../hooks/useFlags'

const PAGE_SIZE = 14

export default function Home() {
  const [artworks, setArtworks] = useState([])
  const [page, setPage] = useState(1)
  const flags = useFlags()

  useEffect(() => {
    getArtworks().then(setArtworks)
  }, [])

  const totalPages = Math.max(1, Math.ceil(artworks.length / PAGE_SIZE))
  const visible = artworks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function goToPage(p) {
    setPage(p)
    document.getElementById('opere-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
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

          <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/galleria" className="btn btn-outline">
              Vai al catalogo completo
            </Link>

            {flags.enableLinkForm && (
              <Link to="/link" className="btn btn-outline">
                Resta in contatto
              </Link>
            )}
          </div>
        </div>
      </section>

      <section
        className="intro-section"
        style={{ paddingTop: 0 }}
        id="opere-section"
      >
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Opere in evidenza</h2>
              <p className="subtitle">
                Pagina {page} di {totalPages}
              </p>
            </div>
          </div>

          <div className="artwork-grid masonry">
            {visible.map((a) => (
              <ArtworkCard key={a.id} artwork={a} masonry />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      </section>

      {flags.enableInstagramFeed && <InstagramFeed />}

      {flags.enableBio && (
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