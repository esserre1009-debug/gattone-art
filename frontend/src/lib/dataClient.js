import { supabase, isSupabaseConfigured } from './supabaseClient'
import fallbackArtworks from '../data/artworks.json'
import fallbackCategories from '../data/categories.json'
import fallbackFlags from '../data/flags.json'
import fallbackHero from '../data/hero.json'
import fallbackInstagram from '../data/instagram.json'

// -----------------------------------------------------------------------
// Data layer unico per tutto il frontend.
// Se Supabase è configurato (variabili VITE_SUPABASE_URL / ANON_KEY),
// legge dal database. Altrimenti (o in caso di errore di rete) usa
// i JSON statici già presenti nel repository come fallback,
// così il sito funziona sempre anche senza backend collegato.
// -----------------------------------------------------------------------

function mapArtworkRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    subject: row.subject,
    availability: row.availability,
    sizeCategory: row.size_category,
    orientation: row.orientation,
    dimensions: row.dimensions,
    price: row.price,
    priceDisplay: row.price_display,
    description: row.description,
    images: row.images || [],
    cover: row.cover || (row.images && row.images[0]) || '',
  }
}

export async function getArtworks() {
  if (!isSupabaseConfigured) return fallbackArtworks

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) return fallbackArtworks
    return data.map(mapArtworkRow)
  } catch (err) {
    console.warn('Supabase non disponibile, uso i dati statici di fallback.', err)
    return fallbackArtworks
  }
}

export async function getArtworkById(id) {
  if (!isSupabaseConfigured) {
    return fallbackArtworks.find((a) => String(a.id) === String(id)) || null
  }

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', String(id))
      .maybeSingle()

    if (error) throw error
    if (!data) return null
    return mapArtworkRow(data)
  } catch (err) {
    console.warn('Supabase non disponibile, uso i dati statici di fallback.', err)
    return fallbackArtworks.find((a) => String(a.id) === String(id)) || null
  }
}

export async function getRelatedArtworks(artwork, limit = 6) {
  const all = await getArtworks()
  return all.filter((a) => a.id !== artwork.id && a.subject === artwork.subject).slice(0, limit)
}

async function getSetting(key, fallbackValue) {
  if (!isSupabaseConfigured) return fallbackValue

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    if (error) throw error
    if (!data) return fallbackValue
    return data.value
  } catch (err) {
    console.warn(`Supabase non disponibile per "${key}", uso il fallback statico.`, err)
    return fallbackValue
  }
}

export async function getCategories() {
  return getSetting('categories', fallbackCategories)
}

export async function getFlags() {
  return getSetting('flags', fallbackFlags)
}

export async function getHero() {
  return getSetting('hero', fallbackHero)
}

export async function getInstagram() {
  return getSetting('instagram', fallbackInstagram)
}
