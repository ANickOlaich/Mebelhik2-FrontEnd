import { defineStore } from 'pinia'
import apiClient from '@/api/client'

export const useUserClassStore = defineStore('userClass', {
  state: () => ({
    classes: [],
    loading: false
  }),

  actions: {
    async fetchClasses() {
      this.loading = true
      try {
        const res = await apiClient.get('/user-classes')
        this.classes = res.data
      } finally {
        this.loading = false
      }
    },

    async updateClass(id, payload) {
      await apiClient.put(`/user-classes/${id}`, payload)

      const cls = this.classes.find(c => c.id === id)
      if (cls) {
        Object.assign(cls, payload)
      }
    },

    async updateMany(data) {
      await apiClient.put('/user-classes/bulkAll', data)

      // обновляем локально (важно для реактивности)
      data.forEach(item => {
        const cls = this.classes.find(c => c.id === item.id)
        if (cls) {
          Object.assign(cls, item)
        }
      })
    }
  }
})