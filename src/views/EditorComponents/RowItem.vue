<template>
  <!-- РЯД -->
  <div class="table-row" @click="openModal">
    <div class="td" style="width:50px">{{ index + 1 }}</div>

    <div
      v-for="(h, idx) in materialsStore.visibleHeaders"
      :key="h"
      class="td"
      :style="{ width: materialsStore.colWidths[idx] + 'px' }"
    >
      {{ row[h] || '' }}
    </div>

    <div class="td" style="width:140px">
      <img
        v-if="row.image"
        :src="getImageUrl(row.image)"
        style="max-width:80px; max-height:60px; object-fit:contain"
      />
      <span v-else style="color:#999">—</span>
    </div>
  </div>

  <!-- MODAL -->
  <div v-if="isModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h3>Редактирование записи</h3>

      <div class="form">

        <!-- Все поля КРОМЕ Класс -->
        <div v-for="h in materialsStore.visibleHeaders" :key="h" class="field">
          <label>{{ h }}</label>
          <input v-model="localRow[h]" />
        </div>

        <!-- Класс отдельно -->
        <div class="field">
          <label>Поставщик</label>
          <select v-model="localRow['Класс']">
            <option
              v-for="s in suppliersStore.suppliers"
              :key="s.key"
              :value="s.key"
            >
              {{ s.name }}
            </option>
          </select>
        </div>

        <!-- Картинка -->
        <div class="field">
          <label>Изображение</label>
          <input type="file" accept="image/*" @change="uploadImage" />
        </div>

      </div>

      <div class="actions">
        <button @click="save">Сохранить</button>
        <button @click="closeModal">Отмена</button>
        <button @click="remove" style="color:red">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, toRaw } from 'vue'
import apiClient from '@/api/client.js'
import { useMaterialsStore } from '@/stores/materials'
import { useSuppliersStore } from '@/stores/suppliers'

const materialsStore = useMaterialsStore()
const suppliersStore = useSuppliersStore()

const props = defineProps({
  row: Object,
  index: Number
})

const isModal = ref(false)
const localRow = reactive({})

// --------------------
// helpers
// --------------------
const getImageUrl = (path) => {
  if (!path) return ''
  return import.meta.env.DEV
    ? `http://localhost:3000${path}`
    : path
}

// --------------------
// modal
// --------------------
const openModal = () => {
  Object.assign(localRow, structuredClone(toRaw(props.row)))
  isModal.value = true
}

const closeModal = () => {
  isModal.value = false
}

// --------------------
// save (API + store)
// --------------------
const save = async () => {
  try {
    const { data } = await apiClient.post('/materials/upsert', {
      name: localRow['Наименование материала'],
      supplier: localRow['Класс'],
      article: localRow['Артикул'],
      image: localRow.image
    })

    // обновляем изображение из бэка
    localRow.image = data.material.image

    // 🔥 ОБНОВЛЕНИЕ ЧЕРЕЗ STORE
    materialsStore.updateRow({ ...localRow })

    closeModal()
  } catch (err) {
    console.error(err)
  }
}

// --------------------
// delete
// --------------------
const remove = () => {
  materialsStore.deleteRow(props.row.id)
  closeModal()
}

// --------------------
// upload image (локально)
// --------------------
const uploadImage = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    localRow.image = ev.target.result
  }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  width: 600px;
  max-height: 80vh;
  overflow: auto;
  padding: 20px;
  border-radius: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field input {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
}

.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}
.class-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.class-select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}
</style>