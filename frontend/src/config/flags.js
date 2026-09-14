import flagsData from '../data/flags.json'

// Mantenuto per retrocompatibilità: preferire useFlags() nei componenti,
// che legge da Supabase con fallback automatico a questo stesso file.
export const FEATURE_FLAGS = { ...flagsData }
