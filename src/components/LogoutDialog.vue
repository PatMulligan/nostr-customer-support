<script setup lang="ts">
import { ref } from 'vue'
import { useNostrStore } from '@/stores/nostr'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogOut, Copy, AlertTriangle, Check, ShieldAlert } from 'lucide-vue-next'

const props = defineProps<{
  onLogout: () => void
}>()

const nostrStore = useNostrStore()
const { toast } = useToast()
const isOpen = ref(false)

const copyPrivateKey = async () => {
  if (!nostrStore.account?.privkey) return
  
  try {
    await navigator.clipboard.writeText(nostrStore.account.privkey)
    toast({
      title: 'Private key copied',
      description: 'Store it in a secure location',
      duration: 3000,
      class: 'group border-[#45475a] bg-[#1e1e2e] text-[#cdd6f4]',
      icon: Check,
      iconClass: 'text-[#a6e3a1]',
      titleClass: 'text-[#a6e3a1]',
    })
  } catch (err) {
    console.error('Failed to copy private key:', err)
    toast({
      title: 'Failed to copy',
      description: 'Please try again',
      variant: 'destructive',
      duration: 3000,
      class: 'group border-red-900/50 bg-red-950 text-red-50',
      icon: AlertTriangle,
    })
  }
}

const handleLogout = () => {
  isOpen.value = false
  props.onLogout()
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button 
        variant="ghost" 
        size="icon"
        class="relative group"
      >
        <div class="absolute -inset-1 bg-gradient-to-r from-[#f38ba8] to-[#fab387] rounded-full opacity-0 group-hover:opacity-75 blur transition duration-300"></div>
        <div class="relative h-9 w-9 rounded-full bg-gradient-to-br from-[#313244] to-[#45475a] flex items-center justify-center shadow-lg group-hover:shadow-xl transition duration-300">
          <LogOut class="h-4 w-4 text-[#cdd6f4] group-hover:scale-110 transition duration-300" />
        </div>
        <span class="sr-only">Logout</span>
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md bg-[#1e1e2e] border-[#313244] text-[#cdd6f4] shadow-2xl">
      <DialogHeader class="space-y-4">
        <div class="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-[#f38ba8] to-[#fab387] p-0.5 shadow-lg">
          <div class="w-full h-full rounded-full bg-[#1e1e2e] flex items-center justify-center">
            <ShieldAlert class="h-6 w-6 text-[#f38ba8]" />
          </div>
        </div>
        <div class="text-center space-y-2">
          <DialogTitle class="text-xl font-semibold text-[#f38ba8]">
            Backup Required
          </DialogTitle>
          <DialogDescription class="text-[#a6adc8]">
            If you haven't saved your private key, you will permanently lose access to this chat history. Make sure to copy and securely store your private key before logging out.
          </DialogDescription>
        </div>
      </DialogHeader>
      <div class="flex flex-col gap-4 py-6">
        <div class="relative group">
          <div class="absolute -inset-0.5 bg-gradient-to-r from-[#313244] to-[#45475a] rounded-xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
          <Button
            class="relative w-full bg-gradient-to-r from-[#313244]/90 to-[#45475a]/90 hover:brightness-110 active:brightness-90 text-[#cdd6f4] transition-all duration-300 shadow-lg hover:shadow-xl h-11 rounded-lg font-medium backdrop-blur-sm border border-[#45475a]/50"
            @click="copyPrivateKey"
          >
            <Copy class="h-4 w-4 mr-2" />
            Copy Private Key
          </Button>
        </div>
      </div>
      <DialogFooter class="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          variant="ghost"
          @click="() => isOpen = false"
          class="flex-1 sm:flex-none bg-gradient-to-r from-[#313244]/90 to-[#45475a]/90 hover:brightness-110 active:brightness-90 text-[#cdd6f4] transition-all duration-300 shadow-lg hover:shadow-xl h-11 rounded-lg font-medium backdrop-blur-sm border border-[#45475a]/50"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          @click="handleLogout"
          class="flex-1 sm:flex-none bg-gradient-to-r from-[#f38ba8] to-[#fab387] hover:brightness-110 active:brightness-90 text-[#11111b] transition-all duration-300 shadow-lg hover:shadow-xl h-11 rounded-lg font-medium"
        >
          <LogOut class="h-4 w-4 mr-2" />
          Logout
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Improved focus styles */
:focus-visible {
  outline: 2px solid #cba6f7;
  outline-offset: 2px;
  transition: outline-offset 0.2s ease;
}

/* Enhanced button hover states */
button:not(:disabled):hover {
  transform: translateY(-1px) scale(1.01);
}

button:not(:disabled):active {
  transform: translateY(0) scale(0.99);
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Glass morphism effects */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style> 