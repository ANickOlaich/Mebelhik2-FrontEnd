<template>
  <div class="app">
    <header class="header">
      <div class="header-inner">
        <h1 class="logo">MebelShik</h1>
        <nav class="nav">
          <RouterLink to="/">Головна</RouterLink>
          
          <div class="dropdown">
            <span class="dropbtn">Конструктори</span>
            <div class="dropdown-content">
              <RouterLink to="/editor">Матеріали та фурнітура</RouterLink>
            </div>
          </div>
                   
          <RouterLink v-if="!authStore.user" to="/login" class="auth-link">Войти</RouterLink>
          <RouterLink v-else to="/profile" class="auth-link">{{ authStore.user.username }}</RouterLink>
        </nav>
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <p>&copy; 2026 MebelShik. Все права защищены.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

</script>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.header {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
}

.nav {
  display: flex;
  gap: 25px;
  align-items: center;
}

.nav a,
.dropbtn {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
  white-space: nowrap;
  cursor: pointer;
}

.nav a:hover,
.nav a.router-link-active,
.dropbtn:hover {
  background: rgba(255,255,255,0.2);
}

/* Dropdown */
.dropdown {
  position: relative;
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: #2c3e50;
  min-width: 220px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  border-radius: 6px;
  z-index: 1;
  padding: 8px 0;
}

.dropdown-content a {
  display: block;
  padding: 10px 20px;
  color: white;
  border-radius: 0;
}

.dropdown-content a:hover {
  background: #3498db;
}

.dropdown:hover .dropdown-content {
  display: block;
}

/* Адаптив */
@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    gap: 12px;
  }
  .nav {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  .dropdown-content {
    position: static;
    box-shadow: none;
    background: #34495e;
  }
}

.content {
  flex: 1;
  max-width: 1600px;
  margin: 0 auto;
  padding: 30px 20px;
  width: 100%;
}

.footer {
  background: #2c3e50;
  color: #ddd;
}

.footer-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  font-size: 14px;
  width: 100%;
}
</style>