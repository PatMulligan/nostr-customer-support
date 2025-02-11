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
    'relative flex flex-col break-words min-w-[120px] max-w-[85%] md:max-w-[65%] text-sm',
    sent
      ? 'bg-gradient-to-br from-[#cba6f7] to-[#b4befe] text-[#11111b] hover:brightness-105' // Gradient from Mauve to Lavender
      : 'bg-gradient-to-br from-[#313244] to-[#45475a] text-[#cdd6f4] hover:brightness-105', // Gradient from Surface0 to Surface1
    // First message in group
    isFirst && (sent ? 'rounded-t-2xl rounded-l-2xl' : 'rounded-t-2xl rounded-r-2xl'),
    // Last message in group
    isLast && (sent ? 'rounded-b-2xl rounded-l-2xl' : 'rounded-b-2xl rounded-r-2xl'),
    // Single message
    isFirst && isLast && 'rounded-2xl',
    // Middle messages
    !isFirst && !isLast && (sent ? 'rounded-l-2xl' : 'rounded-r-2xl'),
    // Add shadow and hover effect
    'shadow-lg hover:shadow-xl transition-all duration-300 ease-out'
  ]
}
</script>

<template>
  <Card
    class="flex flex-col h-[calc(100vh-2rem)] bg-gradient-to-b from-[#1e1e2e] to-[#181825] border-[#313244] shadow-2xl overflow-hidden relative z-0">
    <CardHeader
      class="flex-shrink-0 flex flex-row items-center justify-between px-6 py-4 border-b border-[#313244]/50 bg-[#181825]/95 backdrop-blur-md relative z-50">
      <!-- Left side with avatar and name -->
      <div class="flex items-center gap-5 flex-shrink-0">
        <div class="relative group">
          <div
            class="absolute -inset-0.5 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200">
          </div>
          <Avatar
            class="relative h-11 w-11 bg-[#313244] ring-2 ring-[#cba6f7] ring-offset-2 ring-offset-[#181825] shadow-md transition-all duration-200 hover:shadow-lg group-hover:scale-105">
            <AvatarFallback class="text-base font-semibold text-[#cdd6f4]">SA</AvatarFallback>
          </Avatar>
        </div>
        <div class="hidden sm:block">
          <p class="font-semibold leading-none text-[#cdd6f4] tracking-tight">Support Agent</p>
          <div class="flex items-center gap-1.5 mt-1.5">
            <div class="w-2 h-2 rounded-full bg-[#a6e3a1] animate-pulse"></div>
            <p class="text-sm text-[#a6adc8]">Online</p>
          </div>
        </div>
      </div>

      <!-- Center badge -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          class="text-xs font-medium text-[#cdd6f4] bg-gradient-to-r from-[#313244]/80 to-[#45475a]/80 backdrop-blur-sm px-4 py-2 rounded-full whitespace-nowrap shadow-lg border border-[#45475a]/50">
          Customer Support
        </div>
      </div>

      <!-- Right side spacer to maintain layout balance -->
      <div class="flex items-center gap-5 flex-shrink-0 invisible">
        <div class="h-11 w-11"></div>
        <div class="hidden sm:block">
          <div class="h-5"></div>
          <div class="h-5 mt-1.5"></div>
        </div>
      </div>
    </CardHeader>

    <CardContent class="flex-1 min-h-0 p-0 bg-gradient-to-b from-[#1e1e2e] to-[#181825] overflow-hidden">
      <ScrollArea class="h-full" type="hover">
        <div class="flex flex-col gap-4 p-6">
          <template v-for="(group, groupIndex) in groupedMessages" :key="groupIndex">
            <!-- Date separator -->
            <div v-if="groupIndex === 0 ||
              formatDate(group.timestamp) !== formatDate(groupedMessages[groupIndex - 1].timestamp)"
              class="flex justify-center my-8">
              <div
                class="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#313244]/30 to-[#45475a]/30 text-xs font-medium text-[#a6adc8] shadow-lg backdrop-blur-sm border border-[#45475a]/20">
                {{ formatDate(group.timestamp) }}
              </div>
            </div>

            <!-- Message group -->
            <div :class="getMessageGroupClasses(group.sent)" class="w-full">
              <div class="flex flex-col gap-[3px] w-full" :class="{ 'items-end': group.sent }">
                <div v-for="(message, messageIndex) in group.messages" :key="message.id" :class="[
                  getMessageBubbleClasses(
                    group.sent,
                    messageIndex === 0,
                    messageIndex === group.messages.length - 1
                  ),
                  'w-fit backdrop-blur-sm'
                ]">
                  <!-- Message content wrapper -->
                  <div class="px-5 py-3.5 break-words whitespace-pre-wrap">
                    <span class="select-text">{{ message.content }}</span>
                  </div>

                  <!-- Action buttons for txid/wallet -->
                  <div v-if="hasTxid(message.content) || hasWallet(message.content)"
                    class="flex flex-col sm:flex-row flex-wrap gap-2.5 px-5 pb-3.5 pt-2.5 mt-0.5 border-t border-[#1e1e2e]/10">
                    <!-- Transaction actions -->
                    <div v-if="hasTxid(message.content)" class="flex items-center gap-2.5 flex-wrap">
                      <button @click="copyToClipboard(getTxid(message.content), 'txid')"
                        class="inline-flex items-center gap-2 px-4 h-8 rounded-full bg-gradient-to-r from-[#313244]/90 to-[#45475a]/90 hover:brightness-110 active:brightness-90 transition-all duration-200 text-xs font-medium select-none text-[#89b4fa] shadow-lg hover:shadow-xl backdrop-blur-sm min-w-[100px] border border-[#45475a]/30">
                        <Copy class="h-3.5 w-3.5 shrink-0" />
                        <span class="truncate">Copy txid</span>
                      </button>
                      <a v-if="getTxid(message.content)" :href="`https://mempool.space/tx/${getTxid(message.content)}`"
                        target="_blank" rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-4 h-8 rounded-full bg-gradient-to-r from-[#313244]/90 to-[#45475a]/90 hover:brightness-110 active:brightness-90 transition-all duration-200 text-xs font-medium select-none text-[#89b4fa] shadow-lg hover:shadow-xl backdrop-blur-sm min-w-[130px] border border-[#45475a]/30">
                        <ExternalLink class="h-3.5 w-3.5 shrink-0" />
                        <span class="truncate">mempool.space</span>
                      </a>
                    </div>
                    <!-- Wallet actions -->
                    <div v-if="hasWallet(message.content)" class="flex items-center gap-2.5 flex-wrap">
                      <button @click="copyToClipboard(getWallet(message.content), 'wallet')"
                        class="inline-flex items-center gap-2 px-4 h-8 rounded-full bg-gradient-to-r from-[#313244]/90 to-[#45475a]/90 hover:brightness-110 active:brightness-90 transition-all duration-200 text-xs font-medium select-none text-[#f9e2af] shadow-lg hover:shadow-xl backdrop-blur-sm min-w-[110px] border border-[#45475a]/30">
                        <Copy class="h-3.5 w-3.5 shrink-0" />
                        <span class="truncate">Copy wallet</span>
                      </button>
                      <a v-if="getWallet(message.content)"
                        :href="`https://mempool.space/address/${getWallet(message.content)}`" target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-4 h-8 rounded-full bg-gradient-to-r from-[#313244]/90 to-[#45475a]/90 hover:brightness-110 active:brightness-90 transition-all duration-200 text-xs font-medium select-none text-[#f9e2af] shadow-lg hover:shadow-xl backdrop-blur-sm min-w-[130px] border border-[#45475a]/30">
                        <ExternalLink class="h-3.5 w-3.5 shrink-0" />
                        <span class="truncate">mempool.space</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <span class="text-[11px] text-[#6c7086] px-3 mt-2 select-none" :class="{ 'self-end': group.sent }">
                {{ formatTime(group.timestamp) }}
              </span>
            </div>
          </template>
          <div ref="messagesEndRef" />
        </div>
      </ScrollArea>
    </CardContent>

    <CardFooter
      class="flex-shrink-0 mt-auto border-t border-[#313244]/50 bg-[#181825]/95 backdrop-blur-md p-6 shadow-xl">
      <form @submit="sendMessage" class="flex w-full items-center gap-4">
        <Input id="message" v-model="input" placeholder="Type your message..."
          class="flex-1 bg-[#1e1e2e]/90 border-[#313244] text-[#cdd6f4] placeholder:text-[#6c7086] focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] transition-all duration-300 shadow-lg hover:border-[#45475a] rounded-xl h-11"
          autocomplete="off" />
        <Button type="submit" size="icon" :disabled="inputLength === 0 || isSending"
          class="bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] hover:brightness-110 active:brightness-90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-lg h-11 w-11 rounded-xl flex-shrink-0">
          <Send v-if="!isSending" class="h-4 w-4" />
          <div v-else class="h-4 w-4 animate-spin rounded-full border-2 border-[#11111b] border-r-transparent" />
          <span class="sr-only">{{ isSending ? 'Sending...' : 'Send' }}</span>
        </Button>
      </form>
    </CardFooter>
  </Card>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.3s cubic-bezier(0.21, 1.02, 0.73, 1);
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
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

/* Enhanced scrollbar styling */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #45475a;
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #585b70;
}

:deep(.scrollarea-viewport) {
  height: 100%;
  scroll-behavior: smooth;
}

:deep(.scrollarea-thumb-y) {
  z-index: 30;
  width: 5px !important;
  background: #45475a !important;
  border-radius: 9999px !important;
  transition: all 0.2s ease-in-out;
}

:deep(.scrollarea-thumb-y:hover) {
  background: #585b70 !important;
  width: 6px !important;
}

/* Improved focus styles */
:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 2px;
  transition: outline-offset 0.2s ease;
}

/* Enhanced button hover states */
button:not(:disabled):hover,
a:hover {
  transform: translateY(-1px) scale(1.02);
}

button:not(:disabled):active,
a:active {
  transform: translateY(0) scale(0.98);
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Glass morphism effects */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Gradient animations */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-animate {
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

/* Add these new styles */
.translate-center {
  transform: translate(-50%, -50%);
}

/* Update flex layout styles */
.chat-card {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 2rem);
  max-height: calc(100vh - 2rem);
}

.chat-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scrollarea-viewport {
  height: 100%;
}
</style>
