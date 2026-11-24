export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/main.css'],
  // values come from .env: NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || ''
    }
  },
  routeRules: { '/admin/**': { ssr: false } },
  app: { head: { title: 'Bhakti Geet', meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }] } }
})
