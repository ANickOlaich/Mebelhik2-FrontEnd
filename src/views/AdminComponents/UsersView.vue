<template>
  <div class="users-management">
    <h1>Управление пользователями</h1>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Имя</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username || user.name }}</td>
          <td>{{ user.email }}</td>
          <td><span :class="`role-${user.role}`">{{ user.role }}</span></td>
          <td>
            <button @click="openEditModal(user)" class="btn-edit">Изменить</button>
            <button @click="deleteUser(user.id)" class="btn-delete">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Модальное окно редактирования -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>Редактировать пользователя</h2>
        
        <div class="form-group">
          <label>Имя:</label>
          <input v-model="editForm.name" type="text">
        </div>
        
        <div class="form-group">
          <label>Email:</label>
          <input v-model="editForm.email" type="email">
        </div>
        
        <div class="form-group">
          <label>Роль:</label>
          <select v-model="editForm.role">
            <option value="user">Пользователь</option>
            <option value="admin">Администратор</option>
          </select>
        </div>

        <div class="modal-buttons">
          <button @click="saveUser" class="btn-save">Сохранить</button>
          <button @click="closeModal" class="btn-cancel">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client.js'

const users = ref([])
const loading = ref(true)
const error = ref(null)

const showModal = ref(false)
const currentUserId = ref(null)
const editForm = ref({
  name: '',
  email: '',
  role: 'user'
})

const fetchUsers = async () => {
  try {
    const res = await apiClient.get('/admin/users')
    users.value = res.data
  } catch (err) {
    error.value = 'Ошибка загрузки'
  } finally {
    loading.value = false
  }
}

const openEditModal = (user) => {
  currentUserId.value = user.id
  editForm.value = {
    name: user.username || user.name || '',
    email: user.email,
    role: user.role
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveUser = async () => {
  try {
    await apiClient.put(`/admin/users/${currentUserId.value}`, editForm.value)
    await fetchUsers()        // обновляем список
    closeModal()
  } catch (err) {
    alert('Ошибка при сохранении')
  }
}

const deleteUser = async (id) => {
  if (!confirm('Удалить пользователя?')) return
  try {
    await apiClient.delete(`/admin/users/${id}`)
    users.value = users.value.filter(u => u.id !== id)
  } catch (e) {
    alert('Ошибка удаления')
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
/* Таблица (оставь свои стили) */
.users-table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.users-table th, .users-table td { padding: 14px; text-align: left; border-bottom: 1px solid #eee; }
.users-table th { background: #34495e; color: white; }
.role-admin { color: #e74c3c; font-weight: bold; }
.role-user { color: #27ae60; }
.btn-edit, .btn-delete { padding: 6px 12px; margin-right: 8px; border: none; border-radius: 4px; cursor: pointer; }
.btn-edit { background: #3498db; color: white; }
.btn-delete { background: #e74c3c; color: white; }

/* Модальное окно */
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
}
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; }
.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
.btn-save { background: #27ae60; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: #95a5a6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
</style>