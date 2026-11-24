import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export const useSb = (): SupabaseClient => {
  if (!client) {
    const config = useRuntimeConfig()
    const p = config.public
    const url = (p.supabaseUrl || (typeof process !== 'undefined' ? process.env?.NUXT_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL : '') || '') as string
    const key = (p.supabaseKey || (typeof process !== 'undefined' ? process.env?.NUXT_PUBLIC_SUPABASE_KEY || process.env?.SUPABASE_KEY : '') || '') as string

    if (!url || !key) {
      throw new Error('Supabase URL and Key are required. Please set NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_KEY in your .env file.')
    }

    const isClient = typeof window !== 'undefined'
    client = createClient(url, key, {
      auth: {
        persistSession: isClient,
        autoRefreshToken: isClient,
        detectSessionInUrl: isClient
      }
    })
  }
  return client
}

export const ytId = (url?: string) => url?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1] || ''

export const useFavs = () => {
  const favs = useState<string[]>('favs', () => [])
  onMounted(() => {
    try {
      favs.value = JSON.parse(localStorage.getItem('favs') || '[]')
    } catch { }
  })
  const toggle = (id: string) => {
    favs.value = favs.value.includes(id) ? favs.value.filter(x => x !== id) : [...favs.value, id]
    try {
      localStorage.setItem('favs', JSON.stringify(favs.value))
    } catch { }
  }
  return { favs, toggle }
}
