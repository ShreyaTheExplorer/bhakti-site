<script setup>
const route = useRoute()
const sb = useSb()
const { favs, toggle } = useFavs()
const playing = ref(false)

const { data: song } = await useAsyncData('song-' + route.params.id, async () => {
  return (await sb.from('songs').select('*,song_translations(*)').eq('id', route.params.id).single()).data
})

const t = computed(() => {
  return song.value?.song_translations?.find(x => x.language === 'en') || song.value?.song_translations?.[0] || {}
})

const vid = computed(() => ytId(song.value?.video_url))

const hasMedia = computed(() => {
  return !!(song.value?.image_url || vid.value)
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
    <div v-if="song">
      <!-- Breadcrumb / Back Link -->
      <div class="mb-4">
        <NuxtLink
          :to="song.folder_id ? '/folder/' + song.folder_id : '/browse'"
          class="text-verbena font-medium inline-flex items-center gap-1 hover:underline text-sm sm:text-base"
        >
          ‹ Back to {{ song.folder_id ? 'folder' : 'browse' }}
        </NuxtLink>
      </div>

      <!-- Main Layout: 2 Columns when media exists on desktop; 1 Column on mobile & tablet or when no media -->
      <div
        class="gap-8 items-start"
        :class="hasMedia ? 'flex flex-col lg:grid lg:grid-cols-12' : 'max-w-3xl mx-auto'"
      >
        <!-- LEFT COLUMN: Media (Image & Video) - Sticky below navbar on lg+ -->
        <div
          v-if="hasMedia"
          class="w-full space-y-4 lg:col-span-5 lg:sticky lg:top-20"
        >
          <!-- Song Image (only rendered if present) -->
          <div v-if="song.image_url" class="overflow-hidden rounded-2xl shadow-md border border-rose/30 bg-galaxy/5">
            <img
              :src="song.image_url"
              class="w-full max-h-80 lg:max-h-96 object-cover"
              :alt="t.title || 'Song image'"
            >
          </div>

          <!-- YouTube Video with click-to-play thumbnail (only rendered if present) -->
          <div v-if="vid" class="aspect-video rounded-2xl overflow-hidden bg-galaxy shadow-md border border-rose/30">
            <iframe
              v-if="playing"
              class="w-full h-full"
              allow="autoplay; encrypted-media"
              allowfullscreen
              :src="`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1`"
            />
            <button
              v-else
              class="relative w-full h-full group cursor-pointer block text-left"
              aria-label="Play YouTube video"
              @click="playing = true"
            >
              <img
                :src="`https://img.youtube.com/vi/${vid}/hqdefault.jpg`"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                alt="Video preview"
              >
              <div class="absolute inset-0 bg-galaxy/30 group-hover:bg-galaxy/40 transition-colors grid place-items-center">
                <span class="w-16 h-16 rounded-full bg-apricot text-galaxy grid place-items-center text-2xl shadow-lg pl-1 group-hover:scale-110 transition-transform">
                  ▶
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- RIGHT COLUMN: Text Content (Title, Favourites, Gist, Lyrics, Meaning) -->
        <div
          class="w-full"
          :class="hasMedia ? 'lg:col-span-7 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)] lg:pr-3 soft-scrollbar' : ''"
        >
          <article class="card p-6 sm:p-8 space-y-6 bg-white/80 shadow-md">
            <!-- Title & Favourite Action -->
            <div class="flex justify-between items-start gap-4 border-b border-rose/25 pb-4">
              <h1 class="text-3xl sm:text-4xl font-head font-bold text-galaxy leading-tight">
                {{ t.title || 'Untitled Song' }}
              </h1>
              <button
                class="text-3xl transition-transform hover:scale-125 focus:outline-none flex-shrink-0"
                :class="favs.includes(song.id) ? 'text-garland' : 'text-galaxy/30 hover:text-garland'"
                :aria-label="favs.includes(song.id) ? 'Remove from favourites' : 'Save to favourites'"
                @click="toggle(song.id)"
              >
                {{ favs.includes(song.id) ? '♥' : '♡' }}
              </button>
            </div>

            <!-- Gist / Summary (only rendered if present) -->
            <div
              v-if="t.gist"
              class="italic text-verbena bg-verbena/5 p-4 rounded-xl border-l-4 border-verbena text-base sm:text-lg leading-relaxed"
            >
              {{ t.gist }}
            </div>

            <!-- Lyrics Section (only rendered if present) -->
            <section v-if="t.lyrics" class="space-y-3">
              <h2 class="text-2xl font-head font-bold text-galaxy border-b border-rose/20 pb-1">
                Lyrics
              </h2>
              <p class="whitespace-pre-line text-lg sm:text-xl leading-relaxed sm:leading-loose text-galaxy/95 font-serif">
                {{ t.lyrics }}
              </p>
            </section>

            <!-- Meaning Section (only rendered if present) -->
            <section v-if="t.meaning" class="space-y-3">
              <h2 class="text-2xl font-head font-bold text-galaxy border-b border-rose/20 pb-1">
                Meaning
              </h2>
              <p class="whitespace-pre-line text-base sm:text-lg leading-relaxed text-galaxy/90 bg-cream/60 p-4 sm:p-5 rounded-xl border border-rose/20">
                {{ t.meaning }}
              </p>
            </section>
          </article>
        </div>
      </div>
    </div>

    <!-- Song Not Found -->
    <div v-else class="card p-10 text-center max-w-md mx-auto space-y-4 mt-12">
      <div class="text-4xl">🪷</div>
      <h2 class="text-2xl font-head text-galaxy font-bold">Song not found</h2>
      <p class="text-galaxy/70">The song you are looking for does not exist or may have been unpublished.</p>
      <NuxtLink to="/browse" class="btn inline-block">
        Browse other songs
      </NuxtLink>
    </div>
  </div>
</template>
