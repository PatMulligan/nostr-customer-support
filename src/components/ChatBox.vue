<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Send } from 'lucide-vue-next'
import { useNostrStore } from '@/stores/nostr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const nostrStore = useNostrStore()
const input = ref('')
const inputLength = computed(() => input.value.trim().length)

const sendMessage = async (event: Event) => {
  event.preventDefault()
  if (inputLength.value === 0 || !nostrStore.activeChat) return

  await nostrStore.sendMessage(nostrStore.activeChat, input.value)
  input.value = ''
}

const getMessageClasses = (sent: boolean) => {
  return [
    'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
    sent ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
  ]
}
</script>

<template>
  <Card>
    <CardHeader class="flex flex-row items-center">
      <div class="flex items-center space-x-4">
        <Avatar v-if="nostrStore.activeChat">
          <AvatarImage
            :src="nostrStore.profiles.get(nostrStore.activeChat)?.picture"
            :alt="nostrStore.profiles.get(nostrStore.activeChat)?.name || 'User'"
          />
          <AvatarFallback>
            {{ (nostrStore.profiles.get(nostrStore.activeChat)?.name || nostrStore.activeChat)?.substring(0, 2) }}
          </AvatarFallback>
        </Avatar>
        <div>
          <p class="text-sm font-medium leading-none">
            {{ nostrStore.profiles.get(nostrStore.activeChat || '')?.name || nostrStore.activeChat?.substring(0, 8) }}
          </p>
          <p class="text-sm text-muted-foreground">
            {{ nostrStore.profiles.get(nostrStore.activeChat || '')?.nip05 }}
          </p>
        </div>
      </div>
      <TooltipProvider :delay-duration="0">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              size="icon"
              variant="outline"
              class="ml-auto rounded-full"
            >
              <Plus class="h-4 w-4" />
              <span class="sr-only">New message</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent :side-offset="10">New message</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </CardHeader>

    <CardContent>
      <div class="space-y-4">
        <div
          v-for="message in nostrStore.currentMessages"
          :key="message.id"
          :class="getMessageClasses(message.sent)"
        >
          {{ message.content }}
        </div>
      </div>
    </CardContent>

    <CardFooter>
      <form
        @submit="sendMessage"
        class="flex w-full items-center space-x-2"
      >
        <Input
          id="message"
          v-model="input"
          placeholder="Type your message..."
          class="flex-1"
          autocomplete="off"
        />
        <Button type="submit" size="icon" :disabled="inputLength === 0">
          <Send class="h-4 w-4" />
          <span class="sr-only">Send</span>
        </Button>
      </form>
    </CardFooter>
  </Card>
</template> 