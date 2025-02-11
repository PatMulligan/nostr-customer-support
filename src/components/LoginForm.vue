<script setup lang="ts">
import { ref } from 'vue'
import { useNostrStore } from '@/stores/nostr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { generatePrivateKey } from '@/lib/nostr'
import { Key, KeyRound } from 'lucide-vue-next'

const nostrStore = useNostrStore()
const privateKey = ref('')
const isGenerating = ref(false)

const generateNewKey = async () => {
  isGenerating.value = true
  try {
    privateKey.value = generatePrivateKey()
  } finally {
    isGenerating.value = false
  }
}

const login = async () => {
  if (!privateKey.value) return
  await nostrStore.login(privateKey.value)
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <Card class="w-full max-w-md animate-in slide-in-from-bottom duration-500">
      <CardHeader class="space-y-4">
        <div class="flex justify-center">
          <div class="h-12 w-12 rounded-full bg-dark-mauve dark:bg-dark-mauve flex items-center justify-center">
            <KeyRound class="h-6 w-6 text-light-base dark:text-dark-base" />
          </div>
        </div>
        <div class="text-center space-y-2">
          <CardTitle class="text-2xl font-bold">Nostr Customer Support</CardTitle>
          <CardDescription class="text-light-subtext0 dark:text-dark-subtext0">
            Login with your Nostr private key or generate a new one
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="login" class="space-y-4">
          <div class="space-y-2">
            <Input
              v-model="privateKey"
              type="password"
              placeholder="Enter your private key"
              class="font-mono text-sm"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Button 
              type="submit" 
              class="w-full bg-dark-mauve hover:bg-dark-mauve/90 text-light-base dark:text-dark-base transition-colors"
              :disabled="!privateKey"
            >
              <Key class="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              @click="generateNewKey"
              class="w-full"
              :disabled="isGenerating"
            >
              <template v-if="isGenerating">
                <div class="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-dark-mauve border-r-transparent" />
                Generating...
              </template>
              <template v-else>
                Generate New Key
              </template>
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter class="text-center text-sm text-light-subtext0 dark:text-dark-subtext0">
        Make sure to save your private key in a secure location
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.5s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 