<template>
  <div class="materials-page">
    <h1>Материалы и фурнитура</h1>

    <!-- Toolbar -->
    <div class="toolbar">
      <input
        :value="materialsStore.search"
        @input="materialsStore.setSearch($event.target.value)"
        placeholder="Поиск..."
        class="search-input"
      />

      <select @change="materialsStore.setSorting('name')">
        <option value="name">Название</option>
        <option value="supplierId">Поставщик</option>
        <option value="article">Артикул</option>
        <option value="isNew">Нові</option>
      </select>

      <button class="btn-add" @click="openCreate">
        + Добавить материал
      </button>
    </div>

    <!-- Таблица -->
    <div v-if="materialsStore.loading">Загрузка...</div>

    <table v-else class="materials-table">
      <thead>
        <tr>
          <th>Изображение</th>
          <th @click="materialsStore.setSorting('name')">Название</th>
          <th>Поставщик</th>
          <th>Артикул</th>
          <th>Тип</th>
          <th>Використано</th>
          <th>Добавил</th>
          <th>Новий</th>
          <th>Действия</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in materialsStore.items" :key="item.id">
          <td>
            <img
              v-if="item.image"
              :src="getImageUrl(item.image)"
              class="material-image"
            />
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.supplier?.name || '—' }}</td>
          <td>{{ item.article || '—' }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.uses }}</td>
          <td>{{ item.creator?.username || 'system' }}</td>
          <td>
            <span :class="item.isNew ? 'badge-yes' : 'badge-no'">
              {{ item.isNew ? '✔ Так' : '✖ Ні' }}
            </span>
          </td>
          <td>
            <button @click="openEdit(item)" class="btn-edit">Редактировать</button>
            <button @click="materialsStore.deleteMaterial(item.id)" class="btn-delete">
              Удалить
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Пагинация -->
    <div class="pagination">
      <button @click="prev" :disabled="materialsStore.page === 1">←</button>
      <span>{{ materialsStore.page }} / {{ totalPages }}</span>
      <button @click="next" :disabled="materialsStore.page >= totalPages">→</button>
    </div>

    <!-- Модальное окно -->
    <MaterialModal
      :show="showModal"
      :is-edit="isEdit"
      :initial-data="form"
      :suppliers="suppliersStore.suppliers"
      :is-admin="true"
      @update:show="showModal = $event"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useMaterialsStore } from '@/stores/materials'
import { useSuppliersStore } from '@/stores/suppliers'
import MaterialModal from '../Components/MaterialModal.vue'

const materialsStore = useMaterialsStore()
const suppliersStore = useSuppliersStore()

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({
  id: 0,
  name: '',
  article: '',
  supplierId: null,
  type: 'Проче',
  image: '',
  isNew: true
})

onMounted(() => {
  materialsStore.fetchMaterials()
  suppliersStore.fetchSuppliers()
})

const totalPages = computed(() => 
  Math.ceil(materialsStore.total / materialsStore.perPage)
)

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return import.meta.env.DEV 
    ? `http://localhost:3000${path}` 
    : path
}

// Открытие модалки
const openCreate = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    article: '',
    supplierId: null,
    type: 'Проче',
    image: '',
    isNew: true
  }
  showModal.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  currentId.value = item.id

  form.value = {
    id: item.id,
    name: item.name,
    article: item.article || '',
    supplierId: item.supplierId,
    type: item.type,
    image: item.image || '',
    isNew: item.isNew
  }
  showModal.value = true
}

// Сохранение из модалки
const handleSave = async (data) => {
  try {
    if (isEdit.value) {
      await materialsStore.updateMaterial(currentId.value, data)
    } else {
      await materialsStore.createMaterial(data)
    }
    showModal.value = false
  } catch (e) {
    alert(e.message || 'Ошибка сохранения')
  }
}

const next = () => materialsStore.setPage(materialsStore.page + 1)
const prev = () => materialsStore.setPage(materialsStore.page - 1)
</script>