import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import EditorView from '../views/EditorView.vue'
import SettingsView from '../views/SettingsView.vue'
import UserRegistrationView from '../views/User/RegistrationView.vue'
import UserLoginView from '../views/User/LoginView.vue'
import UserProfileView from '../views/User/ProfileView.vue'
import AdminView from '../views/AdminComponents/AdminView.vue' 
import { useAuthStore } from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/editor',
      name: 'editor',
      component: EditorView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    },
    {
      path: '/register',
      name: 'register',
      component: UserRegistrationView
    },
    {
      path: '/login',
      name: 'login',
      component: UserLoginView
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView, 
      meta: { requiresAuth: true, role: 'admin' }
    },

  ]
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()

  // 1. Если маршрут требует авторизации
  if (to.meta.requiresAuth && !authStore.user) {
    return '/login'
  }

  // 2. Если маршрут требует роль admin
  if (to.meta.role === 'admin' && (!authStore.user || authStore.user.role !== 'admin')) {
    return '/' 
  }

  return true
})

export default router