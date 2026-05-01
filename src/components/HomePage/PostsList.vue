<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePostsStore } from '@/stores/posts'
import { useCategoriesStore } from '@/stores/useCategoriesStore'

const postsStore = usePostsStore()
const categoriesStore = useCategoriesStore()

const { posts, loading, pagination, totalPages, filters } = storeToRefs(postsStore)

const fetch = () => postsStore.fetchPosts()

onMounted(async () => {
  await categoriesStore.fetch()
  fetch()

})

const changePage = (page) => {
  postsStore.setPage(page)
}

const changeCategory = (e) => {
  const value = e.target.value
  postsStore.setCategory(value === 'null' ? null : Number(value))
}
</script>

<template>
  <div class="page">

    <h1>Посты</h1>

    <!-- FILTER -->
    <div class="filters">
      <select @change="changeCategory">
        <option value="null">Все категории</option>

        <option
          v-for="cat in categoriesStore.categories"
          :key="cat.id"
          :value="cat.id"
        >
          {{ cat.name }}
        </option>
      </select>
    </div>

    <!-- LOADING -->
    <div v-if="loading">Загрузка...</div>

    <!-- POSTS -->
    <div class="grid">
      <div
        v-for="post in posts"
        :key="post.id"
        class="card"
      >
        <img v-if="post.previewImage" :src="post.previewImage" />

        <h3>{{ post.title }}</h3>
        <p>{{ post.preview }}</p>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="pagination">
      <button
        :disabled="pagination.page <= 1"
        @click="changePage(pagination.page - 1)"
      >
        Prev
      </button>

      <span>
        {{ pagination.page }} / {{ totalPages }}
      </span>

      <button
        :disabled="pagination.page >= totalPages"
        @click="changePage(pagination.page + 1)"
      >
        Next
      </button>
    </div>

  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.card img {
  max-width: 100%;
  height: auto;
  display: block;
}

.card {
  overflow: hidden;
  word-break: break-word;
}

.pagination {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  align-items: center;
}
</style>