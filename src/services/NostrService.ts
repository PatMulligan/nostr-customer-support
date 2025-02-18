import type { NostrEvent, NostrRelayConfig } from '../types/nostr'

export class NostrService {
  private static instance: NostrService
  private tools: any

  private constructor() {}

  static getInstance(): NostrService {
    if (!NostrService.instance) {
      NostrService.instance = new NostrService()
    }
    return NostrService.instance
  }

  async init(timeout = 5000): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (window.NostrTools) {
        this.tools = window.NostrTools
        return
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    throw new Error('NostrTools failed to load within timeout period')
  }

  async connectToRelay(url: string, options = {}): Promise<any> {
    const relay = this.tools.relayInit(url, options)
    try {
      await relay.connect()
      return relay
    } catch (err) {
      console.error(`Failed to connect to ${url}:`, err)
      return null
    }
  }

  // Cryptography methods
  async encryptMessage(privkey: string, pubkey: string, content: string): Promise<string> {
    return await this.tools.nip04.encrypt(privkey, pubkey, content)
  }

  async decryptMessage(privkey: string, pubkey: string, content: string): Promise<string> {
    return await this.tools.nip04.decrypt(privkey, pubkey, content)
  }

  // Key management
  generatePrivateKey(): string {
    return this.tools.generatePrivateKey()
  }

  getPublicKey(privateKey: string): string {
    return this.tools.getPublicKey(privateKey)
  }

  // Event handling
  getEventHash(event: NostrEvent): string {
    return this.tools.getEventHash(event)
  }

  async signEvent(event: NostrEvent, privateKey: string): Promise<string> {
    return this.tools.getSignature(event, privateKey)
  }

  verifySignature(event: NostrEvent): boolean {
    return this.tools.verifySignature(event)
  }

  // NIP-19 methods
  npubToHex(npub: string): string {
    try {
      const { type, data } = this.tools.nip19.decode(npub)
      if (type !== 'npub') throw new Error('Invalid npub')
      return data as string
    } catch (err) {
      console.error('Failed to decode npub:', err)
      throw err
    }
  }

  hexToNpub(hex: string): string {
    return this.tools.nip19.npubEncode(hex)
  }
}

export const nostrService = NostrService.getInstance() 