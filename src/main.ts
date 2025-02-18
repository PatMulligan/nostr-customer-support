import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@/assets/index.css'

// Create a function to load NostrTools
function loadNostrTools(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/js/nostr.bundle.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load NostrTools'))
    document.body.appendChild(script)
  })
}

// Initialize app after NostrTools is loaded
async function initializeApp() {
  try {
    await loadNostrTools()
    
    const app = createApp(App)
    app.use(createPinia())
    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
}

initializeApp()