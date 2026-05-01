import { defineStore } from 'pinia'
import apiClient from '@/api/client.js'

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    suppliers: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchSuppliers() {
      this.loading = true
      this.error = null

      try {
        const res = await apiClient.get('/suppliers/all')
        this.suppliers = res.data
      } catch (err) {
        this.error = 'Ошибка загрузки поставщиков'
      } finally {
        this.loading = false
      }
    },

    async fetchUserSuppliers() {
      this.loading = true
      this.error = null

      try {
        const res = await apiClient.get('/suppliers/allOfUser')
        this.suppliers = res.data
      } catch (err) {
        this.error = 'Ошибка загрузки поставщиков'
      } finally {
        this.loading = false
      }
    },

   async createSupplier(payload) {
  try {
    const res = await apiClient.post('/suppliers', payload)

    console.log('FULL RES:', res)
    console.log('RES.DATA:', res?.data)

    this.suppliers.push(res.data)

    return res.data
  } catch (err) {
    console.error('CREATE SUPPLIER ERROR:', err.response?.data || err)
    throw err // ❗ НЕ затирай ошибку
  }
},
    async deleteSupplier(id) {
      try {
        await apiClient.delete(`/suppliers/${id}`)
        this.suppliers = this.suppliers.filter(s => s.id !== id)
      } catch (err) {
        throw new Error('Ошибка удаления поставщика')
      }
    },

    async updateSupplier(id, payload) {
      try {
        const res = await apiClient.put(`/suppliers/${id}`, payload)

        const index = this.suppliers.findIndex(s => s.id === id)
        if (index !== -1) {
          this.suppliers[index] = {
            ...this.suppliers[index],
            ...res.data
          }
        }
      } catch (err) {
        throw new Error('Ошибка обновления поставщика')
      }
    },

    async createSupplier(payload) {
      try {
        const res = await apiClient.post('/suppliers', payload)
        this.suppliers.push(res.data)
      } catch (err) {
        throw new Error('Ошибка создания поставщика')
      }
    }
  }
})