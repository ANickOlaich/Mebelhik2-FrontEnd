<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal">
      <h3>Добавить поставщика</h3>
      
      <div class="form">
        <div class="field">
          <label>Ключ (например: VIYAR1)</label>
          <input v-model="form.key" placeholder="VIYAR1" />
        </div>
        <div class="field">
          <label>Название</label>
          <input v-model="form.name" placeholder="Вияр Фурнитура" />
        </div>
        <div class="field">
          <label>Сайт</label>
          <input v-model="form.site" placeholder="viyar.ua" />
        </div>
        <div class="field">
          <label>Примечание</label>
          <input v-model="form.note" />
        </div>
        <div class="field checkbox-field">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isPrintable" />
            <span class="checkbox-custom"></span>
            Конвертировать в PDF
          </label>
        </div>
        <div class="field">
          <label>Порядок сортировки</label>
          <input type="number" v-model="form.sortOrder" />
        </div>
      </div>

      <div class="actions">
        <button @click="close">Отмена</button>
        <button @click="save" class="save-btn">Добавить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'add'])

const form = ref({
  key: '',
  name: '',
  site: '',
  note: '',
  isPrintable: true,
  sortOrder: 10
})

const close = () => {
  form.value = { key: '', name: '', site: '', note: '', isPrintable: true, sortOrder: 10 }
  emit('close')
}

const save = () => {
  if (!form.value.key || !form.value.name) {
    alert('Ключ и название обязательны')
    return
  }
  emit('add', { ...form.value })
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  width: 420px;
  padding: 20px;
  border-radius: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}

.field label {
  
  margin-bottom: 4px;
  font-weight: 500;
}

.field input {
  width: 100%;
  padding: 8px 1px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.save-btn {
  background: #27ae60;
  color: white;
}

.save-btn:hover {
  background: #219653;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 7px solid #ccc;
  border-radius: 4px;
  background: white;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s;
}

.checkbox-input:checked + .checkbox-custom {
  background: #27ae60;
  border-color: #27ae60;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 16px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>