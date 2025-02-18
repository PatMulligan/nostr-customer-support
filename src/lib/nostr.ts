import type { NostrEvent, NostrRelayConfig } from '../types/nostr'
import { useNostrStore } from '../stores/nostr'

declare global {
  interface Window {
    NostrTools: any
  }
}

export async function connectToRelay(url: string, options = {}) {
  const relay = window.NostrTools.relayInit(url, options)
  try {
    await relay.connect()
    return relay
  } catch (err) {
    console.error(`Failed to connect to ${url}:`, err)
    return null
  }
}

export async function publishEvent(event: NostrEvent, relays: NostrRelayConfig[]) {
  const connectedRelays = await Promise.all(
    relays.map(relay => connectToRelay(relay.url))
  )
  
  const activeRelays = connectedRelays.filter(relay => relay !== null)
  
  return Promise.all(
    activeRelays.map(relay => 
      new Promise((resolve) => {
        const pub = relay.publish(event)
        pub.on('ok', () => {
          resolve(true)
        })
        pub.on('failed', () => {
          resolve(false)
        })
      })
    )
  )
}

export async function encryptMessage(privkey: string, pubkey: string, content: string): Promise<string> {
  return await window.NostrTools.nip04.encrypt(privkey, pubkey, content)
}

export async function decryptMessage(privkey: string, pubkey: string, content: string): Promise<string> {
  return await window.NostrTools.nip04.decrypt(privkey, pubkey, content)
}

export function generatePrivateKey(): string {
  return window.NostrTools.generatePrivateKey()
}

export function getPublicKey(privateKey: string): string {
  return window.NostrTools.getPublicKey(privateKey)
}

export function getEventHash(event: NostrEvent): string {
  return window.NostrTools.getEventHash(event)
}

export async function signEvent(event: NostrEvent, privateKey: string): Promise<string> {
  return window.NostrTools.getSignature(event, privateKey)
}

export function verifySignature(event: NostrEvent): boolean {
  return window.NostrTools.verifySignature(event)
}

function ensureNostrTools() {
  if (typeof window.NostrTools === 'undefined') {
    throw new Error('NostrTools is not loaded. Please check if nostr.bundle.js is properly loaded.')
  }
}

export function npubToHex(npub: string): string {
  ensureNostrTools()
  try {
    const { type, data } = window.NostrTools.nip19.decode(npub)
    if (type !== 'npub') throw new Error('Invalid npub')
    return data as string
  } catch (err) {
    console.error('Failed to decode npub:', err)
    throw err
  }
}

export function hexToNpub(hex: string): string {
  return window.NostrTools.nip19.npubEncode(hex)
} 