<script setup>
const sb = useSb()

const { data } = await useAsyncData('home-landing-data', async () => {
  const foldersQuery = sb
    .from('folders')
    .select('*')
    .is('parent_id', null)
    .order('sort_order')
    .order('name')

  const songsQuery = sb
    .from('songs')
    .select('id,image_url,status,created_at,song_translations(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6)

  const [f, s] = await Promise.all([foldersQuery, songsQuery])
  return {
    folders: f.data || [],
    songs: s.data || []
  }
})

const getTitle = (s) => {
  return s.song_translations?.find(x => x.language === 'en')?.title || s.song_translations?.[0]?.title || 'Untitled Song'
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative w-full py-16 sm:py-24 px-4 bg-cream overflow-hidden flex items-center justify-center text-center shadow-sm">
      <!-- Full-width background image with light cream overlay and graceful cream fallback -->
      <div
        class="absolute inset-0 bg-cover bg-center pointer-events-none"
        style="background-image: linear-gradient(rgba(253, 247, 238, 0.85), rgba(253, 247, 238, 0.94)), url('/bg.jpg'), linear-gradient(#FDF7EE, #FDF7EE);"
      />

      <div class="relative z-10 max-w-2xl mx-auto space-y-4">
        <div class="text-4xl sm:text-5xl animate-pulse">🪷</div>
        <h1 class="text-4xl sm:text-6xl font-head font-bold text-galaxy tracking-tight">
          Bhakti Geet
        </h1>
        <p class="text-lg sm:text-xl text-galaxy/80 max-w-lg mx-auto leading-relaxed">
          Sacred devotional lyrics, meanings, and melodies to awaken the divine within.
        </p>

        <div class="pt-4 flex flex-wrap items-center justify-center gap-4">
          <NuxtLink
            to="/browse"
            class="btn text-base px-6 py-2.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
          >
            <span>Browse songs</span>
            <span>→</span>
          </NuxtLink>
          <NuxtLink
            to="/favourites"
            class="card text-base font-semibold text-garland px-6 py-2.5 shadow hover:shadow-md transition-all inline-flex items-center gap-2 bg-cream/90"
          >
            <span>♥</span>
            <span>My favourites</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Main Content Sections -->
    <div class="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <!-- Top-Level Folders Section -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-3xl text-galaxy font-head flex items-center gap-2">
            <span>🪔</span>
            <span>Folders</span>
          </h2>
          <NuxtLink to="/browse" class="text-verbena font-semibold text-sm hover:underline">
            All folders →
          </NuxtLink>
        </div>

        <div v-if="data?.folders?.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <NuxtLink
            v-for="f in data.folders"
            :key="f.id"
            :to="'/folder/' + f.id"
            class="card p-5 text-center hover:shadow-md hover:border-garland/50 transition-all transform hover:-translate-y-0.5 group"
          >
            <div class="text-3xl group-hover:scale-110 transition-transform">🪔</div>
            <div class="font-head text-xl mt-2 text-galaxy font-semibold">{{ f.name }}</div>
          </NuxtLink>
        </div>
        <p v-else class="card p-6 text-center text-galaxy/70 italic">
          No folders created yet. Visit the admin area to add devotional categories.
        </p>
      </section>

      <!-- Latest Songs Section -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-3xl text-galaxy font-head flex items-center gap-2">
            <span>🎶</span>
            <span>Latest songs</span>
          </h2>
          <NuxtLink to="/browse" class="text-verbena font-semibold text-sm hover:underline">
            View all →
          </NuxtLink>
        </div>

        <div v-if="data?.songs?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="s in data.songs"
            :key="s.id"
            :to="'/song/' + s.id"
            class="card p-3 flex items-center gap-3 hover:shadow-md hover:border-garland/50 transition-all transform hover:-translate-y-0.5 group"
          >
            <img
              v-if="s.image_url"
              :src="s.image_url"
              class="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-rose/30"
              alt=""
            >
            <div
              v-else
              class="w-14 h-14 rounded-lg bg-galaxy/10 flex items-center justify-center text-xl flex-shrink-0 text-verbena"
            >
              🎵
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-galaxy text-base group-hover:text-garland transition-colors truncate">
                {{ getTitle(s) }}
              </h3>
              <p class="text-xs text-galaxy/60 mt-0.5">
                Tap to view lyrics & meaning
              </p>
            </div>
          </NuxtLink>
        </div>
        <p v-else class="card p-6 text-center text-galaxy/70 italic">
          No songs published yet. Check back soon for beautiful devotional melodies!
        </p>
      </section>
    </div>
  </div>
</template>
