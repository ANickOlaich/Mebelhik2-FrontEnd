<template>
  <div class="image-field">

    <!-- PREVIEW -->
    <div v-if="localValue" class="preview">
      <img :src="resolveImage(localValue)" />

      <div class="actions">
        <button @click="editExisting">Редагувати</button>
        <button @click="removeImage">Видалити</button>
      </div>
       
    </div>

    <!-- URL INPUT -->
    <div class="url-input">
      <label>Посилання на зображення (URL)</label>
      <input
        v-model="localValue"
        type="text"
        placeholder="https://..."
        @input="emitChange"
      />
    </div>
    <div>
          {{ props.imageUrl }}
        </div>

    <!-- FILE INPUT -->
    <div class="upload-section">
      <label>Завантажити файл</label>
      <input type="file" accept="image/*" @change="onFileSelect" />
    </div>

    <!-- CROPPER MODAL -->
    <div v-if="showCropper" class="modal">
      <div class="modal-body">

        <Cropper
          ref="cropperRef"
          :src="imageForCrop"
          :stencil-props="{ aspectRatio }"
          :canvas="{ imageSmoothingQuality: 'high' }"
          :crossOrigin="'anonymous'"
        />
       

        <div class="cropper-controls">
          <label>Формат:</label>
          
          <select v-model="aspectRatio">
            <option :value="1">1:1</option>
            <option :value="null">Вільно</option>
          </select>
          <button @click="applyCrop">Зберегти</button>
          <button @click="closeCropper">Скасувати</button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import apiClient from '@/api/client.js'
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()

const props = defineProps({
  modelValue: String,
  id: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const localValue = ref(props.modelValue || '')

const showCropper = ref(false)
const imageForCrop = ref(null)
const cropperRef = ref(null)
const aspectRatio = ref(null)

// sync с родителем
watch(() => props.modelValue, (val) => {
  localValue.value = val || ''
})

// emit
const emitChange = () => {
  emit('update:modelValue', localValue.value)
}

// ========================
// ВЫБОР ФАЙЛА
// ========================
const onFileSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    imageForCrop.value = reader.result
    showCropper.value = true
  }
  reader.readAsDataURL(file)
}

// ========================
// РЕДАКТИРОВАНИЕ С БЭКА
// ========================
const editExisting = () => {
  if (!localValue.value) return

  imageForCrop.value = resolveImage(localValue.value)
  showCropper.value = true
}

// ========================
// APPLY CROP
// ========================
const applyCrop = async () => {
  
  const result = cropperRef.value?.getResult()

  if (!result?.canvas) return

  result.canvas.toBlob(async (blob) => {
    if (!blob) return

    try {
      const formData = new FormData()

      formData.append('image', blob, 'image.jpg')
      formData.append('id', props.id) // 👈 важно

      const res = await apiClient.post('/imageUpdate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const path = res.data?.image

      if (!path) {
            notifications.push({
            type: 'error',
            message: 'No image path returned from server'
        })
      }

      // можно оставить, но уже не обязательно
      localValue.value = `${path}?v=${Date.now()}`

      emitChange()
      closeCropper()

    } catch (err) {
       notifications.push({
            type: 'error',
            message: 'Помилка завантаження'
        })
    }
  }, 'image/jpeg', 0.9)
}

// ========================
// REMOVE
// ========================
const removeImage = () => {
  localValue.value = ''
  emitChange()
}

// ========================
// CLOSE
// ========================
const closeCropper = () => {
  showCropper.value = false
  imageForCrop.value = null
}

// ========================
// RESOLVE URL
// ========================
const resolveImage = (path) => {
  if (!path) return ''

  if (path.startsWith('http')) return path

  return import.meta.env.DEV
    ? `http://localhost:3000${path}`
    : path
}
</script>

<style scoped>
.image-field {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview {
  position: relative;
  width: 100%;
  max-height: 240px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #eee;
  background: #f9f9f9;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* OVERLAY */
.actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 2;
}

/* затемнение под кнопками */
.preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.15);
  opacity: 0;
  transition: 0.2s;
}

/* показываем overlay при hover */
.preview:hover::after {
  opacity: 1;
}

/* кнопки */
.actions button {
  background: rgba(0,0,0,0.7);
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: 0.2s;
}

.actions button:hover {
  background: rgba(0,0,0,0.9);
}

.url-input label,
.upload-section label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.url-input input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 15px;
}

.upload-section input[type="file"] {
  width: 100%;
  padding: 8px 0;
}


.cropper-controls {
  margin-top: 10px;
}
</style>