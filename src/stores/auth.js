import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)

  const register = async (data) => {
    loading.value = true
    try {
      const res = await authApi.register(data)
      return res.data
    } finally {
      loading.value = false
    }
  }

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

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (e) {}
    finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

const checkAuth = async () => {
  const savedToken = localStorage.getItem('token')
  
  if (!savedToken) {
    token.value = null
    user.value = null
    return false
  }

  token.value = savedToken

  try {
    const res = await authApi.me()        // ← теперь работает
    user.value = res.data                 // бэкенд должен вернуть { id, role, ... }
    return true
  } catch (e) {
    console.log('checkAuth ошибка:', e.response?.status || e)
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    return false
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