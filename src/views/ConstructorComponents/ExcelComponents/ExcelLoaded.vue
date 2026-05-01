<template>
  <div class="file-upload">

    <!-- 📥 Upload -->
    <label class="upload-label">
      <input
        type="file"
        accept=".xls,.xlsx"
        @change="onFileChange"
        hidden
      />

      <div class="upload-content">
        <span class="upload-icon">📊</span>
        <p class="upload-text">Обрати файл Excel</p>
        <p class="upload-subtext">.xls або .xlsx</p>
      </div>
    </label>

    <!-- ⏳ Loading -->
    <div v-if="excelStore.loading" class="upload-loading">
      Обробка файлу...
    </div>

    <!-- ❌ Error -->
    <div v-if="excelStore.error" class="upload-error">
      {{ excelStore.error }}
    </div>

  </div>
</template>

<script setup>
import { useExcelStore } from '@/stores/excel'

const emit = defineEmits(['loaded'])

const excelStore = useExcelStore()

const onFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    await excelStore.loadFile(file)

    // 🔥 уведомляем родителя
    emit('loaded')

  } catch (err) {
    console.error(err)
  }

  e.target.value = ''
}
</script>

<style scoped>
.file-upload {
  margin-bottom: 16px;
}

/* upload block */
.upload-label {
  display: block;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  text-align: center;
  transition: 0.2s;
  background: #f9fafb;
}

.upload-label:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

/* content */
.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.upload-text {
  font-weight: 600;
  font-size: 14px;
}

.upload-subtext {
  font-size: 12px;
  color: #6b7280;
}

/* states */
.upload-loading {
  margin-top: 10px;
  color: #2563eb;
  font-size: 13px;
}

.upload-error {
  margin-top: 10px;
  color: #dc2626;
  font-size: 13px;
}

.upload-result {
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  font-size: 13px;
}
</style>