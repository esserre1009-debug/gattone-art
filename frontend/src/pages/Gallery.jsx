import { useEffect, useMemo, useRef, useState } from 'react'
import ArtworkCard from '../components/ArtworkCard'
import FilterBar from '../components/FilterBar'
import { useArtworks } from '../hooks/useArtworks'
import { useCategories } from '../hooks/useCategories'

const PAGE_SIZE = 12

export default function Gallery() {
  const { artworks, loading } = useArtworks()
  const { filterGroups } = useCategories()
  const [active, setActive] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loaderRef = useRef(null)

  const filtered = useMemo(() => {
    if (!active) return artworks
    return artworks.filter((a) => String(a[active.type]) === String(active.value))
  }, [active, artworks])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [active])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length))
      }
    }, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [filtered.length])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <section className="detail-section" style={{ paddingTop: 48 }}>
      <div className="container">
        <div className="section-heading">
          <div>
            <h2>Galleria</h2>
            <p className="subtitle">{filtered.length} opere{active ? ` - ${active.value}` : ''}</p>
          </div>
        </div>

        <FilterBar
          groups={filterGroups}
          active={active}
          onSelect={(type, value) => setActive({ type, value })}
          onReset={() => setActive(null)}
        />

        {loading ? (
          <div className="loader-row">Caricamento opere...</div>
        ) : (
          <>
            <div className="artwork-grid masonry">
              {visible.map((a) => <ArtworkCard key={a.id} artwork={a} masonry />)}
            </div>

            <div ref={loaderRef} className="loader-row">
              {hasMore ? 'Caricamento altre opere...' : visible.length > 0 ? 'Hai visto tutte le opere' : 'Nessuna opera trovata'}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
