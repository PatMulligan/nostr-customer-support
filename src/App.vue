<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNostrStore } from './stores/nostr'
import { useThemeStore } from './stores/theme'
import { Sun, Moon } from 'lucide-vue-next'
import LoginForm from './components/LoginForm.vue'
import ChatInterface from './components/ChatInterface.vue'
import { Button } from '@/components/ui/button'

const nostrStore = useNostrStore()
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.init()
})

const isDark = computed(() => themeStore.theme === 'dark')
</script>

<template>
  <main class="min-h-screen bg-light-base dark:bg-dark-base text-light-text dark:text-dark-text transition-colors">
    <div class="absolute top-4 right-4">
      <Button variant="ghost" size="icon" @click="themeStore.toggleTheme">
        <Sun v-if="isDark" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>
    <LoginForm v-if="!nostrStore.isLoggedIn" />
    <ChatInterface v-else />
  </main>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
