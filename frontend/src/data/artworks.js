import artworksData from './artworks.json'

// Fallback statico usato da src/lib/dataClient.js quando Supabase
// non è configurato o non è raggiungibile.
export const ARTWORKS = artworksData

export function getArtworkById(id) {
  return ARTWORKS.find((a) => a.id === id)
}

export function getRelatedArtworks(artwork, limit = 6) {
  return ARTWORKS.filter((a) => a.id !== artwork.id && a.subject === artwork.subject).slice(0, limit)
}
