<script setup>
const sb = useSb(); const { favs } = useFavs(); const songs = ref([])
watch(favs, async (ids) => {
  songs.value = ids.length ? (await sb.from('songs').select('id,song_translations(title)').in('id', ids)).data || [] : []
}, { immediate: true })
</script>
<template>
  <h1 class="text-4xl my-3">♥ Favourites</h1>
  <NuxtLink v-for="s in songs" :key="s.id" :to="'/song/' + s.id" class="card block p-3 mb-2">{{ s.song_translations?.[0]?.title }}</NuxtLink>
  <p v-if="!songs.length" class="opacity-70">Tap the heart on a song to save it here.</p>
</template>
