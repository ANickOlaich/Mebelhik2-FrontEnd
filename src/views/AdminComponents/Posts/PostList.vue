<template>
  <div class="post-list">

    <!-- HEADER -->
    <div class="toolbar">
      <input
        v-model="search"
        @input="load"
        placeholder="Поиск по названию..."
      />

      <button class="btn-add" @click="$router.push('/admin/posts/new')">
        + Новая публикация
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="store.loading" class="loading">
      Загрузка...
    </div>

    <!-- TABLE -->
    <table v-else class="table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Категория</th>
          <th>Статус</th>
          <th>Просмотры</th>
          <th>Дата</th>
          <th style="width: 160px;">Действия</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="post in store.items" :key="post.id">

          <!-- TITLE -->
          <td>
            <div class="title">
              {{ post.title }}
            </div>
          </td>

          <!-- CATEGORY -->
          <td>
            {{ post.category?.name || '—' }}
          </td>

          <!-- STATUS -->
          <td>
            <span
              class="badge"
              :class="post.isPublished ? 'published' : 'draft'"
            >
              {{ post.isPublished ? 'Опубликовано' : 'Черновик' }}
            </span>

            <span v-if="post.isFeatured" class="badge featured">
              featured
            </span>
          </td>

          <!-- VIEWS -->
          <td>
            {{ post.viewsCount }}
          </td>

          <!-- DATE -->
          <td>
            {{ formatDate(post.createdAt) }}
          </td>

          <!-- ACTIONS -->
          <td class="actions">
            <button @click="edit(post)">Редактировать</button>
            <button class="danger" @click="remove(post.id)">
              Удалить
            </button>
          </td>

        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useRouter } from 'vue-router'

const store = usePostsStore()
const router = useRouter()

const search = ref('')

const load = async () => {
  await store.fetch({
    search: search.value
  })
}

const edit = (post) => {
  router.push(`/admin/posts/${post.slug}`)
}

const remove = async (id) => {
  if (!confirm('Удалить публикацию?')) return
  await store.remove(id)
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString()
}

onMounted(load)
</script>

<style scoped>
.post-list {
  padding: 20px;
  font-family: Arial, sans-serif;
  background: #f6f7fb;
  min-height: 100vh;
}

/* toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 10px;
}

.toolbar input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

/* button */
.btn-add {
  background: #2d6cdf;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-add:hover {
  background: #1f57b8;
}

/* table */
.table {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  border-collapse: collapse;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.table th,
.table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.table tr:hover {
  background: #f8f9ff;
}

/* badges */
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  margin-right: 5px;
}

.published {
  background: #d1fae5;
  color: #065f46;
}

.draft {
  background: #fee2e2;
  color: #991b1b;
}

.featured {
  background: #e0e7ff;
  color: #3730a3;
}

/* actions */
.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #e5e7eb;
}

.actions button:hover {
  background: #d1d5db;
}

.actions .danger {
  background: #fee2e2;
  color: #991b1b;
}

.actions .danger:hover {
  background: #fecaca;
}

/* loading */
.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>