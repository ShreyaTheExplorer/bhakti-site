<script setup>
const route = useRoute()
const { favs } = useFavs()
const mobileMenuOpen = ref(false)

const navLinks = computed(() => [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse' },
  { to: '/favourites', label: 'Favourites', count: favs.value.length },
  { to: '/admin', label: 'Admin' }
])

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 bg-galaxy text-cream shadow-md">
      <nav class="max-w-6xl mx-auto flex items-center justify-between px-4 py-3" aria-label="Main Navigation">
        <!-- Brand Logo -->
        <NuxtLink
          to="/"
          class="font-head text-2xl tracking-wide flex items-center gap-2 hover:text-apricot transition-colors focus:outline-none focus:ring-2 focus:ring-apricot focus:ring-offset-2 focus:ring-offset-galaxy rounded"
        >
          <span>🪷</span>
          <span class="font-bold">Bhakti Geet</span>
        </NuxtLink>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center gap-6">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'flex items-center text-base transition-colors py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-apricot focus:ring-offset-1 focus:ring-offset-galaxy',
              isActive(link.to)
                ? 'text-apricot font-semibold border-b-2 border-apricot'
                : 'text-cream/90 hover:text-apricot'
            ]"
          >
            <span>{{ link.label }}</span>
            <span
              v-if="link.count !== undefined && link.count > 0"
              class="ml-1.5 px-1.5 py-0.5 text-xs font-bold leading-none bg-apricot text-galaxy rounded-full"
              :aria-label="`${link.count} favourites`"
            >
              {{ link.count }}
            </span>
          </NuxtLink>
        </div>

        <!-- Mobile Hamburger Button -->
        <button
          type="button"
          class="md:hidden p-2 rounded text-cream hover:text-apricot focus:outline-none focus:ring-2 focus:ring-apricot focus:ring-offset-2 focus:ring-offset-galaxy"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </nav>

      <!-- Mobile Dropdown Menu -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden bg-galaxy border-t border-rose/20 px-4 py-3 space-y-2 shadow-inner"
      >
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :class="[
            'flex items-center justify-between text-base py-2 px-3 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-apricot',
            isActive(link.to)
              ? 'bg-rose/20 text-apricot font-semibold'
              : 'text-cream/90 hover:bg-rose/10 hover:text-apricot'
          ]"
          @click="mobileMenuOpen = false"
        >
          <span>{{ link.label }}</span>
          <span
            v-if="link.count !== undefined && link.count > 0"
            class="px-2 py-0.5 text-xs font-bold bg-apricot text-galaxy rounded-full"
          >
            {{ link.count }}
          </span>
        </NuxtLink>
      </div>
    </header>

    <main class="w-full flex-1">
      <NuxtPage />
    </main>
  </div>
</template>
