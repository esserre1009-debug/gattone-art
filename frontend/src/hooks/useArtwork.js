import { useEffect, useState } from 'react'
import { getArtworkById, getRelatedArtworks } from '../lib/dataClient'

export function useArtwork(id) {
  const [artwork, setArtwork] = useState(undefined) // undefined = loading, null = not found
  const [related, setRelated] = useState([])

  useEffect(() => {
    let active = true
    setArtwork(undefined)
    setRelated([])

    getArtworkById(id).then(async (found) => {
      if (!active) return
      setArtwork(found)
      if (found) {
        const relatedList = await getRelatedArtworks(found)
        if (active) setRelated(relatedList)
      }
    })

    return () => { active = false }
  }, [id])

  return { artwork, related }
}
