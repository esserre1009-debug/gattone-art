import HeroSlider from '../components/HeroSlider'
import FeaturedGrid from '../components/FeaturedGrid'
import InstagramFeed from '../components/InstagramFeed'
import { useArtworks } from '../hooks/useArtworks'
import { useFlags } from '../hooks/useFlags'
import { Link } from 'react-router-dom'

const MAX_FEATURED = 12

export default function Home() {
  const { artworks, loading } = useArtworks()
  const flags = useFlags()
  const featured = artworks.slice(0, MAX_FEATURED)

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

      {loading ? (
        <div className="loader-row">Caricamento opere...</div>
      ) : (
        <FeaturedGrid artworks={featured} />
      )}

      {flags.enableBio && (
        <section className="intro-section">
          <div className="container">
            <h2>Biografia</h2>
            <p>Sezione biografia artista - da attivare dal backend.</p>
          </div>
        </section>
      )}

      {flags.enableInstagramFeed && <InstagramFeed />}
    </>
  )
}
