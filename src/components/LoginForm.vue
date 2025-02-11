<script setup lang="ts">
import { ref } from 'vue'
import { useNostrStore } from '@/stores/nostr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { generatePrivateKey } from '@/lib/nostr'
import { Key, KeyRound, ShieldCheck } from 'lucide-vue-next'

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
  <div class="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-[#1e1e2e] to-[#181825]">
    <Card class="w-full max-w-md animate-in slide-in-from-bottom duration-500 bg-[#181825] border-[#313244] shadow-2xl">
      <CardHeader class="space-y-6 pb-8">
        <div class="flex justify-center">
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
            <div class="relative h-16 w-16 rounded-full bg-gradient-to-br from-[#313244] to-[#45475a] flex items-center justify-center shadow-xl group-hover:shadow-2xl transition duration-300">
              <KeyRound class="h-8 w-8 text-[#cdd6f4] group-hover:scale-110 transition duration-300" />
            </div>
          </div>
        </div>
        <div class="text-center space-y-2.5">
          <CardTitle class="text-2xl font-bold bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] inline-block text-transparent bg-clip-text">
            Nostr Customer Support
          </CardTitle>
          <CardDescription class="text-[#a6adc8]">
            Login with your Nostr private key or generate a new one
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="login" class="space-y-6">
          <div class="space-y-4">
            <div class="relative group">
              <div class="absolute -inset-0.5 bg-gradient-to-r from-[#313244] to-[#45475a] rounded-xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
              <Input
                v-model="privateKey"
                type="password"
                placeholder="Enter your private key"
                class="relative font-mono text-sm bg-[#1e1e2e] border-[#313244] text-[#cdd6f4] placeholder:text-[#6c7086] focus:ring-2 focus:ring-[#cba6f7] focus:border-[#cba6f7] transition-all duration-300 shadow-lg hover:border-[#45475a] rounded-lg h-11"
              />
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <Button 
              type="submit" 
              class="w-full bg-gradient-to-r from-[#cba6f7] to-[#89b4fa] text-[#11111b] hover:brightness-110 active:brightness-90 transition-all duration-300 shadow-lg hover:shadow-xl h-11 rounded-lg font-medium"
              :disabled="!privateKey"
            >
              <Key class="h-4 w-4 mr-2" />
              Login Securely
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              @click="generateNewKey"
              class="w-full bg-gradient-to-r from-[#313244]/90 to-[#45475a]/90 hover:brightness-110 active:brightness-90 text-[#cdd6f4] border-[#45475a]/50 transition-all duration-300 shadow-lg hover:shadow-xl h-11 rounded-lg font-medium backdrop-blur-sm"
              :disabled="isGenerating"
            >
              <template v-if="isGenerating">
                <div class="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-[#cba6f7] border-r-transparent" />
                Generating...
              </template>
              <template v-else>
                <ShieldCheck class="h-4 w-4 mr-2" />
                Generate New Key
              </template>
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter class="text-center text-sm text-[#6c7086] pb-6">
        <p class="max-w-[280px] mx-auto">
          Make sure to save your private key in a secure location. You'll need it to access your chat history.
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.5s cubic-bezier(0.21, 1.02, 0.73, 1);
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

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