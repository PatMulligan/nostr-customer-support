<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNostrStore } from './stores/nostr'
import { useThemeStore } from './stores/theme'
import { Sun, Moon } from 'lucide-vue-next'
import LoginForm from './components/LoginForm.vue'
import ChatInterface from './components/ChatInterface.vue'
import LogoutDialog from './components/LogoutDialog.vue'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toast'

const nostrStore = useNostrStore()
const themeStore = useThemeStore()

onMounted(async () => {
  themeStore.init()
  await nostrStore.init()
})

const isDark = computed(() => themeStore.theme === 'dark')

const handleLogout = () => {
  nostrStore.logout()
}
</script>

<template>
  <main class="min-h-screen bg-light-base dark:bg-dark-base text-light-text dark:text-dark-text transition-colors">
    <div class="absolute top-4 right-4 flex items-center gap-2 z-[100]">
      <LogoutDialog v-if="nostrStore.isLoggedIn" :onLogout="handleLogout" />
      <Button 
        variant="ghost" 
        size="icon" 
        @click="themeStore.toggleTheme"
        class="hover:bg-light-surface0 dark:hover:bg-dark-surface0"
      >
        <Sun v-if="isDark" class="h-5 w-5" />
        <Moon v-else class="h-5 w-5" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <LoginForm v-if="!nostrStore.isLoggedIn" />
      <ChatInterface v-else />
    </Transition>
    <Toaster />
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
