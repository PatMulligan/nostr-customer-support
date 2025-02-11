export interface NostrEvent {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

export interface NostrProfile {
  pubkey: string
  name?: string
  picture?: string
  about?: string
  nip05?: string
}

export interface DirectMessage {
  id: string
  pubkey: string
  content: string
  created_at: number
  sent: boolean
  avatar?: string
  isJson?: boolean
  message?: any
}

export interface NostrRelayConfig {
  url: string
  read?: boolean
  write?: boolean
}

export interface NostrAccount {
  pubkey: string
  privkey: string
  relays: NostrRelayConfig[]
} 