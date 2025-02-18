import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { NostrEvent, NostrProfile, NostrAccount, DirectMessage } from '../types/nostr'
import { connectToRelay, publishEvent, encryptMessage, decryptMessage, getEventHash, signEvent, getPublicKey, npubToHex } from '../lib/nostr'

const DEFAULT_RELAYS = [
  'wss://nostr.atitlan.io'
]

// Get support agent's public key from environment variable
const SUPPORT_NPUB = import.meta.env.VITE_SUPPORT_NPUB

export const useNostrStore = defineStore('nostr', () => {
  // State
  const account = ref<NostrAccount | null>(JSON.parse(localStorage.getItem('nostr_account') || 'null'))
  const profiles = ref<Map<string, NostrProfile>>(new Map())
  const messages = ref<Map<string, DirectMessage[]>>(new Map())
  const activeChat = ref<string | null>(null)
  const relayPool = ref<any[]>([])
  const processedMessageIds = ref(new Set<string>())
  const isInitialized = ref(false)
  const supportPubkey = ref<string | null>(null)

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

  // Initialize function to check NostrTools availability
  async function waitForNostrTools(timeout = 5000): Promise<void> {
    const start = Date.now()
    
    while (Date.now() - start < timeout) {
      if (window.NostrTools) {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    throw new Error('NostrTools failed to load within timeout period')
  }

  // Modified init function
  async function init() {
    if (!isInitialized.value) {
      await waitForNostrTools()
      // Convert NPUB to hex after NostrTools is loaded
      supportPubkey.value = npubToHex(SUPPORT_NPUB)
      isInitialized.value = true
    }

    if (account.value) {
      // Clear existing state
      messages.value.clear()
      profiles.value.clear()
      processedMessageIds.value.clear()
      
      // Close existing connections
      relayPool.value.forEach(relay => relay.close())
      relayPool.value = []

      // Connect to relays
      const connectedRelays = await Promise.all(
        account.value.relays.map(relay => connectToRelay(relay.url))
      )
      
      relayPool.value = connectedRelays.filter(relay => relay !== null)

      // Subscribe to messages and load history
      await Promise.all([
        subscribeToMessages(),
        loadProfiles()
      ])

      // Set active chat to support agent's hex pubkey
      activeChat.value = supportPubkey.value
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

    // Initialize connection and load messages
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

    try {
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
    } catch (err) {
      console.error('Failed to send message:', err)
      throw err
    }
  }

  async function subscribeToMessages() {
    if (!account.value) return

    // Filter for received messages with history
    const receivedFilter = {
      kinds: [4],
      '#p': [account.value.pubkey],
      since: 0 // Get all historical messages
    }

    // Filter for sent messages with history
    const sentFilter = {
      kinds: [4],
      authors: [account.value.pubkey],
      '#p': [supportPubkey.value],
      since: 0 // Get all historical messages
    }

    const subscribeToRelay = (relay: any) => {
      return new Promise((resolve) => {
        let eoseCount = 0

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
              supportPubkey.value,
              event.content
            )

            const dm: DirectMessage = {
              id: event.id,
              pubkey: supportPubkey.value,
              content: decrypted,
              created_at: event.created_at,
              sent: true
            }

            await addMessage(supportPubkey.value, dm)
          } catch (err) {
            console.error('Failed to decrypt sent message:', err)
          }
        })

        // Listen for end of stored events
        receivedSub.on('eose', () => {
          eoseCount++
          if (eoseCount >= 2) { // Both subscriptions have finished loading history
            resolve(true) // Resolve but keep subscriptions active
          }
        })

        sentSub.on('eose', () => {
          eoseCount++
          if (eoseCount >= 2) { // Both subscriptions have finished loading history
            resolve(true) // Resolve but keep subscriptions active
          }
        })
      })
    }

    // Wait for all relays to load their historical messages
    await Promise.all(relayPool.value.map(relay => subscribeToRelay(relay)))
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
    loadProfiles,
    isInitialized,
    supportPubkey,
  }
}) 