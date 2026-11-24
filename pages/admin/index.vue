<script setup>
const sb = useSb()
const folders = ref([]), songs = ref([]), fname = ref(''), fparent = ref('')
const empty = () => ({ id: null, folder_id: '', title: '', lyrics: '', meaning: '', gist: '', image_url: '', video_url: '', status: 'published' })
const form = reactive(empty())
const saving = ref(false)

const songModal = ref({
  isOpen: false,
  title: '',
  songName: '',
  songId: null
})

const folderModal = ref({
  isOpen: false,
  name: ''
})

const label = (f) => {
  let n = f.name, p = folders.value.find(x => x.id === f.parent_id)
  while (p) {
    n = p.name + ' › ' + n
    p = folders.value.find(x => x.id === p.parent_id)
  }
  return n
}

async function load() {
  folders.value = (await sb.from('folders').select('*').order('name')).data || []
  songs.value = (await sb.from('songs').select('*,song_translations(*)').order('created_at', { ascending: false })).data || []
}

onMounted(async () => {
  (await sb.auth.getSession()).data.session ? load() : navigateTo('/admin/login')
})

async function addFolder() {
  if (!fname.value) return
  const folderName = fname.value
  const { error } = await sb.from('folders').insert({ name: folderName, parent_id: fparent.value || null })
  if (error) {
    return alert('Error adding folder: ' + error.message)
  }
  fname.value = ''
  folderModal.value = {
    isOpen: true,
    name: folderName
  }
  await load()
}

async function delFolder(id) {
  if (confirm('Delete this folder and its subfolders?')) {
    const { error } = await sb.from('folders').delete().eq('id', id)
    if (error) return alert('Error deleting folder: ' + error.message)
    load()
  }
}

async function upload(e) {
  const file = e.target.files[0]
  if (!file) return
  const path = Date.now() + '-' + file.name.replace(/\s+/g, '_')
  const { error } = await sb.storage.from('images').upload(path, file)
  if (error) return alert(error.message)
  form.image_url = sb.storage.from('images').getPublicUrl(path).data.publicUrl
}

async function save() {
  if (!form.title) return alert('Song name is required')
  saving.value = true
  const isEdit = !!form.id
  const savedTitle = form.title
  const row = {
    folder_id: form.folder_id || null,
    image_url: form.image_url || null,
    video_url: form.video_url || null,
    status: form.status
  }

  try {
    let id = form.id
    if (id) {
      const { error } = await sb.from('songs').update(row).eq('id', id)
      if (error) throw error
    } else {
      const { data, error } = await sb.from('songs').insert(row).select().single()
      if (error) throw error
      id = data.id
    }

    const { error: trError } = await sb.from('song_translations').upsert({
      song_id: id,
      language: 'en',
      title: savedTitle,
      lyrics: form.lyrics,
      meaning: form.meaning,
      gist: form.gist
    })
    if (trError) throw trError

    // Success: trigger modal with view & add-another options
    songModal.value = {
      isOpen: true,
      title: isEdit ? 'Song updated' : 'Song added',
      songName: savedTitle,
      songId: id
    }
    Object.assign(form, empty())
    await load()
  } catch (err) {
    alert('Error saving song: ' + (err.message || err))
  } finally {
    saving.value = false
  }
}

function edit(s) {
  const t = s.song_translations.find(x => x.language === 'en') || s.song_translations[0] || {}
  Object.assign(form, {
    id: s.id,
    folder_id: s.folder_id || '',
    title: t.title || '',
    lyrics: t.lyrics || '',
    meaning: t.meaning || '',
    gist: t.gist || '',
    image_url: s.image_url || '',
    video_url: s.video_url || '',
    status: s.status
  })
  scrollTo(0, 0)
}

async function del(id) {
  if (confirm('Delete this song?')) {
    const { error } = await sb.from('songs').delete().eq('id', id)
    if (error) return alert('Error deleting song: ' + error.message)
    load()
  }
}

async function logout() {
  await sb.auth.signOut()
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-4xl text-galaxy font-head">Admin Dashboard</h1>
      <button class="btn bg-garland text-cream hover:opacity-90" @click="logout">Sign out</button>
    </div>

    <!-- Folders Section -->
    <section class="card p-5 space-y-3">
      <h2 class="text-2xl font-head text-galaxy">Folders</h2>
      <div class="flex gap-2 flex-wrap">
        <input v-model="fname" class="inp flex-1 min-w-[200px]" placeholder="New folder name" @keyup.enter="addFolder">
        <select v-model="fparent" class="inp w-auto">
          <option value="">Top level</option>
          <option v-for="f in folders" :key="f.id" :value="f.id">{{ label(f) }}</option>
        </select>
        <button class="btn" @click="addFolder">Add folder</button>
      </div>
      <div class="divide-y divide-rose/20 max-h-60 overflow-y-auto">
        <div v-for="f in folders" :key="f.id" class="flex justify-between items-center py-2 text-sm">
          <span class="font-medium text-galaxy">{{ label(f) }}</span>
          <button class="text-garland hover:underline font-semibold" @click="delFolder(f.id)">Delete</button>
        </div>
      </div>
    </section>

    <!-- Song Add / Edit Form -->
    <section class="card p-5 space-y-3">
      <h2 class="text-2xl font-head text-galaxy">{{ form.id ? 'Edit song' : 'Add new song' }}</h2>
      <input v-model="form.title" class="inp" placeholder="Song name (required)">
      <select v-model="form.folder_id" class="inp">
        <option value="">No folder</option>
        <option v-for="f in folders" :key="f.id" :value="f.id">{{ label(f) }}</option>
      </select>
      <textarea v-model="form.lyrics" class="inp" rows="8" placeholder="Lyrics" />
      <textarea v-model="form.meaning" class="inp" rows="4" placeholder="Meaning" />
      <textarea v-model="form.gist" class="inp" rows="2" placeholder="Gist" />
      <input v-model="form.video_url" class="inp" placeholder="YouTube link (e.g. https://www.youtube.com/watch?v=...)">
      <div>
        <label class="block text-sm font-medium text-galaxy/80 mb-1">Cover Image:</label>
        <input type="file" accept="image/*" class="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-rose/30 file:text-galaxy file:font-semibold hover:file:bg-rose/50 cursor-pointer" @change="upload">
      </div>
      <img v-if="form.image_url" :src="form.image_url" class="h-24 rounded-lg object-cover border border-rose" alt="Preview">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-galaxy">Status:</span>
        <select v-model="form.status" class="inp w-auto">
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div class="flex gap-2 pt-2">
        <button class="btn" :disabled="saving" @click="save">
          {{ saving ? 'Saving...' : 'Save song' }}
        </button>
        <button v-if="form.id" class="btn bg-rose/40 hover:bg-rose/60" @click="Object.assign(form, empty())">
          Cancel
        </button>
      </div>
    </section>

    <!-- Songs List Section -->
    <section class="card p-5 space-y-2">
      <h2 class="text-2xl font-head text-galaxy">Existing Songs ({{ songs.length }})</h2>
      <div class="divide-y divide-rose/20 max-h-96 overflow-y-auto">
        <div v-for="s in songs" :key="s.id" class="flex justify-between items-center py-2.5">
          <div class="min-w-0 pr-3">
            <span class="font-medium text-galaxy truncate block">{{ s.song_translations[0]?.title || 'Untitled' }}</span>
            <span class="text-xs uppercase tracking-wider px-1.5 py-0.5 rounded" :class="s.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'">
              {{ s.status }}
            </span>
          </div>
          <div class="space-x-3 flex-shrink-0">
            <button class="text-verbena font-semibold hover:underline" @click="edit(s)">Edit</button>
            <button class="text-garland font-semibold hover:underline" @click="del(s.id)">Delete</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Song Success Modal -->
    <div
      v-if="songModal.isOpen"
      class="fixed inset-0 z-50 bg-galaxy/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="card bg-cream p-6 max-w-md w-full shadow-2xl space-y-4 text-center border-2 border-rose">
        <div class="text-4xl">🪷</div>
        <h3 class="text-2xl font-head font-bold text-galaxy">{{ songModal.title }}</h3>
        <p class="text-lg text-galaxy font-semibold bg-white/80 p-3 rounded-lg border border-rose/30">
          {{ songModal.songName }}
        </p>
        <p class="text-sm text-galaxy/70">
          The song has been successfully saved to your database.
        </p>
        <div class="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            class="btn bg-apricot text-galaxy font-semibold flex-1"
            @click="navigateTo('/song/' + songModal.songId)"
          >
            View song
          </button>
          <button
            class="btn bg-verbena text-cream hover:bg-verbena/90 flex-1"
            @click="Object.assign(form, empty()); songModal.isOpen = false"
          >
            Add another song
          </button>
          <button
            class="px-4 py-2 rounded-full border border-galaxy/30 text-galaxy/80 hover:bg-galaxy/10 text-sm font-medium"
            @click="songModal.isOpen = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Folder Success Modal -->
    <div
      v-if="folderModal.isOpen"
      class="fixed inset-0 z-50 bg-galaxy/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="card bg-cream p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border-2 border-rose">
        <div class="text-3xl">🪔</div>
        <h3 class="text-2xl font-head font-bold text-galaxy">Folder added</h3>
        <p class="text-base text-galaxy font-semibold bg-white/80 p-2.5 rounded-lg border border-rose/30">
          {{ folderModal.name }}
        </p>
        <button class="btn w-full mt-2" @click="folderModal.isOpen = false">
          Done
        </button>
      </div>
    </div>
  </div>
</template>
