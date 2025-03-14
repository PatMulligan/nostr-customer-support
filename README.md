# Nostr Customer Support

A decentralized customer support chat application built with Vue 3, TypeScript, and Nostr protocol. This application enables direct, encrypted communication between users and support staff through the Nostr network.

## Features

- Secure, encrypted messaging using Nostr protocol
- Real-time chat interface
- Message history persistence
- Support for multiple relay connections
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- NPM (v7 or higher)
- A Nostr public key for the support agent

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PatMulligan/nostr-customer-support.git
cd nostr-customer-support
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your support agent's public key:
```
VITE_SUPPORT_NPUB=<your-support-npub>
```

## Development

To run the development server:
```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

## Building for Production

To create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Usage

1. Users can log in with their Nostr private key or generate a new one
2. Messages are automatically encrypted end-to-end
3. Chat history is preserved and loaded from connected relays
4. Support staff can monitor and respond to messages using their Nostr client

> ⚠️ **Security Warning**: When logging in with a Nostr private key, please use only throwaway keys or keys you are comfortable potentially being exposed. Web browsers can be vulnerable to various security risks, so it's best practice to never input valuable private keys into web applications. Consider generating a new key specifically for customer support interactions.

## Technology Stack

- Vue 3 with Composition API
- TypeScript
- Vite
- Pinia for state management
- TailwindCSS v4 for styling
- shadcn-vue for UI components
- Nostr Protocol

## Security

- All messages are end-to-end encrypted using NIP-04
- Private keys never leave the user's browser
- No central server or database
- All communication happens through Nostr relays

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Environment Variables

The following environment variables are required:

- `VITE_SUPPORT_NPUB`: The npub of the support agent
- `VITE_DEFAULT_RELAYS`: JSON array of default relay URLs

Example configuration (.env.example):
```env
VITE_SUPPORT_NPUB=
VITE_DEFAULT_RELAYS=["wss://relay.damus.io","wss://nos.lol","wss://relay.nostr.band"]
```

Copy `.env.example` to `.env` and fill in the values.
