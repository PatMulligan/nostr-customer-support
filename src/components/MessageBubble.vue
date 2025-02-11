<script setup lang="ts">
import { Copy, ExternalLink } from 'lucide-vue-next'
import type { DirectMessage } from '@/types/nostr'
import { useToast } from '@/components/ui/toast'
import { Check, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  message: DirectMessage
  isFirst: boolean
  isLast: boolean
  sent: boolean
}>()

const { toast } = useToast()

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
      ? 'bg-gradient-to-br from-[#cba6f7] to-[#b4befe] text-[#11111b] hover:brightness-105'
      : 'bg-gradient-to-br from-[#313244] to-[#45475a] text-[#cdd6f4] hover:brightness-105',
    isFirst && (sent ? 'rounded-t-2xl rounded-l-2xl' : 'rounded-t-2xl rounded-r-2xl'),
    isLast && (sent ? 'rounded-b-2xl rounded-l-2xl' : 'rounded-b-2xl rounded-r-2xl'),
    isFirst && isLast && 'rounded-2xl',
    !isFirst && !isLast && (sent ? 'rounded-l-2xl' : 'rounded-r-2xl'),
    'shadow-lg hover:shadow-xl transition-all duration-300 ease-out'
  ]
}
</script>

<template>
  <div :class="[getMessageBubbleClasses(sent, isFirst, isLast), 'w-fit backdrop-blur-sm']">
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
        <a v-if="getWallet(message.content)" :href="`https://mempool.space/address/${getWallet(message.content)}`"
          target="_blank" rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 h-8 rounded-full bg-gradient-to-r from-[#313244]/90 to-[#45475a]/90 hover:brightness-110 active:brightness-90 transition-all duration-200 text-xs font-medium select-none text-[#f9e2af] shadow-lg hover:shadow-xl backdrop-blur-sm min-w-[130px] border border-[#45475a]/30">
          <ExternalLink class="h-3.5 w-3.5 shrink-0" />
          <span class="truncate">mempool.space</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.select-text {
  user-select: text;
  -webkit-user-select: text;
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
</style> 