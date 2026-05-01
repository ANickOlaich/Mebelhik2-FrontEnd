<template>
  <div class="suppliers-management">
    <h1>Поставщики</h1>
    <div class="toolbar">
      <button class="btn-add" @click="openCreate">
      + Добавить поставщика
    </button>
    </div>
    <div v-if="suppliersStore.loading">Загрузка...</div>
    <div v-else-if="suppliersStore.error" class="error">
      {{ suppliersStore.error }}
    </div>


    <table v-else class="suppliers-table">
      <thead>
        <tr>
          <th>Код</th>
          <th>Логотип</th>
          <th>Название</th>
          <th>Сайт</th>
          <th>Сортировка</th>
          <th>Действия</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="supplier in suppliersStore.suppliers" :key="supplier.id">
          <td>{{ supplier.id }}</td>

          <td>
            <img
              v-if="supplier.logo"
              :src="getImageUrl(supplier.logo)"
              class="material-image"
              alt="logo"
            />
            <span v-else>—</span>
          </td>

          <td>{{ supplier.name }}</td>

          <td>
            <a :href="supplier.site" target="_blank">
              {{ supplier.site }}
            </a>
          </td>


          <td>{{ supplier.sortOrder }}</td>

          <td>
            <button @click="openEdit(supplier)" class="btn-edit">
              Изменить
            </button>

            <button
              @click="removeSupplier(supplier.id)"
              class="btn-delete"
            >
              Удалить
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">

        <h2>
          {{ isEdit ? 'Редактировать поставщика' : 'Новый поставщик' }}
        </h2>

        <div class="form-group">
          <label>Название</label>
          <input v-model="form.name" />
        </div>

        <div class="form-group">
          <label>Сайт</label>
          <input v-model="form.site" />
        </div>

        <div class="form-group">
          <label>Парсер</label>
          <input v-model="form.parser" />
        </div>

        <div class="form-group">
          <label>Логотип</label>
          <ImageField v-model="form.logo" />
        </div>

        <div class="form-group">
          <label>Комментарий</label>
          <input v-model="form.note" />
        </div>

        <div class="form-group">
          <label>Сортировка</label>
          <input type="number" v-model="form.sortOrder" />
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="form.isGlobal" />
            Глобальный
          </label>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="form.allowed" />
            Разрешён
          </label>
        </div>


        <div class="modal-buttons">
          <button @click="save" class="btn-save">
            {{ isEdit ? 'Сохранить' : 'Создать' }}
          </button>

          <button @click="closeModal" class="btn-cancel">
            Отмена
          </button>
        </div>

      </div>
    </div>
   
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSuppliersStore } from '@/stores/suppliers'
import ImageField from '../Components/ImageField.vue'

const suppliersStore = useSuppliersStore()

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({
  name: '',
  site: '',
  sortOrder: 10
})

onMounted(() => {
  suppliersStore.fetchSuppliers()
})

const openCreate = () => {
  isEdit.value = false
  currentId.value = null

  form.value = {
    name: '',
    site: '',
    parser: '',
    sortOrder: 10,
    logo: '',
    note: '',
    isGlobal: true,
    allowed: true
  }

  showModal.value = true
}

const openEdit = (supplier) => {
  isEdit.value = true
  currentId.value = supplier.id

  form.value = {
    name: supplier.name,
    site: supplier.site,
    parser: supplier.parser,
    sortOrder: supplier.sortOrder,
    logo: supplier.logo,
    note: supplier.note,
    isGlobal: supplier.isGlobal,
    allowed: supplier.allowed
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const save = async () => {
  try {
    if (isEdit.value) {
      await suppliersStore.updateSupplier(currentId.value, form.value)
    } else {
      await suppliersStore.createSupplier(form.value)
    }

    closeModal()

  } catch (e) {
    alert(e.message)
  }
}

const removeSupplier = async (id) => {
  if (!confirm('Удалить поставщика?')) return

  try {
    await suppliersStore.deleteSupplier(id)
  } catch (e) {
    alert(e.message)
  }
}

const getImageUrl = (path) => {
  if (!path) return ''

  // уже внешняя ссылка
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // локальный файл
  return import.meta.env.DEV
    ? `http://localhost:3000${path}`
    : path
}

</script>

<style scoped>

</style>