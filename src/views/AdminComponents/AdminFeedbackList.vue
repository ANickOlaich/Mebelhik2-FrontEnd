<script setup>
import { ref, onMounted, watch } from 'vue'
import apiClient from '@/api/client.js' // поправь путь если нужно

// STATE
const feedbacks = ref([])
const loading = ref(false)

const pagination = ref({
  page: 1,
  totalPages: 1,
  total: 0
})

const filters = ref({
  status: '',
  type: '',
  search: ''
})

// EDIT
const editingId = ref(null)
const editForm = ref({
  message: '',
  status: '',
  type: ''
})

// FETCH
const fetchFeedbacks = async () => {
  loading.value = true

  try {
    const { data } = await apiClient.get('/feedback/all', {
      params: {
        page: pagination.value.page,
        limit: 10,
        ...filters.value
      }
    })

    feedbacks.value = data.data
    pagination.value.totalPages = data.pagination.totalPages
    pagination.value.total = data.pagination.total

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// WATCH filters
watch(filters, () => {
  pagination.value.page = 1
  fetchFeedbacks()
}, { deep: true })

// PAGINATION
const changePage = (p) => {
  pagination.value.page = p
  fetchFeedbacks()
}

// DELETE
const remove = async (id) => {
  if (!confirm('Удалить отзыв?')) return

  try {
    await apiClient.delete(`/feedback/${id}`)
    fetchFeedbacks()
  } catch (e) {
    console.error(e)
  }
}

// EDIT START
const startEdit = (item) => {
  editingId.value = item.id
  editForm.value = {
    message: item.message,
    status: item.status,
    type: item.type
  }
}

// SAVE EDIT
const saveEdit = async (id) => {
  try {
    await apiClient.put(`/feedback/${id}`, editForm.value)
    editingId.value = null
    fetchFeedbacks()
  } catch (e) {
    console.error(e)
  }
}

// CANCEL EDIT
const cancelEdit = () => {
  editingId.value = null
}

onMounted(fetchFeedbacks)
</script>

<template>
  <div class="feedback-admin">

    <h2>Отзывы</h2>

    <!-- FILTERS -->
    <div class="filters">
      <input
        v-model="filters.search"
        placeholder="Поиск..."
      />

      <select v-model="filters.status">
        <option value="">Все статусы</option>
        <option value="new">Новые</option>
        <option value="in_progress">В работе</option>
        <option value="done">Завершено</option>
      </select>

      <select v-model="filters.type">
        <option value="">Все типы</option>
        <option value="feedback">Отзыв</option>
        <option value="bug">Баг</option>
        <option value="feature">Предложение</option>
      </select>
    </div>

    <!-- LOADING -->
    <div v-if="loading">Загрузка...</div>

    <!-- TABLE -->
    <table v-else class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Пользователь</th>
          <th>Сообщение</th>
          <th>Страница</th>
          <th>Тип</th>
          <th>Статус</th>
          <th>Дата</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in feedbacks" :key="item.id">

          <td>{{ item.id }}</td>

          <td>{{ item.user?.username }}</td>

          <!-- MESSAGE -->
          <td>
            <textarea
              v-if="editingId === item.id"
              v-model="editForm.message"
            />
            <span v-else>{{ item.message }}</span>
          </td>

          <td>{{ item.page }}</td>

          <!-- TYPE -->
          <td>
            <select
              v-if="editingId === item.id"
              v-model="editForm.type"
            >
              <option value="feedback">feedback</option>
              <option value="bug">bug</option>
              <option value="feature">feature</option>
            </select>
            <span v-else>{{ item.type }}</span>
          </td>

          <!-- STATUS -->
          <td>
            <select
              v-if="editingId === item.id"
              v-model="editForm.status"
            >
              <option value="new">new</option>
              <option value="in_progress">in_progress</option>
              <option value="done">done</option>
            </select>
            <span v-else>{{ item.status }}</span>
          </td>

          <td>
            {{ new Date(item.createdAt).toLocaleString() }}
          </td>

          <!-- ACTIONS -->
          <td class="actions">
            <template v-if="editingId === item.id">
              <button @click="saveEdit(item.id)">💾</button>
              <button @click="cancelEdit">✖</button>
            </template>

            <template v-else>
              <button @click="startEdit(item)">✏️</button>
              <button @click="remove(item.id)">🗑</button>
            </template>
          </td>

        </tr>
      </tbody>
    </table>

    <!-- PAGINATION -->
    <div class="pagination">
      <button
        :disabled="pagination.page <= 1"
        @click="changePage(pagination.page - 1)"
      >
        Prev
      </button>

      <span>
        {{ pagination.page }} / {{ pagination.totalPages }}
      </span>

      <button
        :disabled="pagination.page >= pagination.totalPages"
        @click="changePage(pagination.page + 1)"
      >
        Next
      </button>
    </div>

  </div>
</template>

<style scoped>
.feedback-admin {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters {
  display: flex;
  gap: 10px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
}

textarea {
  width: 100%;
  min-height: 60px;
}

.actions {
  display: flex;
  gap: 6px;
}

.pagination {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>