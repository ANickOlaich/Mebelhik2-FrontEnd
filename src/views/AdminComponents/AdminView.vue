<!-- AdminView.vue -->
<template>
  <div class="admin-layout">
    <!-- Левое меню -->
    <aside class="sidebar">
      <h2>Админ панель</h2>
      <nav>
        <a href="#" @click.prevent="setView('users')">Пользователи</a>
        <a href="#" @click.prevent="setView('suppliers')">Поставщики</a>
        <a href="#" @click.prevent="setView('posts')">Посты</a>
        <a href="#" @click.prevent="setView('settings')">Настройки</a>
      </nav>
    </aside>

    <!-- Основной контент -->
    <main class="content">
      <UsersView v-if="currentView === 'users'" />  
      <SuppliersView v-if="currentView === 'suppliers'" />
      <PostsView v-if="currentView === 'posts'" />
      <SettingsView v-if="currentView === 'settings'" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UsersView from './UsersView.vue'
import SuppliersView from './SuppliersView.vue'
//import PostsView from './PostsView.vue'
//import SettingsView from './SettingsView.vue'

const currentView = ref('users')


const setView = (view) => {
  currentView.value = view
}
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