import apiClient from './client.js'

export const authApi = {
  async register(data) {
    return apiClient.post('/auth/register', data)
  },

  async login(data) {
    return apiClient.post('/auth/login', data)
  },

  async logout() {
    return apiClient.post('/auth/logout')
  },

  async me() {                   
    return apiClient.get('/auth/me')   
  }
}