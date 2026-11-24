<script setup>
const sb = useSb(); const email = ref(''); const password = ref(''); const err = ref('')
async function login() {
  const { error } = await sb.auth.signInWithPassword({ email: email.value, password: password.value })
  error ? (err.value = error.message) : navigateTo('/admin')
}
</script>
<template>
  <div class="card p-5 max-w-sm mx-auto mt-10 space-y-3">
    <h1 class="text-3xl">Admin sign in</h1>
    <input v-model="email" class="inp" type="email" placeholder="Email">
    <input v-model="password" class="inp" type="password" placeholder="Password" @keyup.enter="login">
    <p v-if="err" class="text-garland">{{ err }}</p>
    <button class="btn" @click="login">Sign in</button>
  </div>
</template>
