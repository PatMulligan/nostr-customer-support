import type { NostrEvent, DirectMessage } from '../types/nostr'
import { nostrService } from './NostrService'

export class MessageService {
  async createEncryptedEvent(
    content: string,
    fromPrivkey: string,
    toPubkey: string,
    relays: string[]
  ): Promise<NostrEvent> {
    const encrypted = await nostrService.encryptMessage(fromPrivkey, toPubkey, content)
    const pubkey = nostrService.getPublicKey(fromPrivkey)
    
    const event: NostrEvent = {
      kind: 4,
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', toPubkey]],
      content: encrypted,
      id: '',
      sig: ''
    }

    event.id = nostrService.getEventHash(event)
    event.sig = await nostrService.signEvent(event, fromPrivkey)
    
    return event
  }

  async decryptEvent(event: NostrEvent, privkey: string): Promise<DirectMessage> {
    const decrypted = await nostrService.decryptMessage(
      privkey,
      event.pubkey,
      event.content
    )

    return {
      id: event.id,
      pubkey: event.pubkey,
      content: decrypted,
      created_at: event.created_at,
      sent: false
    }
  }
}

export const messageService = new MessageService() 