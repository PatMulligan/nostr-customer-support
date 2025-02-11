import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { NostrEvent, NostrProfile, NostrAccount, DirectMessage } from '../types/nostr'
import { connectToRelay, publishEvent, encryptMessage, decryptMessage, getEventHash, signEvent, getPublicKey, npubToHex } from '../lib/nostr'

const DEFAULT_RELAYS = [
  'wss://nostr.atitlan.io'
]

// Get support agent's public key from environment variable
const SUPPORT_NPUB = npubToHex(import.meta.env.VITE_SUPPORT_NPUB)

export const useNostrStore = defineStore('nostr', () => {
  // State
  const account = ref<NostrAccount | null>(JSON.parse(localStorage.getItem('nostr_account') || 'null'))
  const profiles = ref<Map<string, NostrProfile>>(new Map())
  const messages = ref<Map<string, DirectMessage[]>>(new Map())
  const activeChat = ref<string | null>(null)
  const relayPool = ref<any[]>([])
  const processedMessageIds = ref(new Set<string>())

  // Watch account changes and persist to localStorage
  watch(account, (newAccount) => {
    if (newAccount) {
      localStorage.setItem('nostr_account', JSON.stringify(newAccount))
    } else {
      localStorage.removeItem('nostr_account')
    }
  }, { deep: true })

  // Computed
  const isLoggedIn = computed(() => !!account.value)
  const currentMessages = computed(() => 
    activeChat.value ? messages.value.get(activeChat.value) || [] : []
  )

  // Initialize connection if account exists
  async function init() {
    if (account.value) {
      // Connect to relays
      const connectedRelays = await Promise.all(
        account.value.relays.map(relay => connectToRelay(relay.url))
      )
      
      relayPool.value = connectedRelays.filter(relay => relay !== null)

      // Subscribe to messages
      await subscribeToMessages()

      // Load profiles
      await loadProfiles()
    }
  }

  // Actions
  async function login(privkey: string) {
    const pubkey = getPublicKey(privkey)
    
    account.value = {
      pubkey,
      privkey,
      relays: DEFAULT_RELAYS.map(url => ({ url, read: true, write: true }))
    }

    await init()
  }

  async function loadProfiles() {
    if (!account.value) return

    const filter = {
      kinds: [0],
      authors: Array.from(messages.value.keys())
    }

    if (filter.authors.length === 0) return

    relayPool.value.forEach(relay => {
      const sub = relay.sub([filter])
      
      sub.on('event', (event: NostrEvent) => {
        try {
          const profile = JSON.parse(event.content)
          profiles.value.set(event.pubkey, {
            pubkey: event.pubkey,
            name: profile.name,
            picture: profile.picture,
            about: profile.about,
            nip05: profile.nip05
          })
        } catch (err) {
          console.error('Failed to parse profile:', err)
        }
      })
    })
  }

  async function logout() {
    account.value = null
    relayPool.value.forEach(relay => relay.close())
    relayPool.value = []
    messages.value.clear()
    profiles.value.clear()
    activeChat.value = null
  }

  async function addMessage(pubkey: string, message: DirectMessage) {
    // Skip if we've already processed this message
    if (processedMessageIds.value.has(message.id)) {
      return
    }

    // Add message ID to processed set
    processedMessageIds.value.add(message.id)

    // Add message to the map
    const userMessages = messages.value.get(pubkey) || []
    messages.value.set(pubkey, [...userMessages, message])
  }

  async function sendMessage(to: string, content: string) {
    if (!account.value) return

    const encrypted = await encryptMessage(account.value.privkey, to, content)
    const event: NostrEvent = {
      kind: 4,
      pubkey: account.value.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', to]],
      content: encrypted,
      id: '',
      sig: ''
    }

    event.id = getEventHash(event)
    event.sig = await signEvent(event, account.value.privkey)

    // Add to local messages first
    const dm: DirectMessage = {
      id: event.id,
      pubkey: to,
      content,
      created_at: event.created_at,
      sent: true
    }

    await addMessage(to, dm)

    // Then publish to relays
    await publishEvent(event, account.value.relays)
  }

  async function subscribeToMessages() {
    if (!account.value) return

    // Filter for received messages
    const receivedFilter = {
      kinds: [4],
      '#p': [account.value.pubkey]
    }

    // Filter for sent messages
    const sentFilter = {
      kinds: [4],
      authors: [account.value.pubkey],
      '#p': [SUPPORT_NPUB]
    }

    relayPool.value.forEach(relay => {
      // Subscribe to received messages
      const receivedSub = relay.sub([receivedFilter])
      
      receivedSub.on('event', async (event: NostrEvent) => {
        try {
          // Skip if we've already processed this message
          if (processedMessageIds.value.has(event.id)) {
            return
          }

          const decrypted = await decryptMessage(
            account.value!.privkey,
            event.pubkey,
            event.content
          )

          const dm: DirectMessage = {
            id: event.id,
            pubkey: event.pubkey,
            content: decrypted,
            created_at: event.created_at,
            sent: false
          }

          await addMessage(event.pubkey, dm)

          // Load profile if not already loaded
          if (!profiles.value.has(event.pubkey)) {
            await loadProfiles()
          }
        } catch (err) {
          console.error('Failed to decrypt received message:', err)
        }
      })

      // Subscribe to sent messages
      const sentSub = relay.sub([sentFilter])
      
      sentSub.on('event', async (event: NostrEvent) => {
        try {
          // Skip if we've already processed this message
          if (processedMessageIds.value.has(event.id)) {
            return
          }

          const decrypted = await decryptMessage(
            account.value!.privkey,
            SUPPORT_NPUB,
            event.content
          )

          const dm: DirectMessage = {
            id: event.id,
            pubkey: SUPPORT_NPUB,
            content: decrypted,
            created_at: event.created_at,
            sent: true
          }

          await addMessage(SUPPORT_NPUB, dm)
        } catch (err) {
          console.error('Failed to decrypt sent message:', err)
        }
      })
    })
  }

  return {
    // State
    account,
    profiles,
    messages,
    activeChat,
    // Computed
    isLoggedIn,
    currentMessages,
    // Actions
    init,
    login,
    logout,
    sendMessage,
    subscribeToMessages,
    loadProfiles
  }
}) 