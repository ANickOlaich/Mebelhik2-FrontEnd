<template>
  <div class="notifications">
    <div
      v-for="n in notifications"
      :key="n.id"
      class="toast"
      :class="n.type"
    >
      <span>{{ n.message }}</span>
      <button @click="remove(n.id)">×</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'

const store = useNotificationsStore()

const notifications = computed(() => store.list)

const remove = (id) => {
  store.remove(id)
}
</script>

<style scoped>
.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.toast {
  padding: 10px 15px;
  border-radius: 6px;
  color: white;
  min-width: 250px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toast.success {
  background: #4caf50;
}

.toast.error {
  background: #f44336;
}

.toast.warning {
  background: #ff9800;
}

.toast.info {
  background: #2196f3;
}

button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
}
</style>