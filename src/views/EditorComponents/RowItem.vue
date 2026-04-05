<!-- RowItem.vue -->
<template>
  <!-- РЯД (только просмотр) -->
  <div class="table-row" @click="openModal">
    <div class="td" style="width:50px">{{ getCounter }}</div>

    <div
      v-for="(h, idx) in headers"
      :key="h"
      class="td"
      :style="{ width: colWidths[idx] + 'px' }"
    >
      {{ row[h] || '' }}
    </div>

    <div class="td" style="width:140px">
      <img
        v-if="row.image"
        :src="row.image"
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
        <div v-for="(h, idx) in headers" :key="h" class="field">
          <label>{{ h }}</label>
          <input v-model="localRow[h]" />
        </div>
         <!-- ОТДЕЛЬНО "Класс" -->
        <div class="field">
        <label>Постачальник</label>
        <select v-model="localRow['Класс']" class="class-select">
            <option 
            v-for="(alias, key) in suppliers.reduce((acc, s) => (acc[s.key] = s.name, acc), {})" 
            :key="key" 
            :value="key"
            >
            {{ alias }}
            </option>
        </select>
        </div>
        <div class="field">
          <label>Изображение</label>
          <input
            type="file"
            accept="image/*"
            @change="uploadImage"
          />

          <div style="margin-top:10px">
            <img
              v-if="localRow.image"
              :src="localRow.image"
              style="max-width:120px; max-height:100px"
            />
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="save">Сохранить</button>
        <button @click="closeModal">Отмена</button>
        <button @click="emitDelete" style="color:red">Удалить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue"

const props = defineProps({
  row: Object,
  headers: Array,
  colWidths: Array,
  index: Number,
  suppliers: Array
})

const emit = defineEmits(["delete", "update-row", "update-image"])
let NID = 1

const getCounter = computed(() => {
  return props.index + 1
})

const isModal = ref(false)

// локальная копия (ВАЖНО: не мутируем props напрямую)
const localRow = reactive({})

const openModal = () => {
  Object.assign(localRow, JSON.parse(JSON.stringify(props.row)))
  isModal.value = true
}

const closeModal = () => {
  isModal.value = false
}

const save = () => {
  emit("update-row", localRow)
  isModal.value = false
}


const emitDelete = () => {
  emit("delete", props.row)
  isModal.value = false
}

const uploadImage = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = ev => {
    localRow.image = ev.target.result
    emit("update-image", props.row, ev.target.result)
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