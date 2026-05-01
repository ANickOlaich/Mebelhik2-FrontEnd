import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createHead } from '@unhead/vue/client'
import apiClient from '@/api/client.js'


import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const head = createHead()


app.use(pinia)
app.use(router)
app.use(head)

app.mount('#app')

// Статистика посещения
const trackVisit = async () => {
  try {
    await apiClient.post('/visit', {           // ← исправлено!
      path: window.location.pathname,
      referrer: document.referrer || null
    });
  } catch (e) {
    // Можно оставить пустым, чтобы не спамило в консоль в продакшене
    console.warn('Failed to track visit:', e);
  }
};
//trackVisit()