<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNostrStore } from '@/stores/nostr'
import { npubToHex } from '@/lib/nostr'
import ChatBox from './ChatBox.vue'

const nostrStore = useNostrStore()
const SUPPORT_NPUB = import.meta.env.VITE_SUPPORT_NPUB

if (!SUPPORT_NPUB) {
  throw new Error('VITE_SUPPORT_NPUB environment variable is not set')
}

onMounted(() => {
  try {
    // Convert npub to hex before setting as active chat
    const supportPubkeyHex = npubToHex(SUPPORT_NPUB)
    nostrStore.activeChat = supportPubkeyHex
    nostrStore.subscribeToMessages()
  } catch (err) {
    console.error('Failed to decode support npub:', err)
  }
})
</script>

<template>
  <div class="container mx-auto max-w-4xl p-4 h-screen">
    <ChatBox />
  </div>
</template> 