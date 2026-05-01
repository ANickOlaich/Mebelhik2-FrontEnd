import { defineStore } from 'pinia'
import apiClient from '@/api/client'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    tree: [],
    flat: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetch() {
      const res = await apiClient.get(`/categories`)
      this.current = res.data
      return res.data
    },

    // =====================
    // LOAD TREE
    // =====================
    async fetchTree() {
      this.loading = true
      this.error = null

      try {
        const res = await apiClient.get('/categories/tree')

        this.tree = res.data
        this.flat = this.flatten(res.data)

      } catch (err) {
        this.error = 'Ошибка загрузки категорий'
        console.error(err)

      } finally {
        this.loading = false
      }
    },

    // =====================
    // CREATE
    // =====================
    async createCategory(payload) {
      try {
        const res = await apiClient.post('/categories', payload)

        await this.fetchTree()

        return res.data

      } catch (err) {
        console.error(err)
        throw err
      }
    },

    // =====================
    // UPDATE
    // =====================
    async updateCategory(id, payload) {
      try {
        const res = await apiClient.put(`/categories/${id}`, payload)

        await this.fetchTree()

        return res.data

      } catch (err) {
        console.error(err)
        throw err
      }
    },

    // =====================
    // DELETE (soft)
    // =====================
    async deleteCategory(id) {
      try {
        await apiClient.delete(`/categories/${id}`)

        await this.fetchTree()

      } catch (err) {
        console.error(err)
        throw err
      }
    },

    // =====================
    // FLATTEN TREE
    // =====================
    flatten(nodes, acc = []) {
      nodes.forEach(n => {
        acc.push({
          id: n.id,
          name: n.name,
          parentId: n.parentId
        })

        if (n.children?.length) {
          this.flatten(n.children, acc)
        }
      })

      return acc
    }
  }
})