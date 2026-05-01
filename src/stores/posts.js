// stores/posts.js
import { defineStore } from 'pinia'
import apiClient from '@/api/client'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    items: [], //Посты в админке
    posts: [], //Посты на главной
    loading: false,

    pagination: { //Для главной
      page: 1,
      limit: 9,
      total: 0
    },

    filters: {  
      categoryId: null
    },

    current: null,
    total: 0,
    page: 1,
    perPage: 20
  }),

   getters: {
    totalPages: (state) =>
      Math.ceil(state.pagination.total / state.pagination.limit)
  },
 
  actions: {
    async fetchPosts() { //для главной
      this.loading = true

      try {
        const { page, limit } = this.pagination

        const params = {
          page,
          limit,
          categoryId: this.filters.categoryId
        }

        const { data } = await apiClient.get('/posts/featured', { params })

        this.posts = data.items
        this.pagination.total = data.total
      } finally {
        this.loading = false
      }
    },

    async fetch() { //Для админки
      this.loading = true

      try {
        const res = await apiClient.get('/posts', {
          params: {
            page: this.page,
            perPage: this.perPage
          }
        })

        this.items = res.data.items
        this.total = res.data.total
      } finally {
        this.loading = false
      }
    },

     setPage(page) {
      this.pagination.page = page
      return this.fetchPosts()
    },

    setCategory(categoryId) {
      this.filters.categoryId = categoryId
      this.pagination.page = 1
      return this.fetchPosts()
    },

    async getById(id) {
      const res = await apiClient.get(`/posts/${id}`)
      this.current = res.data
      return res.data
    },

    async getBySlug(slug) {
      const res = await apiClient.get(`/posts/slug/${slug}`)
      this.current = res.data
      return res.data
    },

    async create(payload) {
      const res = await apiClient.post('/posts', payload)
      return res.data
    },

    async update(id, payload) {
      const res = await apiClient.put(`/posts/${id}`, payload)
      return res.data
    },

    async remove(id) {
      await apiClient.delete(`/posts/${id}`)
      this.items = this.items.filter(p => p.id !== id)
    },
  }
})