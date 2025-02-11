<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNostrStore } from '@/stores/nostr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import ChatBox from './ChatBox.vue'

const nostrStore = useNostrStore()

onMounted(() => {
  nostrStore.subscribeToMessages()
})
</script>

<template>
  <div class="flex h-screen">
    <!-- Chat List -->
    <Card class="w-1/4 border-r">
      <CardHeader>
        <CardTitle>Chats</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea class="h-[calc(100vh-8rem)]">
          <div
            v-for="[pubkey] in nostrStore.messages"
            :key="pubkey"
            @click="nostrStore.activeChat = pubkey"
            class="flex items-center space-x-4 p-4 hover:bg-accent cursor-pointer rounded-lg"
            :class="{ 'bg-accent': nostrStore.activeChat === pubkey }"
          >
            <Avatar>
              <AvatarImage
                :src="nostrStore.profiles.get(pubkey)?.picture"
                :alt="nostrStore.profiles.get(pubkey)?.name || pubkey"
              />
              <AvatarFallback>
                {{ (nostrStore.profiles.get(pubkey)?.name || pubkey).substring(0, 2) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium leading-none">
                {{ nostrStore.profiles.get(pubkey)?.name || pubkey.substring(0, 8) }}
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    <!-- Chat Messages -->
    <div class="flex-1 p-4">
      <ChatBox v-if="nostrStore.activeChat" />
      <div v-else class="flex h-full items-center justify-center text-muted-foreground">
        Select a chat to start messaging
      </div>
    </div>
  </div>
</template> 