<script setup>
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { ref } from 'vue'

const props = defineProps({
  image: String
})

const emit = defineEmits(['close', 'cropped'])

const cropperRef = ref(null)

const crop = () => {
  const result = cropperRef.value.getResult()

  if (!result?.canvas) return

  result.canvas.toBlob((blob) => {
    emit('cropped', blob)
  }, 'image/jpeg', 0.9)
}
</script>

<template>
  <div class="modal">
    <div class="box">

      <Cropper
        ref="cropperRef"
        :src="image"
        :stencil-props="{ aspectRatio: 1 }"
      />

      <div class="actions">
        <button @click="$emit('close')">Cancel</button>
        <button @click="crop">Apply</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.box {
  background: #fff;
  padding: 16px;
  width: 600px;
}
</style>