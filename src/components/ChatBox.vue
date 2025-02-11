<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { Send, Copy, ExternalLink, Check, AlertCircle } from 'lucide-vue-next'
import { useNostrStore } from '@/stores/nostr'
import type { DirectMessage } from '@/types/nostr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/toast'

const { toast } = useToast()

const nostrStore = useNostrStore()
const input = ref('')
const inputLength = computed(() => input.value.trim().length)
const messagesEndRef = ref<HTMLDivElement | null>(null)
const isSending = ref(false)

// Group messages by sender and time
interface MessageGroup {
  sent: boolean
  messages: DirectMessage[]
  timestamp: number
}

const groupedMessages = computed<MessageGroup[]>(() => {
  const groups: MessageGroup[] = []
  let currentGroup: MessageGroup | null = null

  // Sort messages by timestamp first
  const sortedMessages = [...nostrStore.currentMessages].sort((a, b) => a.created_at - b.created_at)

  for (const message of sortedMessages) {
    // Start a new group if:
    // 1. No current group
    // 2. Different sender than last message
    // 3. More than 2 minutes since last message
    if (!currentGroup ||
      currentGroup.sent !== message.sent ||
      message.created_at - currentGroup.messages[currentGroup.messages.length - 1].created_at > 120) {
      currentGroup = {
        sent: message.sent,
        messages: [],
        timestamp: message.created_at
      }
      groups.push(currentGroup)
    }
    currentGroup.messages.push(message)
  }
  return groups
})

// Scroll to bottom when new messages arrive
watch(() => nostrStore.currentMessages.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

onMounted(() => {
  scrollToBottom()
})

function scrollToBottom() {
  if (messagesEndRef.value) {
    messagesEndRef.value.scrollIntoView({ behavior: 'smooth' })
  }
}

const sendMessage = async (event: Event) => {
  event.preventDefault()
  if (inputLength.value === 0 || !nostrStore.activeChat || isSending.value) return

  try {
    isSending.value = true
    await nostrStore.sendMessage(nostrStore.activeChat, input.value)
    input.value = ''
  } finally {
    isSending.value = false
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString()
}

const getMessageGroupClasses = (sent: boolean) => {
  return [
    'group flex flex-col gap-0.5 animate-in slide-in-from-bottom-2',
    sent ? 'items-end' : 'items-start'
  ]
}

const hasTxid = (content: string) => {
  const txidPattern = /\b[a-fA-F0-9]{64}\b/g
  return txidPattern.test(content)
}

const getTxid = (content: string) => {
  const txidPattern = /\b[a-fA-F0-9]{64}\b/g
  const match = content.match(txidPattern)
  return match ? match[0] : null
}

const hasWallet = (content: string) => {
  // Match both legacy and native segwit addresses
  const walletPattern = /\b(1[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\b/g
  return walletPattern.test(content)
}

const getWallet = (content: string) => {
  const walletPattern = /\b(1[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})\b/g
  const match = content.match(walletPattern)
  return match ? match[0] : null
}

const copyToClipboard = async (text: string | null, type: 'txid' | 'wallet') => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard',
      description: type === 'txid'
        ? `${text.slice(0, 8)}...${text.slice(-8)}`
        : text,
      duration: 2000,
      class: 'group border-[#45475a] bg-[#1e1e2e] text-[#cdd6f4]',
      icon: Check,
      iconClass: 'text-[#a6e3a1]',
      titleClass: 'text-[#a6e3a1]',
    })
  } catch (err) {
    console.error('Failed to copy:', err)
    toast({
      title: 'Failed to copy',
      description: 'Please try again',
      variant: 'destructive',
      duration: 2000,
      class: 'group border-red-900/50 bg-red-950 text-red-50',
      icon: AlertCircle,
    })
  }
}

const getMessageBubbleClasses = (sent: boolean, isFirst: boolean, isLast: boolean) => {
  return [
    'relative flex flex-col break-words min-w-[120px] max-w-[85%] md:max-w-[70%] text-sm overflow-hidden',
    sent
      ? 'bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#cba6f7]/95' // Mauve with dark base text
      : 'bg-[#45475a] text-[#cdd6f4] hover:bg-[#45475a]/95', // Surface1 with text
    // First message in group
    isFirst && (sent ? 'rounded-t-2xl rounded-l-2xl' : 'rounded-t-2xl rounded-r-2xl'),
    // Last message in group
    isLast && (sent ? 'rounded-b-2xl rounded-l-2xl' : 'rounded-b-2xl rounded-r-2xl'),
    // Single message
    isFirst && isLast && 'rounded-2xl',
    // Middle messages
    !isFirst && !isLast && (sent ? 'rounded-l-2xl' : 'rounded-r-2xl'),
    // Add shadow and hover effect
    'shadow-sm hover:shadow-md transition-all duration-200'
  ]
}
</script>

<template>
  <Card class="h-[calc(100vh-2rem)] bg-[#1e1e2e] border-[#313244] shadow-xl overflow-hidden relative z-0">
    <CardHeader
      class="flex flex-row items-center justify-between border-b border-[#313244] px-4 bg-[#181825] relative min-h-[4rem]">
      <!-- Left side with avatar and name -->
      <div class="flex items-center gap-4 flex-shrink-0 z-10">
        <div class="relative">
          <Avatar class="h-10 w-10 bg-[#313244] ring-2 ring-[#cba6f7] ring-offset-2 ring-offset-[#181825]">
            <AvatarFallback class="text-base font-medium text-[#cdd6f4]">SA</AvatarFallback>
          </Avatar>
        </div>
        <div class="hidden sm:block">
          <p class="font-medium leading-none text-[#cdd6f4]">Support Agent</p>
        </div>
      </div>

      <!-- Center badge -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="text-xs text-[#a6adc8] bg-[#313244] px-2.5 py-1 rounded-full whitespace-nowrap">
          Customer Support
        </div>
      </div>

      <!-- Right side spacer -->
      <div class="w-[120px]"></div>
    </CardHeader>

    <CardContent class="p-0 h-[calc(100%-8rem)] bg-[#1e1e2e]">
      <ScrollArea class="h-full" type="hover">
        <div class="flex flex-col gap-3 px-4 py-4">
          <template v-for="(group, groupIndex) in groupedMessages" :key="groupIndex">
            <!-- Date separator -->
            <div v-if="groupIndex === 0 ||
              formatDate(group.timestamp) !== formatDate(groupedMessages[groupIndex - 1].timestamp)"
              class="flex justify-center my-4">
              <div class="px-3.5 py-1.5 rounded-full bg-[#313244]/50 text-xs font-medium text-[#cdd6f4] shadow-sm">
                {{ formatDate(group.timestamp) }}
              </div>
            </div>

            <!-- Message group -->
            <div :class="getMessageGroupClasses(group.sent)" class="w-full">
              <div class="flex flex-col gap-[3px] w-full" :class="{ 'items-end': group.sent }">
                <div v-for="(message, messageIndex) in group.messages" :key="message.id" 
                  :class="[
                    getMessageBubbleClasses(
                      group.sent,
                      messageIndex === 0,
                      messageIndex === group.messages.length - 1
                    ),
                    'w-fit'
                  ]"
                >
                  <!-- Message content wrapper -->
                  <div class="px-4 py-3 break-words whitespace-pre-wrap">
                    <span class="select-text">{{ message.content }}</span>
                  </div>

                  <!-- Action buttons for txid/wallet -->
                  <div v-if="hasTxid(message.content) || hasWallet(message.content)"
                    class="flex flex-col sm:flex-row flex-wrap gap-2 px-4 pb-3 pt-2 mt-0 border-t border-[#1e1e2e]/10">
                    <!-- Transaction actions -->
                    <div v-if="hasTxid(message.content)" class="flex items-center gap-1.5 flex-wrap">
                      <button @click="copyToClipboard(getTxid(message.content), 'txid')"
                        class="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-[#313244] hover:bg-[#45475a] active:bg-[#45475a]/80 transition-all duration-200 text-xs font-medium select-none text-[#89b4fa] shadow-sm hover:shadow min-w-[90px]">
                        <Copy class="h-3.5 w-3.5 shrink-0" />
                        <span class="truncate">Copy txid</span>
                      </button>
                      <a v-if="getTxid(message.content)" :href="`https://mempool.space/tx/${getTxid(message.content)}`"
                        target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-[#313244] hover:bg-[#45475a] active:bg-[#45475a]/80 transition-all duration-200 text-xs font-medium select-none text-[#89b4fa] shadow-sm hover:shadow min-w-[120px]">
                        <ExternalLink class="h-3.5 w-3.5 shrink-0" />
                        <span class="truncate">View on mempool</span>
                      </a>
                    </div>
                    <!-- Wallet actions -->
                    <div v-if="hasWallet(message.content)" class="flex items-center gap-1.5 flex-wrap">
                      <button @click="copyToClipboard(getWallet(message.content), 'wallet')"
                        class="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-[#313244] hover:bg-[#45475a] active:bg-[#45475a]/80 transition-all duration-200 text-xs font-medium select-none text-[#f9e2af] shadow-sm hover:shadow min-w-[100px]">
                        <Copy class="h-3.5 w-3.5 shrink-0" />
                        <span class="truncate">Copy wallet</span>
                      </button>
                      <a v-if="getWallet(message.content)"
                        :href="`https://mempool.space/address/${getWallet(message.content)}`" target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-[#313244] hover:bg-[#45475a] active:bg-[#45475a]/80 transition-all duration-200 text-xs font-medium select-none text-[#f9e2af] shadow-sm hover:shadow min-w-[120px]">
                        <ExternalLink class="h-3.5 w-3.5 shrink-0" />
                        <span class="truncate">View on mempool</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <span class="text-[11px] text-[#6c7086] px-2 mt-1 select-none" :class="{ 'self-end': group.sent }">
                {{ formatTime(group.timestamp) }}
              </span>
            </div>
          </template>
          <div ref="messagesEndRef" />
        </div>
      </ScrollArea>
    </CardContent>

    <CardFooter class="border-t border-[#313244] bg-[#181825] p-4">
      <form @submit="sendMessage" class="flex w-full items-center space-x-3">
        <Input id="message" v-model="input" placeholder="Type your message..."
          class="flex-1 bg-[#1e1e2e] border-[#313244] text-[#cdd6f4] placeholder:text-[#6c7086] focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] transition-all shadow-sm"
          autocomplete="off" />
        <Button type="submit" size="icon" :disabled="inputLength === 0 || isSending"
          class="bg-[#cba6f7] text-[#1e1e2e] hover:bg-[#cba6f7]/90 active:bg-[#cba6f7]/80 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-md h-10 w-10 flex-shrink-0">
          <Send v-if="!isSending" class="h-4 w-4" />
          <div v-else class="h-4 w-4 animate-spin rounded-full border-2 border-[#1e1e2e] border-r-transparent" />
          <span class="sr-only">{{ isSending ? 'Sending...' : 'Send' }}</span>
        </Button>
      </form>
    </CardFooter>
  </Card>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.select-none {
  user-select: none;
  -webkit-user-select: none;
}

.select-text {
  user-select: text;
  -webkit-user-select: text;
}

/* Improve scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #45475a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #585b70;
}

:deep(.scrollarea-viewport) {
  height: 100%;
}

:deep(.scrollarea-thumb-y) {
  z-index: 30;
}

/* Update z-index styles */
:deep(.fixed) {
  z-index: 50;
}

:deep(.absolute) {
  z-index: 40;
}

/* Ensure proper stacking for interactive elements */
button,
a {
  position: relative;
  z-index: 20;
}

.animate-in {
  position: relative;
  z-index: 10;
}

/* Add padding compensation for avatar */
.avatar-wrapper {
  padding: 2px;
  margin: -2px;
}

/* Ensure proper header layout */
:deep(.card-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 4rem;
  padding: 1rem;
}

/* Remove the previous width-related styles and add these new ones */
.w-fit {
  width: fit-content;
}

/* Remove these previous styles as they're now handled inline */
.flex-col {
  width: 100%;
}

.max-w-full {
  max-width: 100%;
}

.items-end>div {
  width: fit-content;
  max-width: 100%;
}
</style>
