<script setup>
const sb = useSb()
const folders = ref([]), songs = ref([]), fname = ref(''), fparent = ref('')
const empty = () => ({ id: null, folder_id: '', title: '', lyrics: '', meaning: '', gist: '', image_url: '', video_url: '', status: 'published' })
const form = reactive(empty())
const label = (f) => { let n = f.name, p = folders.value.find(x => x.id === f.parent_id)
  while (p) { n = p.name + ' › ' + n; p = folders.value.find(x => x.id === p.parent_id) } return n }
async function load() {
  folders.value = (await sb.from('folders').select('*').order('name')).data || []
  songs.value = (await sb.from('songs').select('*,song_translations(*)').order('created_at', { ascending: false })).data || []
}
onMounted(async () => { (await sb.auth.getSession()).data.session ? load() : navigateTo('/admin/login') })
async function addFolder() { if (!fname.value) return
  await sb.from('folders').insert({ name: fname.value, parent_id: fparent.value || null }); fname.value = ''; load() }
async function delFolder(id) { if (confirm('Delete this folder and its subfolders?')) { await sb.from('folders').delete().eq('id', id); load() } }
async function upload(e) { const file = e.target.files[0]; if (!file) return
  const path = Date.now() + '-' + file.name.replace(/\s+/g, '_')
  const { error } = await sb.storage.from('images').upload(path, file)
  if (error) return alert(error.message)
  form.image_url = sb.storage.from('images').getPublicUrl(path).data.publicUrl }
async function save() {
  if (!form.title) return alert('Song name is required')
  const row = { folder_id: form.folder_id || null, image_url: form.image_url || null, video_url: form.video_url || null, status: form.status }
  let id = form.id
  if (id) await sb.from('songs').update(row).eq('id', id)
  else id = (await sb.from('songs').insert(row).select().single()).data.id
  await sb.from('song_translations').upsert({ song_id: id, language: 'en', title: form.title, lyrics: form.lyrics, meaning: form.meaning, gist: form.gist })
  Object.assign(form, empty()); load()
}
function edit(s) { const t = s.song_translations.find(x => x.language === 'en') || {}
  Object.assign(form, { id: s.id, folder_id: s.folder_id || '', title: t.title || '', lyrics: t.lyrics || '', meaning: t.meaning || '',
    gist: t.gist || '', image_url: s.image_url || '', video_url: s.video_url || '', status: s.status }); scrollTo(0, 0) }
async function del(id) { if (confirm('Delete this song?')) { await sb.from('songs').delete().eq('id', id); load() } }
async function logout() { await sb.auth.signOut(); navigateTo('/admin/login') }
</script>
<template>
  <div class="space-y-6">
    <div class="flex justify-between"><h1 class="text-4xl">Admin</h1><button class="btn" @click="logout">Sign out</button></div>

    <section class="card p-4 space-y-2">
      <h2 class="text-2xl">Folders</h2>
      <div class="flex gap-2 flex-wrap">
        <input v-model="fname" class="inp flex-1" placeholder="New folder name">
        <select v-model="fparent" class="inp w-auto"><option value="">Top level</option>
          <option v-for="f in folders" :key="f.id" :value="f.id">{{ label(f) }}</option></select>
        <button class="btn" @click="addFolder">Add folder</button>
      </div>
      <div v-for="f in folders" :key="f.id" class="flex justify-between text-sm">
        <span>{{ label(f) }}</span><button class="text-garland" @click="delFolder(f.id)">Delete</button></div>
    </section>

    <section class="card p-4 space-y-2">
      <h2 class="text-2xl">{{ form.id ? 'Edit song' : 'Add song' }}</h2>
      <input v-model="form.title" class="inp" placeholder="Song name (required)">
      <select v-model="form.folder_id" class="inp"><option value="">No folder</option>
        <option v-for="f in folders" :key="f.id" :value="f.id">{{ label(f) }}</option></select>
      <textarea v-model="form.lyrics" class="inp" rows="8" placeholder="Lyrics" />
      <textarea v-model="form.meaning" class="inp" rows="4" placeholder="Meaning" />
      <textarea v-model="form.gist" class="inp" rows="2" placeholder="Gist" />
      <input v-model="form.video_url" class="inp" placeholder="YouTube link">
      <input type="file" accept="image/*" @change="upload">
      <img v-if="form.image_url" :src="form.image_url" class="h-24 rounded" alt="">
      <select v-model="form.status" class="inp"><option value="published">Published</option><option value="draft">Draft</option></select>
      <div class="flex gap-2"><button class="btn" @click="save">Save song</button>
        <button v-if="form.id" class="btn" @click="Object.assign(form, empty())">Cancel</button></div>
    </section>

    <section class="card p-4 space-y-1">
      <h2 class="text-2xl">Songs</h2>
      <div v-for="s in songs" :key="s.id" class="flex justify-between">
        <span>{{ s.song_translations[0]?.title }} <small class="opacity-60">({{ s.status }})</small></span>
        <span class="space-x-3"><button class="text-verbena" @click="edit(s)">Edit</button><button class="text-garland" @click="del(s.id)">Delete</button></span>
      </div>
    </section>
  </div>
</template>
