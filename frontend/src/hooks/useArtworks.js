import { useEffect, useState } from 'react'
import { getArtworks } from '../lib/dataClient'

export function useArtworks() {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getArtworks().then((data) => {
      if (active) {
        setArtworks(data)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  return { artworks, loading }
}
