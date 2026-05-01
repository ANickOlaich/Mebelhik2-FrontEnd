<template>
  <div class="admin-layout">

    <aside class="sidebar">
      <h2>Админ панель</h2>

      <nav>
        <RouterLink to="/admin/statistic">Статистика</RouterLink>
        <RouterLink to="/admin/users">Пользователи</RouterLink>
        <RouterLink to="/admin/suppliers">Поставщики</RouterLink>
        <RouterLink to="/admin/materials">Материалы</RouterLink>
        <RouterLink to="/admin/categories">Категории публикаций</RouterLink>
        <RouterLink to="/admin/posts">Публикации</RouterLink>
        <RouterLink to="/admin/feedback">Отзывы</RouterLink>
      </nav>
    </aside>

    <main class="content">
      <RouterView />
    </main>

  </div>
</template>

<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<style scoped>
/* Стили остаются те же */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  padding: 20px;
}

.sidebar h2 {
  margin-bottom: 30px;
}

.sidebar nav a {
  display: block;
  padding: 12px 16px;
  color: white;
  text-decoration: none;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
}

.sidebar nav a:hover,
.sidebar nav a.active {
  background: #34495e;
}

.content {
  flex: 1;
  padding: 24px;
  background: #f8f9fa;
}
</style>