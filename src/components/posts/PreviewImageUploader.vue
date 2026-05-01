<script setup>
import { ref } from 'vue'
import CropperModal from './CropperModal.vue'
import apiClient from '@/api/client.js'

const props = defineProps({
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const showCropper = ref(false)
const tempImage = ref(null)

const openFile = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = () => {
    tempImage.value = reader.result
    showCropper.value = true
  }

  reader.readAsDataURL(file)
}

const onCropped = async (blob) => {
  const formData = new FormData()
  formData.append('image', blob, 'preview.jpg')

  const res = await apiClient.post('/upload/post-image', formData,{ 
     headers: {
          'Content-Type': 'multipart/form-data'
        }
})

  const url = res.data.result[0].url

  emit('update:modelValue', url)

  showCropper.value = false
  tempImage.value = null
}
</script>

<template>
  <div class="preview-uploader">

    <!-- preview -->
    <div v-if="modelValue" class="preview">
      <img :src="modelValue" />
    </div>

    <!-- file input -->
    <input type="file" accept="image/*" @change="openFile" />

    <!-- cropper modal -->
    <CropperModal
      v-if="showCropper"
      :image="tempImage"
      @close="showCropper = false"
      @cropped="onCropped"
    />

  </div>
</template>