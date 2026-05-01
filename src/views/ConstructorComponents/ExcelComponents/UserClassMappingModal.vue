<template>
  <!-- КНОПКА ОТКРЫТИЯ -->
  <button
    v-if="!isOpen"
    class="btn-add"
    @click="open"
  >
    Налаштувати класи матеріалів
  </button>

  <!-- ОСНОВНАЯ МОДАЛКА -->
  <div
    v-if="isOpen"
    class="modal"
    @click.self="close"
  >
    <div class="modal-content">

      <h2>Зіставлення класів</h2>

      <div v-if="userClassStore.loading">
        Загрузка...
      </div>

      <div v-else class="list">

        <div
          v-for="cls in userClassStore.classes"
          :key="cls.id"
          class="row"
        >

          <!-- название класса -->
          <div class="class-name">
            {{ cls.className }}
          </div>

          <!-- выбор поставщика -->
          <div class="supplier-select">

            <select
              :value="getSupplierId(cls)"
              @change="onSupplierChange(cls, $event.target.value)"
            >
              <option value="">— не обрано —</option>

              <option
                v-for="s in suppliersStore.suppliers"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </option>
            </select>

           

          </div>

          <!-- тип -->
          <div class="type-select">
            <select
              :value="getType(cls)"
              @change="onTypeChange(cls, $event.target.value)"
            >
              <option value="Плитні матеріали">Плитні матеріали</option>
              <option value="Погонні матеріали">Погонні матеріали</option>
              <option value="Фурнітура">Фурнітура</option>
              <option value="Проче">Проче</option>
              <option value="Загальне">Загальне</option>
            </select>
          </div>

        </div>
      </div>

      <!-- footer -->
      <div class="actions">
         <button
              class="btn-add-inline"
              @click="openAddModal(cls)"
            >
              +
            </button>
        <button class="btn-save-all" @click="saveAll">
          💾 Зберегти все
        </button>

        <button class="btn-close" @click="close">
          Закрыть
        </button>
      </div>

    </div>
  </div>

  <!-- МОДАЛКА ДОБАВЛЕНИЯ ПОСТАВЩИКА -->
  <div
    v-if="showAddModal"
    class="modal"
    @click.self="showAddModal = false"
  >
    <div class="modal-content">

      <h3>Новий постачальник</h3>

      <input
        v-model="newSupplier.name"
        placeholder="Назва"
      />

      <input
        v-model="newSupplier.site"
        placeholder="Сайт (необов'язково)"
      />

      <div class="actions">
        <button @click="createSupplier">
          Створити
        </button>

        <button @click="showAddModal = false">
          Відміна
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useUserClassStore } from '@/stores/userClass'
import { useSuppliersStore } from '@/stores/suppliers'

const userClassStore = useUserClassStore()
const suppliersStore = useSuppliersStore()

// ========================
// ОТКРЫТИЕ
// ========================
const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

// ========================
// ЛОКАЛЬНЫЕ ИЗМЕНЕНИЯ
// ========================
const supplierIdMap = reactive({})
const typeMap = reactive({})

// supplier
const onSupplierChange = (cls, value) => {
  supplierIdMap[cls.id] = value ? Number(value) : null
}

// type
const onTypeChange = (cls, value) => {
  typeMap[cls.id] = value
}

// ========================
// GETTERS
// ========================
const getSupplierId = (cls) => {
  if (supplierIdMap[cls.id] !== undefined) {
    return supplierIdMap[cls.id]
  }
  return cls.supplierId || ''
}

const getType = (cls) => {
  return typeMap[cls.id] || cls.type || ''
}

// ========================
// СОХРАНЕНИЕ
// ========================
const saveAll = async () => {
  try {
    const updates = userClassStore.classes.map(cls => ({
      id: cls.id,
      supplierId:
        supplierIdMap[cls.id] !== undefined
          ? supplierIdMap[cls.id]
          : cls.supplierId,
      type: typeMap[cls.id] ?? cls.type
    }))

    await userClassStore.updateMany(updates)

    Object.keys(supplierIdMap).forEach(k => delete supplierIdMap[k])
    Object.keys(typeMap).forEach(k => delete typeMap[k])

  } catch (err) {
    console.error(err)
    alert('Ошибка сохранения')
  }
}

// ========================
// ДОБАВЛЕНИЕ ПОСТАВЩИКА
// ========================
const showAddModal = ref(false)
const currentClass = ref(null)

const newSupplier = reactive({
  name: '',
  site: ''
})

const openAddModal = (cls) => {
  currentClass.value = ''
  showAddModal.value = true
}

const createSupplier = async () => {
  try {
    const supplier = await suppliersStore.createSupplier({
      name: newSupplier.name,
      site: newSupplier.site
    })

    console.log('supplier after await:', supplier)

   /* if (!supplier) {
      throw new Error('supplier undefined after await')
    }
*/
    supplierIdMap[currentClass.value.id] = supplier.id

  } catch (err) {
    //console.error('COMPONENT ERROR:', err)
  }
}

// ========================
// INIT
// ========================
onMounted(async () => {
  await Promise.all([
    userClassStore.fetchClasses(),
    suppliersStore.fetchUserSuppliers()
  ])
})
</script>

<style scoped>

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 1000;
}

.modal-content {
  width: 700px;
  max-width: 95%;
  max-height: 90vh; /* ключевое */
  
  background: #fff;
  border-radius: 10px;

  display: flex;
  flex-direction: column; /* важно */
  
  overflow: hidden; /* чтобы не вылезало */
}

/* заголовок фиксированный */
.modal-content h2 {
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #eee;
}

/* список скроллится */
.list {
  flex: 1; /* занимает всё доступное */
  overflow-y: auto;
  padding: 10px 16px;
}

/* строки */
.row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

/* футер фиксированный */
.actions {
  padding: 12px 16px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}
</style>

