<template>
  <div class="home-layout">

    <!-- LEFT SIDEBAR -->
    <aside class="sidebar">

      <div class="block">
        <h3>Категории</h3>

        <select v-model="selectedCategory" @change="onCategoryChange">
          <option :value="null">Все категории</option>

          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="block">
        <h3>Фильтры</h3>

        <label>
          <input type="checkbox" v-model="onlyFeatured" @change="fetch" />
          Только избранные
        </label>
      </div>

    </aside>

    <!-- RIGHT CONTENT -->
    <main class="content">
      <PostsList />
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PostsList from '@/components/HomePage/PostsList.vue'
import { useCategoriesStore } from '@/stores/useCategoriesStore'
import { usePostsStore } from '@/stores/posts'

const categoriesStore = useCategoriesStore()
const postsStore = usePostsStore()

const categories = ref([])
const selectedCategory = ref(null)
const onlyFeatured = ref(false)

onMounted(async () => {
  categories.value = await categoriesStore.fetch()
  postsStore.fetchPosts()
})

const onCategoryChange = () => {
  postsStore.setCategory(selectedCategory.value)
}

const fetch = () => {
  postsStore.filters.isFeatured = onlyFeatured.value
  postsStore.fetchPosts()
}
</script>

<style scoped>


.home-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 20px;

  width: 100%;
  max-width: 1200px;

  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* LEFT */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block {
  background: #fff;
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 8px;
}

/* RIGHT */
.content {
  min-height: 400px;
}

@media (max-width: 900px) {
  .home-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}

@media (max-width: 600px) {
  .sidebar {
    grid-template-columns: 1fr;
  }
}
</style>