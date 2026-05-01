<template>
  <div class="toolbar-right">
    <button @click="openModal">Класи та постачальники</button>
  </div>

  <!-- MODAL -->
  <div v-if="isModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h3>Класи та постачальники</h3>

      <div class="list">
        <div
          v-for="cls in materialsStore.uniqueClasses"
          :key="cls"
          class="row"
        >
          <div class="col-class">
            {{ cls }}
          </div>

          <!-- DISPLAY MODE -->
          <div v-if="editClass !== cls" class="col-supplier">
            {{ getSupplierName(cls) || '—' }}
          </div>

          <!-- EDIT MODE -->
          <div v-else class="col-supplier">
            <input
              list="suppliers"
              :value="editValue"
              @input="editValue = $event.target.value"
              placeholder="Выберите поставщика"
            />
          </div>

          <div class="col-actions">
            <button v-if="editClass !== cls" @click="startEdit(cls)">
              Редактировать
            </button>

            <template v-else>
              <button @click="saveEdit(cls)">Сохранить</button>
              <button @click="cancelEdit">Отмена</button>
            </template>
          </div>
        </div>
      </div>

      <datalist id="suppliers">
        <option
          v-for="s in suppliersStore.suppliers"
          :key="s.key"
          :value="s.name"
        />
      </datalist>

      <div class="actions">
        <button @click="closeModal">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSuppliersStore } from '@/stores/suppliers'
import { useMaterialsStore } from '@/stores/materials'
import apiClient from '@/api/client.js'

const suppliersStore = useSuppliersStore()
const materialsStore = useMaterialsStore()

const isModal = ref(false)

/**
 * локальный mapping: class -> supplierKey
 */
const classMap = ref({})

/**
 * редактирование состояния
 */
const editClass = ref(null)
const editValue = ref('')

/**
 * helpers
 */
const getSupplierByKey = (key) =>
  suppliersStore.suppliers.find(s => s.key === key)

const getSupplierName = (cls) => {
  const supplierId = classMap.value[cls]
  const supplier = suppliersStore.suppliers.find(
    s => s.id === supplierId || s.name === supplierId
  )

  return supplier?.name || ''
}

/**
 * открыть модалку + загрузка данных
 */
const openModal = () => {
  const map = {}

  materialsStore.uniqueClasses.forEach(cls => {
    map[cls] = suppliersStore.classSupplierMap?.[cls] || null
  })

  classMap.value = map
  isModal.value = true
}

/**
 * редактирование
 */
const startEdit = (cls) => {
  editClass.value = cls
  editValue.value = getSupplierName(cls)
}

const cancelEdit = () => {
  editClass.value = null
  editValue.value = ''
}

/**
 * сохранить одну запись
 */
const saveEdit = async (cls) => {
  try {
    const value = editValue.value.trim()

    if (!value) return

    await apiClient.put(`/suppliers/map-classes/${cls}`, {
      supplierName: value
    })

    // локальное обновление UI
    classMap.value[cls] = value

    editClass.value = null
    editValue.value = ''

  } catch (e) {
    console.error(e)
  }
}

const closeModal = () => {
  isModal.value = false
  editClass.value = null
}

onMounted(() => {
  suppliersStore.fetchSuppliers()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 8px;
}

.list {
  margin-top: 15px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr 160px;
  gap: 10px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.col-class {
  font-weight: 500;
}

.col-supplier input {
  width: 100%;
  padding: 6px;
}

.col-actions {
  display: flex;
  gap: 5px;
}

.actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>