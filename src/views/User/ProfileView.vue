<template>
  <div class="profile-page">
    <div class="profile-card">
      <h1>Профиль пользователя</h1>
      
      <div class="profile-info">
        <div class="avatar">
          👤
        </div>
        <h2>{{ authStore.user?.username }}</h2>
        <p class="email">{{ authStore.user?.email }}</p>
        <p class="role">Роль: <span>{{ authStore.user?.role === 'admin' ? 'Администратор' : 'Пользователь' }}</span></p>
      </div>

      <div class="actions">
        <RouterLink v-if="authStore.user?.role === 'admin'" to="/admin" class="btn-admin">
          Перейти в админ-панель
        </RouterLink>
        
        <button @click="handleLogout" class="btn-logout">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.profile-card {
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.15);
  width: 100%;
  max-width: 420px;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #3f2a1e;
  font-weight: 700;
}

.profile-info {
  margin-bottom: 2rem;
}

.avatar {
  font-size: 4.5rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  margin: 0.5rem 0 0.25rem;
  color: #3f2a1e;
}

.email {
  color: #6b5e4e;
  margin-bottom: 0.5rem;
}

.role {
  color: #6b5e4e;
  font-size: 0.95rem;
}

.role span {
  font-weight: 600;
  color: #3498db;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-admin {
  padding: 14px 20px;
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-admin:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(39 174 96);
}

.btn-logout {
  padding: 14px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(231 76 60);
}
</style>