import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '@/assets/index.css'

// Create app and pinia instances
const app = createApp(App)
const pinia = createPinia()

// Install pinia before any store usage
app.use(pinia)

// Mount the app
app.mount('#app')