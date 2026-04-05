import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)

  // Регистрация
  const register = async (data) => {
    loading.value = true
    try {

      console.log('Registering user with data:', data)
      const res = await authApi.register(data)
      return res.data
    } finally {
      loading.value = false
    }
  }

  // Вход
  const login = async (data) => {
    loading.value = true
    try {
      const res = await authApi.login(data)
      
      token.value = res.data.token
      user.value = res.data.user
      
      localStorage.setItem('token', token.value)
      return res.data
    } finally {
      loading.value = false
    }
  }

  // Выход
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.log('Logout error')
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  // Проверка авторизации (при загрузке приложения)
  const checkAuth = () => {
    if (token.value) {
      // Можно добавить запрос на /me для получения актуальных данных пользователя
      console.log('User token exists')
    }
  }

  return {
    user,
    token,
    loading,
    register,
    login,
    logout,
    checkAuth
  }
})