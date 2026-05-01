import { defineStore } from 'pinia'
import apiClient from '@/api/client.js'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const res = await apiClient.get('/users')
        this.users = res.data
      } catch (err) {
        this.error = 'Ошибка загрузки пользователей'
      } finally {
        this.loading = false
      }
    },

    async updateUser(id, payload) {
      try {
        await apiClient.put(`/users/${id}`, payload)

        // обновляем локально без полного refetch
        const index = this.users.findIndex(u => u.id === id)
        if (index !== -1) {
          this.users[index] = {
            ...this.users[index],
            ...payload
          }
        }
      } catch (err) {
        throw new Error('Ошибка обновления пользователя')
      }
    },

    async deleteUser(id) {
      try {
        await apiClient.delete(`/users/${id}`)
        this.users = this.users.filter(u => u.id !== id)
      } catch (err) {
        throw new Error('Ошибка удаления пользователя')
      }
    }
  }
})