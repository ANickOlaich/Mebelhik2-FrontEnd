import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import EditorView from '../views/EditorView.vue'
import SettingsView from '../views/SettingsView.vue'

import UserRegistrationView from '../views/User/RegistrationView.vue'
import UserLoginView from '../views/User/LoginView.vue'
import UserProfileView from '../views/User/ProfileView.vue'

import AdminView from '../views/AdminComponents/AdminView.vue'
import ExcelView from '../views/ConstructorComponents/ExcelComponents/ExcelView.vue'

// admin pages
import UsersView from '@/views/AdminComponents/UsersView.vue'
import MaterialsView from '@/views/AdminComponents/MaterialsView.vue'
import SuppliersView from '@/views/AdminComponents/SuppliersView.vue'
import StatisticView from '@/views/AdminComponents/StatisticView.vue'

import PostList from '@/views/AdminComponents/Posts/PostList.vue'
import PostEditor from '@/views/AdminComponents/Posts/PostEditor.vue'
import CategoryManager from '@/views/AdminComponents/Posts/CategoryManager.vue'

import AdminFeedbackList from '@/views/AdminComponents/AdminFeedbackList.vue'

import { useAuthStore } from '@/stores/auth.js'
import { trackRoute } from '@/analytics/track'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    // ======================
    // PUBLIC
    // ======================
    { path: '/', name: 'home', component: HomeView },
    { path: '/editor', name: 'editor', component: EditorView },
    { path: '/excel', name: 'excel', component: ExcelView },
    { path: '/settings', name: 'settings', component: SettingsView },

    { path: '/register', name: 'register', component: UserRegistrationView },
    { path: '/login', name: 'login', component: UserLoginView },

    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView,
      meta: { requiresAuth: true }
    },

    // ======================
    // ADMIN (ВАЖНО: children)
    // ======================
    {
      path: '/admin',
      component: AdminView,
      meta: { requiresAuth: true, role: 'admin' },

      children: [
        { path: '', redirect: '/admin/statistic' },

        { path: 'statistic', component: StatisticView },
        { path: 'users', component: UsersView },
        { path: 'materials', component: MaterialsView },
        { path: 'suppliers', component: SuppliersView },

        // posts
        { path: 'posts', component: PostList },
        { path: 'posts/new', component: PostEditor },
        { path: 'posts/:id', component: PostEditor, props: true },

        // categories
        { path: 'categories', component: CategoryManager },
        //feedback
        { path: 'feedback', component: AdminFeedbackList }
      ]
    }
  ]
})

/**
 * Analytics
 */
router.afterEach((to) => {
  trackRoute(to)
})

/**
 * Guards
 */
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // auth check
  if (to.meta.requiresAuth && !authStore.user) {
    return '/login'
  }

  // role check
  if (
    to.meta.role === 'admin' &&
    (!authStore.user || authStore.user.role !== 'admin')
  ) {
    return '/'
  }

  return true
})

export default router