<script setup lang="ts">
import { computed } from 'vue'
import { useNostrStore } from './stores/nostr'
import LoginForm from './components/LoginForm.vue'
import ChatInterface from './components/ChatInterface.vue'

const nostrStore = useNostrStore()
</script>

<template>
  <main>
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
