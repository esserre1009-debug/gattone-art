import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Se le variabili d'ambiente non sono impostate (es. sviluppo locale
// senza Supabase), il client resta null e il data-layer usa
// automaticamente i JSON statici come fallback (vedi src/data/*.js).
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
