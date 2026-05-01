import { defineStore } from 'pinia'
import apiClient from '@/api/client.js'

export const useMaterialsStore = defineStore('materials', {
  state: () => ({
    items: [],
    loading: false,
    error: null,

    // pagination
    page: 1,
    perPage: 20,
    total: 0,

    // filters
    search: '',
    sortField: 'name',
    sortDirection: 'asc',

    //Поиск
    searchResults: [],
  }),

  actions: {
    async fetchMaterials() {
      this.loading = true
      this.error = null

      try {
        const res = await apiClient.get('/materials', {
          params: {
            page: this.page,
            perPage: this.perPage,
            search: this.search,
            sortField: this.sortField,
            sortDirection: this.sortDirection
          }
        })

        this.items = res.data.items
        this.total = res.data.total
      } catch (err) {
        this.error = 'Ошибка загрузки материалов'
      } finally {
        this.loading = false
      }
    },

    setPage(page) {
      this.page = page
      this.fetchMaterials()
    },

    setSorting(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortDirection = 'asc'
      }

      this.fetchMaterials()
    },

    setSearch(value) {
      this.search = value
      this.page = 1
      this.fetchMaterials()
    },
    async createMaterial(payload) {
      try {
        const res = await apiClient.post('/materials', payload)
        this.items.unshift(res.data)
      } catch (e) {
        throw new Error('Ошибка создания материала')
      }
    },

    async updateMaterial(id, payload) {
      try {
        const res = await apiClient.put(`/materials/${id}`, payload)

        const idx = this.items.findIndex(i => i.id === id)
        if (idx !== -1) {
          this.items[idx] = {
            ...this.items[idx],
            ...res.data
          }
        }
      } catch (e) {
        throw new Error('Ошибка обновления материала')
      }
    },
    async deleteMaterial(id) {
      try {
        await apiClient.delete(`/materials/${id}`)

        this.items = this.items.filter(i => i.id !== id)
      } catch (e) {
        throw new Error('Ошибка удаления материала')
      }
    },
    async searchMaterials(query) {
      this.loading = true
      try {
        const res = await apiClient.get('/materials/search', {
            params: {
              q: query
            }
          })
        this.searchResults = res.data
      } catch (e) {
        console.error('Search error', e)
      } finally {
        this.loading = false
      }
    },
  }
})