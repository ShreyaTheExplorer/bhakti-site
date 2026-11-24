<script setup>
const props = defineProps({ id: String })
const sb = useSb()
const { data } = await useAsyncData('fv-' + (props.id || 'root'), async () => {
  let fq = sb.from('folders').select('*').order('sort_order').order('name')
  let sq = sb.from('songs').select('id,song_translations(title)').eq('status', 'published').order('sort_order')
  fq = props.id ? fq.eq('parent_id', props.id) : fq.is('parent_id', null)
  sq = props.id ? sq.eq('folder_id', props.id) : sq.is('folder_id', null)
  const cur = props.id ? await sb.from('folders').select('name,parent_id').eq('id', props.id).single() : { data: null }
  const [f, s] = await Promise.all([fq, sq])
  return { folders: f.data || [], songs: s.data || [], cur: cur.data }
})
</script>
<template>
  <div>
    <NuxtLink v-if="data.cur" :to="data.cur.parent_id ? '/folder/' + data.cur.parent_id : '/'" class="text-verbena">‹ Back</NuxtLink>
    <h1 class="text-4xl my-3">{{ data.cur?.name || 'Sacred Songs' }}</h1>
    <div class="grid grid-cols-2 gap-3">
      <NuxtLink v-for="f in data.folders" :key="f.id" :to="'/folder/' + f.id" class="card p-5 text-center">
        <div class="text-3xl">🪔</div><div class="font-head text-xl">{{ f.name }}</div>
      </NuxtLink>
    </div>
    <div class="mt-4 space-y-2">
      <NuxtLink v-for="s in data.songs" :key="s.id" :to="'/song/' + s.id" class="card block p-3">
        {{ s.song_translations?.[0]?.title }}
      </NuxtLink>
    </div>
    <p v-if="!data.folders.length && !data.songs.length" class="mt-6 opacity-70">Nothing here yet.</p>
  </div>
</template>
