<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNostrStore } from '../stores/nostr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const nostrStore = useNostrStore()
const newMessage = ref('')

const sendMessage = async () => {
  if (!newMessage.value.trim() || !nostrStore.activeChat) return
  
  await nostrStore.sendMessage(nostrStore.activeChat, newMessage.value)
  newMessage.value = ''
}

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
    <Card class="flex-1">
      <CardHeader>
        <CardTitle v-if="nostrStore.activeChat">
          {{ nostrStore.profiles.get(nostrStore.activeChat)?.name || nostrStore.activeChat.substring(0, 8) }}
        </CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col h-[calc(100vh-12rem)]">
        <ScrollArea class="flex-1">
          <div class="space-y-4 p-4">
            <div
              v-for="message in nostrStore.currentMessages"
              :key="message.id"
              class="flex"
              :class="message.sent ? 'justify-end' : 'justify-start'"
            >
              <div
                class="rounded-lg px-4 py-2 max-w-[70%]"
                :class="message.sent ? 'bg-primary text-primary-foreground' : 'bg-muted'"
              >
                <p class="text-sm">{{ message.content }}</p>
                <span class="text-xs opacity-70">
                  {{ new Date(message.created_at * 1000).toLocaleTimeString() }}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div class="p-4 border-t">
          <form @submit.prevent="sendMessage" class="flex space-x-2">
            <Input
              v-model="newMessage"
              placeholder="Type your message..."
              class="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </CardContent>
    </Card>
  </div>
</template> 