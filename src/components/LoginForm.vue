<script setup lang="ts">
import { ref } from 'vue'
import { useNostrStore } from '@/stores/nostr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { generatePrivateKey } from '@/lib/nostr'

const nostrStore = useNostrStore()
const privateKey = ref('')

const generateNewKey = () => {
  privateKey.value = generatePrivateKey()
}

const login = async () => {
  if (!privateKey.value) return
  await nostrStore.login(privateKey.value)
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Nostr Customer Support</CardTitle>
        <CardDescription>
          Login with your Nostr private key or generate a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="login" class="space-y-4">
          <div class="space-y-2">
            <Input
              v-model="privateKey"
              type="password"
              placeholder="Enter your private key"
            />
          </div>
          <div class="flex space-x-2">
            <Button type="submit" class="flex-1">Login</Button>
            <Button type="button" variant="outline" @click="generateNewKey">
              Generate Key
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template> 