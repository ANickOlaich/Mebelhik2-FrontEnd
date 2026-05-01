<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client.js'
import { useNotificationsStore } from '@/stores/notifications'
const notifications = useNotificationsStore()

const isOpen = ref(false)
const message = ref('')
const loading = ref(false)

const route = useRoute()
const authStore = useAuthStore()

const open = () => {
  if (!authStore.user) {
        notifications.push({
            type: 'error',
            message: 'Для отправки відгуков, треба зайти на сайт'
        })
    return
  }
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  message.value = ''
}

const submit = async () => {
  if (!message.value.trim()) return

  loading.value = true

  try {
    await apiClient.post('/feedback', {
      message: message.value,
      page: route.fullPath
    })

    close()
    notifications.push({
            type: 'success',
            message: 'Дякуемо за Ваш відгук'
        })

  } catch (e) {
    console.error(e)
    notifications.push({
            type: 'error',
            message: 'Помилка відправки'
        })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- FLOAT BUTTON -->
  <button class="feedback-btn" @click="open">
    💬
  </button>

  <!-- MODAL -->
  <div v-if="isOpen" class="modal">
    <div class="modal-box">

      <h3>Відгук/пропозиція</h3>

      <textarea
        v-model="message"
        placeholder="Напишіть ваш відгук..."
      />

      <div class="actions">
        <button @click="close">Відміна</button>
        <button :disabled="loading" @click="submit">
          {{ loading ? 'Відправка...' : 'Відправити' }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.feedback-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #3498db;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

textarea {
  min-height: 120px;
  resize: none;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>