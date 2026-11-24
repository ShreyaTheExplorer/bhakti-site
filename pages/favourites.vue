<script setup>
const sb = useSb()
const { favs } = useFavs()
const songs = ref([])

watch(favs, async (ids) => {
  songs.value = ids.length ? (await sb.from('songs').select('id,song_translations(title)').in('id', ids)).data || [] : []
}, { immediate: true })
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 sm:p-6">
    <h1 class="text-4xl my-3 text-galaxy font-head">♥ Favourites</h1>
    <div v-if="songs.length" class="space-y-2">
      <NuxtLink
        v-for="s in songs"
        :key="s.id"
        :to="'/song/' + s.id"
        class="card block p-3.5 hover:shadow-md transition-shadow font-medium"
      >
        {{ s.song_translations?.[0]?.title }}
      </NuxtLink>
    </div>
    <p v-else class="card p-6 text-center text-galaxy/70 italic mt-4">
      Tap the heart on a song to save it here.
    </p>
  </div>
</template>
