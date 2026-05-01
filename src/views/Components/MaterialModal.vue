<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content" @click.stop>
      <h2>{{ isEdit ? 'Редагування матеріалу' : 'Новий матеріал' }}</h2>

      <div class="modal-body">

        <!-- LEFT -->
        <div class="left-column">

          <div class="form-group">
            <label>Назва *</label>
            <input
              v-model="form.name"
              :disabled="!canEditField('name')"
              placeholder="Назва матеріалу"
            />
          </div>

          <div class="form-group">
            <label>Артикул</label>
            <input
              v-model="form.article"
              :disabled="!canEditField('article')"
              placeholder="Артикул"
            />
          </div>

          <div class="form-group">
            <label>Постачальник</label>
            <select
              v-model="form.supplierId"
              :disabled="!canEditField('supplierId')"
              @change="updateProductBySupplier"
            >
              <option disabled value="">Оберіть постачальника</option>
              <option
                v-for="s in (userClassStore?.classes || [])"
                :key="s.id"
                :value="String(s.id)"
              >
                {{ s.supplier?.name || s.name || '' }} - {{ s.type }} ({{ s.className }})
              </option>
            </select>
          </div>

          <!-- admin only -->
          <div v-if="isAdmin" class="form-group">
            <label>Новий</label>
            <select v-model="form.isNew">
              <option :value="true">Так</option>
              <option :value="false">Ні</option>
            </select>
          </div>

          <!-- quantity -->
          <div v-if="!isAdmin" class="form-group">
            <label>Кількість</label>
            <input
              v-model="form['Количество в заказе']"
              type="number"
              step="1"
              :disabled="!canEditField('quantity')"
            />
          </div>

          <!-- unit -->
          <div class="form-group">
            <label>Одиниці виміру</label>
            <select
              v-model="form['Ед. изм.']"
              :disabled="!canEditField('unit')"
            >
              <option value="">—</option>
              <option value="шт.">шт.</option>
              <option value="компл.">компл.</option>
              <option value="лист.">лист.</option>
              <option value="кв.м">кв.м</option>
              <option value="м.">м.</option>
              <option value="кг.">кг.</option>
              <option value="літр">літр</option>
            </select>
          </div>

          <!-- note -->
          <div v-if="!isAdmin" class="form-group full-width">
            <label>Примітка</label>
            <textarea
              v-model="form['Примечание']"
              rows="4"
              :disabled="!canEditField('note')"
              placeholder="Додаткова інформація..."
            />
          </div>

        </div>

        <!-- RIGHT -->
        <div class="right-column">
          <label class="image-label">Зображення</label>

          <div v-if="isReadOnly" class="preview-only">
            <img
              v-if="form.image"
              :src="resolveImage(form.image)"
              class="preview-image"
            />
            <span v-else class="no-image">Немає зображення</span>
          </div>

          <ImageField
            v-else
            v-model="form.image"
            :id="form.id"
          />
        </div>

      </div>

      <!-- ACTIONS -->
      <div class="modal-buttons">
        <button class="btn-save" @click="save" :disabled="!canSave">
          Зберегти
        </button>

        <button class="btn-cancel" @click="close">
          Скасувати
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ImageField from './ImageField.vue'
import { useUserClassStore } from '@/stores/userClass'

const userClassStore = useUserClassStore()

const props = defineProps({
  show: Boolean,
  isEdit: Boolean,
  initialData: Object,
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'save'])

const form = ref({
  id: 0,
  name: '',
  article: '',
  supplierId: '',
  type: 'Проче',
  image: '',
  isNew: true,
  'Количество в заказе': '',
  'Ед. изм.': '',
  'Примечание': ''
})

/**
 * 🔐 ЛОГИКА ДОСТУПА
 * админ → всё можно
 * не админ → только если материал новый
 */
const isReadOnly = computed(() => {
  return !props.isAdmin && form.value.isNew === false
})

const canEditField = (field) => {
  if (props.isAdmin) return true
  return !isReadOnly.value
}

const canSave = computed(() => {
  return form.value.name?.trim().length > 0
})

/**
 * supplier auto-fill
 */
const updateProductBySupplier = () => {
  const selected = userClassStore.classes?.find(
    s => String(s.id) === String(form.value.supplierId)
  )

  if (!selected) return

  form.value.name = selected.name || ''
  form.value['Ед. изм.'] = selected['Ед. изм.'] || ''
  form.value.type = selected.type || 'Проче'
}

/**
 * init form
 */
watch(
  () => props.initialData,
  (data) => {
    if (data) {
      Object.assign(form.value, data)
      form.value.supplierId = String(form.value.supplierId || '')
    }
  },
  { immediate: true }
)

const save = () => {
  emit('save', form.value)
}

const close = () => emit('update:show', false)

const resolveImage = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return import.meta.env.DEV
    ? `http://localhost:3000${path}`
    : path
}
</script>

<style scoped>

.full-width {
  grid-column: 1 / -1;     /* займає всю ширину обох колонок */
}

.full-width textarea {
  width: 100%;
  min-height: 100px;
  resize: vertical;
  font-size: 15px;
  padding: 12px;
}

.preview-only {
  width: 100%;
  max-height: 260px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 260px;
  object-fit: contain;
}

.no-image {
  color: #999;
  font-style: italic;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 28px 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 860px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.35);
}

.modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 24px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-column {
  display: flex;
  flex-direction: column;
}

.image-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-save {
  background: #0066cc;
  color: white;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  background: #f1f1f1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>