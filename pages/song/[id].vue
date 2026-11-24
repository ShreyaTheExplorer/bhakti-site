<script setup>
const route = useRoute(); const sb = useSb(); const { favs, toggle } = useFavs()
const playing = ref(false)
const { data: song } = await useAsyncData('song-' + route.params.id, async () =>
  (await sb.from('songs').select('*,song_translations(*)').eq('id', route.params.id).single()).data)
const t = computed(() => song.value?.song_translations?.find(x => x.language === 'en') || song.value?.song_translations?.[0] || {})
const vid = computed(() => ytId(song.value?.video_url))
</script>
<template>
  <article v-if="song" class="card p-5">
    <div class="flex justify-between items-start gap-3">
      <h1 class="text-4xl">{{ t.title }}</h1>
      <button class="text-3xl" @click="toggle(song.id)">{{ favs.includes(song.id) ? '♥' : '♡' }}</button>
    </div>
    <img v-if="song.image_url" :src="song.image_url" class="rounded-xl my-3 w-full max-h-80 object-cover" alt="">
    <p v-if="t.gist" class="italic text-verbena">{{ t.gist }}</p>
    <div v-if="vid" class="my-4 aspect-video rounded-xl overflow-hidden bg-galaxy">
      <iframe v-if="playing" class="w-full h-full" allow="autoplay; encrypted-media" allowfullscreen
        :src="`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1`" />
      <button v-else class="relative w-full h-full" @click="playing = true">
        <img :src="`https://img.youtube.com/vi/${vid}/hqdefault.jpg`" class="w-full h-full object-cover" alt="">
        <span class="absolute inset-0 grid place-items-center text-6xl text-cream">▶</span>
      </button>
    </div>
    <h2 v-if="t.lyrics" class="text-2xl mt-4">Lyrics</h2>
    <p class="whitespace-pre-line text-lg leading-relaxed">{{ t.lyrics }}</p>
    <h2 v-if="t.meaning" class="text-2xl mt-4">Meaning</h2>
    <p class="whitespace-pre-line leading-relaxed">{{ t.meaning }}</p>
  </article>
  <p v-else>Song not found.</p>
</template>
