<template>
  <!-- 🔘 Кнопка -->
  <button class="btn-action" @click="openModal">
    Додати матеріал
  </button>

  <!-- 🪟 Модалка -->
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-body">

        <h3>Додати матеріал</h3>

        <!-- 🔍 Поиск -->
        <input
          v-model="query"
          placeholder="Назва матеріалу"
          @input="onInput"
        />
        <!-- ⏳ loading -->
        <div v-if="materialsStore.loading">
          Пошук...
        </div>

       <!-- 📋 Результаты пошуку -->
       <div v-if="results.length > 0" class="results">
        <div
            v-for="item in results"
            :key="item.id"
            class="result-item"
            @click="selectMaterial(item)"
        >
            <img 
            v-if="item.image" 
            :src="getImageUrl(item.image)"
            class="item-image"
            alt=""
            />
            <div class="item-info">
            <strong>{{ item.name }}</strong>
            <span class="article">{{ item.article }}</span>
            <span class="supplier">{{ item.supplier?.name }}</span>
            </div>
        </div>
        </div>

        <!-- Клас матеріалу -->
        <div v-if="filteredClasses.length > 0" class="extra-fields">
        <select v-model="form.classId">
            <option disabled value="">Виберіть клас</option>
            <option
            v-for="cls in filteredClasses"
            :key="cls.className"
            :value="cls.className"
            >
            {{ cls.className }} — {{ cls.type }}
            </option>
        </select>
        </div>

        <!-- ➕ Создание нового -->
        <div v-if="showCreateForm" class="extra-fields">
          <p>Матеріал не знайдено. Створити новий:</p>

          <input v-model="form.name" placeholder="Назва" />
          <input v-model="form.article" placeholder="Артикул" />

          <select v-model="form.supplierId">
            <option disabled value="">Постачальник</option>
            <option
              v-for="s in suppliers"
              :key="s.id"
              :value="s.id"
            >
              {{ s.name }}
            </option>
          </select>
        </div>

        <!-- 🎯 actions -->
        <div class="actions">
          <button @click="close">Скасувати</button>

          <button
            @click="save"
            :disabled="!canSave"
          >
            Додати
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMaterialsStore } from '@/stores/materials'
import {useUserClassStore} from '@/stores/userClass'
import {useExcelStore} from '@/stores/excel'
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()


const emit = defineEmits(['select', 'create'])

const materialsStore = useMaterialsStore()
const userClassStore = useUserClassStore()
const excelStore = useExcelStore()

const show = ref(false)
const query = ref('')
const selected = ref(null)

const form = ref({
  name: '',
  article: '',
  supplierId: '',
  classId: null
})

// Класи тільки для обраного постачальника
const filteredClasses = computed(() => {
  if (!form.value.supplierId) return []

  return userClassStore.classes.filter(cls => 
    cls.supplierId === Number(form.value.supplierId)
  )
})

let timer = null

// 📦 результаты из store (единственный источник правды)
const results = computed(() => materialsStore.searchResults)

// 🔘 открыть
const openModal = () => {
  show.value = true
}

// ❌ закрыть
const close = () => {
  show.value = false
  reset()
}

// ♻️ reset
const reset = () => {
  query.value = ''
  selected.value = null

  form.value = {
    name: '',
    article: '',
    supplierId: '',
   classId: null
  }

  materialsStore.searchResults = []
}

// 🔍 input + debounce
const onInput = () => {
  selected.value = null

  clearTimeout(timer)

  const q = query.value.trim()

  if (q.length < 3) {
    materialsStore.searchResults = []
    return
  }

  timer = setTimeout(() => {
    materialsStore.searchMaterials(q)
  }, 300)
}

// 📌 выбрать материал
const selectMaterial = (item) => {
  selected.value = item
  query.value = item.name
  console.log(item)
  form.value = {
    name: item.name,
    article: item.article,
    supplierId: item.supplierId,
    classId: ''      // ← додати
  }
}

// 📊 есть результаты
const hasResults = computed(() => {
  return query.value.length >= 3 && results.value.length > 0
})

// ➕ форма создания
const showCreateForm = computed(() => {
  return (
    query.value.length >= 3 &&
    !materialsStore.loading &&
    results.value.length === 0 &&
    !selected.value
  )
})

// 💾 можно сохранить
const canSave = computed(() => {
  if (selected.value) return true
  return (form.value.name || query.value).trim().length > 0
})

// 💾 save
const save = async () => {
    console.log('save')
    console.log(form.value)
  if (selected.value) {
    console.log(selected.value);
    const result = await excelStore.addMaterial({
        article: selected.value.article,
        name: selected.value.name,
        unit: 'компл',
        quantity: 1,
        note: '',
        class: form.value.classId
    })

    notifications.push({
        type: result.success ? 'success' : 'warning',
        message: result.message
    })
    
    //emit('select', selected.value)
  } else {
    const payload = {
      name: form.value.name || query.value,
      article: form.value.article,
      supplierId: form.value.supplierId,
      className: form.value.classId || null     // ← правильно передаємо
    }

    const created = await materialsStore.create(payload)
    emit('create', created)
  }

  //close()
}

const getImageUrl = (path) => {
  if (!path) return ''

  // если уже абсолютный URL — возвращаем как есть
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  // иначе считаем, что это локальный путь
  return import.meta.env.DEV
    ? `http://localhost:3000${path}`
    : path
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-body {
  padding: 20px;
}

.modal-body h3 {
  margin: 0 0 16px 0;
  text-align: center;
}

input, select {
  width: 100%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}

input:focus, select:focus {
  outline: none;
  border-color: #007bff;
}

/* Результати пошуку */
.results {
  max-height: 600px;
  overflow-y: auto;
  margin-bottom: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fafafa;
}

.result-item {
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.result-item:hover {
  background: #e6f0ff;
}

.result-item:last-child {
  border-bottom: none;
}

/* Поля створення */
.extra-fields {
  margin: 12px 0;
}

.extra-fields p {
  margin: 8px 0 12px 0;
  font-size: 14px;
  color: #666;
}

/* Кнопки дій */
.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
}

.actions button:first-child {
  background: #f1f1f1;
  color: #333;
}

.actions button:last-child {
  background: #007bff;
  color: white;
}

.actions button:last-child:disabled {
  background: #a0c4ff;
  cursor: not-allowed;
}

/* Кнопка відкриття */
.btn-action {
  padding: 10px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
}

.btn-action:hover {
  background: #0056b3;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.result-item:hover {
  background: #e6f0ff;
}

.result-item:last-child {
  border-bottom: none;
}

.item-image {
  height: 96px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid #eee;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info strong {
  display: block;
  font-size: 15px;
  line-height: 1.3;
  margin-bottom: 2px;
}

.article {
  font-size: 13px;
  color: #666;
  display: block;
}

.supplier {
  font-size: 13px;
  color: #007bff;
}
</style>
