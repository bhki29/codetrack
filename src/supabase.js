import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) throw new Error('File .env belum diisi. Salin .env.example menjadi .env lalu isi URL dan anon key Supabase.')
export const supabase = createClient(url, key)
