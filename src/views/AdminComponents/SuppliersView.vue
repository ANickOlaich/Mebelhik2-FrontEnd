<template>
  <div class="suppliers-management">
    <h1>Поставщики</h1>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else class="suppliers-table">
      <thead>
        <tr>
          <th>Код</th>
          <th>Логотип</th>
          <th>Название</th>
          <th>Сайт</th>
          <th>Печать</th>
          <th>Сортировка</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="supplier in suppliers" :key="supplier.key">
          <td>{{ supplier.key }}</td>
          <td>
            <img v-if="supplier.logo" :src="supplier.logo" class="logo" alt="logo">
            <span v-else class="no-logo">—</span>
          </td>
          <td>{{ supplier.name }}</td>
          <td>
            <a :href="supplier.site" target="_blank" class="site-link">{{ supplier.site }}</a>
          </td>
          <td>
            <span :class="{ 'yes': supplier.isPrintable, 'no': !supplier.isPrintable }">
              {{ supplier.isPrintable ? 'Да' : 'Нет' }}
            </span>
          </td>
          <td>{{ supplier.sortOrder }}</td>
          <td>
            <button @click="editSupplier(supplier)" class="btn-edit">Изменить</button>
            <button @click="deleteSupplier(supplier.id)" class="btn-delete">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Модальное окно (пока заглушка) -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>Редактировать поставщика</h2>
        <p>Модальное окно будет добавлено позже</p>
        <button @click="closeModal" class="btn-cancel">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client.js'

const suppliers = ref([])
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)

const fetchSuppliers = async () => {
  try {
    const res = await apiClient.get('/admin/suppliers/all')
    suppliers.value = res.data
  } catch (err) {
    error.value = 'Ошибка загрузки поставщиков'
  } finally {
    loading.value = false
  }
}

const editSupplier = (supplier) => {
  showModal.value = true
  // позже добавим форму редактирования
}

const deleteSupplier = async (id) => {
  if (!confirm('Удалить поставщика?')) return
  try {
    await apiClient.delete(`/admin/suppliers/${id}`)
    suppliers.value = suppliers.value.filter(s => s.id !== id)
  } catch (e) {
    alert('Ошибка удаления')
  }
}

const closeModal = () => {
  showModal.value = false
}

onMounted(fetchSuppliers)
</script>

<style scoped>
.suppliers-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.suppliers-table th,
.suppliers-table td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.suppliers-table th {
  background: #34495e;
  color: white;
}

.logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 4px;
}

.no-logo {
  color: #999;
}

.site-link {
  color: #3498db;
  text-decoration: none;
}

.site-link:hover {
  text-decoration: underline;
}

.yes { color: #27ae60; font-weight: bold; }
.no { color: #e74c3c; }

.btn-edit, .btn-delete {
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit { background: #3498db; color: white; }
.btn-delete { background: #e74c3c; color: white; }

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
  text-align: center;
}
</style>