<script setup lang="ts">
import { ref } from 'vue'
import { useNostrStore } from '@/stores/nostr'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogOut, Copy, AlertTriangle, Check } from 'lucide-vue-next'

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
        class="hover:bg-light-surface0 dark:hover:bg-dark-surface0"
      >
        <LogOut class="h-5 w-5" />
        <span class="sr-only">Logout</span>
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md bg-[#1e1e2e] border-[#313244] text-[#cdd6f4]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-[#f38ba8]">
          <AlertTriangle class="h-5 w-5" />
          Warning: Backup Required
        </DialogTitle>
        <DialogDescription class="text-[#cdd6f4]">
          If you haven't saved your private key, you will permanently lose access to this chat history. Make sure to copy and securely store your private key before logging out.
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col gap-4 py-4">
        <Button
          class="flex justify-center items-center gap-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4]"
          @click="copyPrivateKey"
        >
          <Copy class="h-4 w-4" />
          Copy Private Key
        </Button>
      </div>
      <DialogFooter class="flex gap-2 sm:gap-0">
        <Button
          variant="ghost"
          @click="() => isOpen = false"
          class="hover:bg-[#313244] text-[#cdd6f4]"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          @click="handleLogout"
          class="bg-[#f38ba8] hover:bg-[#f38ba8]/90 text-[#1e1e2e]"
        >
          Logout
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template> 