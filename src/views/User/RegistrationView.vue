<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Регистрация в MebelShik</h1>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <input v-model="form.email" type="email" placeholder="Email" required>
        </div>
        <div class="form-group">
          <input v-model="form.username" type="text" placeholder="Имя пользователя" required>
        </div>
        <div class="form-group">
          <input v-model="form.password" type="password" placeholder="Пароль" required>
        </div>
        <div class="form-group">
          <input v-model="form.confirmPassword" type="password" placeholder="Повторите пароль" required>
        </div>
        <button type="submit" class="btn-register" :disabled="authStore.loading">
          {{ authStore.loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      <p class="login-link">
        Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const form = ref({ username: '', email: '', password: '', confirmPassword: '' })

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert('Пароли не совпадают')
    return
  }
  try {
    await authStore.register(form.value)
    router.push('/login')
  } catch (err) {
    alert('Ошибка: ' + (err.response?.data?.message || err.message))
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.register-card {
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

.form-group {
  margin-bottom: 1.25rem;
}

input {
  width: 90%;
  padding: 14px 18px;
  border: 2px solid #3498db;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #c4a484;
  box-shadow: 0 0 0 4px rgba(196, 164, 132, 0.2);
}

.btn-register {
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #3498db, #3498db);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(50, 25, 159);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  margin-top: 1.5rem;
  color: #6b5e4e;
  font-size: 0.95rem;
}

.login-link a {
  color: #c4a484;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>