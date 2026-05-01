<template>
  <div class="materials-excel">

    <div v-if="excelStore.loading" class="loading-state">
      Загрузка...
    </div>

    <div v-else-if="excelStore.error" class="error-message">
      {{ excelStore.error }}
    </div>



    <div v-else class="table-container">
          <label class="group-toggle">
          <input type="checkbox" v-model="excelStore.groupBySupplier" />
          Групувати класи одного постачальника
        </label>
        
      <!-- ШАПКА -->
      <div class="table-header" :style="{ gridTemplateColumns: gridTemplate }">
        <div
          v-for="h in excelStore.visibleHeaders"
          :key="h"
          class="th"
        >
          {{ h }}
        </div>

        <div class="th">Изображение</div>
        <div class="th">Действия</div>
      </div>

      <!-- ГРУППЫ -->
      <div v-for="group in groupedView" :key="group.className">
       <div class="group-header">

        <span>
          {{ group.supplier?.name || 'нет поставщика' }} — {{ group.type || 'без типа' }} — (
        </span>

        <span :title="getClassNames(group).join(', ')" class="supplier">
        <template v-if="getClassNames(group).length <= 2">
          {{ getClassNames(group).join(', ') }}
        </template>

        <template v-else>
          {{ getClassNames(group).slice(0, 2).join(', ') }}
          +{{ getClassNames(group).length - 2 }}
        </template>
      </span>
          )

      </div>

        <!-- СТРОКИ -->
        
      
        <div
          v-for="(row, idx) in group.items"
          :key="(row['Артикул'] || group.className || 'row') + '_' + idx"
          class="table-row"
          :style="{ gridTemplateColumns: gridTemplate }"
        >
          <div
            v-for="h in excelStore.visibleHeaders"
            :key="h"
            class="td"
          >
            {{ row[h] || '' }}
          </div>

          <!-- Изображение -->
         <div class="td image-cell">
            <!-- Skeleton -->
            <div v-if="row._imageLoading" class="image-skeleton"></div>

            <!-- Картинка с большим зумом -->
            <div v-else-if="row.image" class="image-wrapper">
              <img
                :src="getImageUrl(row.image)"
                alt=""
                class="product-image"
              />
            </div>

            <span v-else class="empty">—</span>
          </div>
          <!-- Действия -->
         <div class="td actions">


            <!-- редактировать -->
            <button
              class="btn-action"
              @click="editRow(row)"
              title="Редактировать"
            >
              ✏️
            </button>


            <!-- удалить -->
            <button
              class="btn-action"
              @click="deleteRow(row)"
              title="Удалить"
            >
              🗑️
            </button>

           

          </div>
        </div>
      </div>

    </div>
  </div>
  <MaterialModal
    :show="showEditModal"
    :is-edit="true"
    :initial-data="currentMaterial"
    :suppliers="suppliersStore?.suppliers || []"
    :is-admin="false"           
    @update:show="showEditModal = $event"
    @save="handleMaterialSave"
  />
</template>

<script setup>
import { computed,ref } from 'vue'
import { useExcelStore } from '@/stores/excel'
import { useSuppliersStore } from '@/stores/suppliers'
import MaterialModal from '@/views/Components/MaterialModal.vue'

const excelStore = useExcelStore()
const suppliersStore = useSuppliersStore()

const showEditModal = ref(false)
const currentMaterial = ref(null)
const groupBySupplier = ref(false)


// ==================== ШИРИНЫ ====================
const fixedWidths = {
  'Артикул': 140,
  'Ед. изм.': 80,
  'Ед. изм': 80,
  'Количество в заказе': 90,
  'Примечание': 160,
}

const defaultWidth = 140

// Открытие модалки
const editRow = (row) => {
  currentMaterial.value = { ...row }   // глубокая копия
  showEditModal.value = true
}

// Сохранение изменений
const handleMaterialSave = (updatedData) => {
  try {
    excelStore.updateRow(updatedData)
    showEditModal.value = false
  } catch (err) {
    console.error(err)
    alert('Не удалось сохранить изменения')
  }
}

// Определяем колонку "название"
const isNameColumn = (header) => {
  if (!header) return false
  const lower = header.toLowerCase()
  return lower.includes('наименование') || lower.includes('название')
}

// Главная магия — единая сетка
const gridTemplate = computed(() => {
  const cols = excelStore.visibleHeaders.map(h => {
    if (isNameColumn(h)) return '1fr'

    const width = fixedWidths[h] || defaultWidth
    return width + 'px'
  })

  cols.push('130px') // изображение
  cols.push('150px') // действия

  return cols.join(' ')
})

const deleteRow = (row) => {
  console.log(row)
  excelStore.removeRow(row.uid)
}

const groupedFlat = computed(() => excelStore.groupedByClass())


const order = {
  'Фурнітура': 0,
  'Плитні матеріали': 1,
  'Погонні матеріали': 2
}

   const groupedView = computed(() => excelStore.groupedView)

const getClassNames = (group) => {
  if (Array.isArray(group.classNames)) {
    return group.classNames
  }

  if (group.className) {
    return [group.className]
  }

  return []
}

const getImageUrl = (path) => {
  if (!path) return ''

  // если уже абсолютный URL — возвращаем как есть
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  // иначе считаем, что это локальный путь
  return import.meta.env.DEV
    ? `http://localhost:3000${path}`
    : path
}
</script>

<style scoped>
.materials-excel {
  padding: 16px;
}

/* Контейнер */
.table-container {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

/* ШАПКА */
.table-header {
  display: grid;
  background: #f0f0f0;
  font-weight: bold;
  border-bottom: 2px solid #ccc;
}

/* СТРОКА */
.table-row {
  display: grid;
  border-bottom: 1px solid #eee;
  transition: background 0.15s;
}

.table-row:hover {
  background: #fafafa;
}

/* ЯЧЕЙКИ */
.th,
.td {
  padding: 6px 8px;
  overflow: hidden;

  /* ВАЖНО: разрешаем перенос */
  white-space: normal;
  word-break: break-word;

  display: flex;
  align-items: center;
}



/* ГРУППА */
.group-header {
  padding: 8px 10px;
  background: #e9ecef;
  font-weight: bold;
  border-top: 1px solid #ccc;
}

.supplier {
  color: #666;
  font-weight: normal;
}

/* Логотип */
.supplier-logo {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* Название поставщика */
.supplier-name {
  align-items: center;
}

/* ИЗОБРАЖЕНИЕ */
.image-cell {
  justify-content: center;
}

.image-cell img {
  max-width: 80px;
  max-height: 60px;
  object-fit: contain;
}

.empty {
  color: #999;
}

/* ДЕЙСТВИЯ */
.actions {
  justify-content: center;
  gap: 6px;
}

.btn-action {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-action:hover {
  transform: scale(1.1);
}

/* СТАТУСЫ */
.loading-state {
  padding: 20px;
}

.error-message {
  color: red;
  padding: 20px;
}

.group-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.image-cell {
  width: 130px;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;           /* ← важно! позволяет выходить за границы */
}

.image-wrapper {
  position: relative;
  z-index: 1;
  transition: transform 0.25s ease;
}

.image-wrapper:hover {
  transform: scale(4);       /* увеличение в 4 раза */
  z-index: 20;                 /* чтобы было поверх других элементов */
}

.product-image {
  max-width: 80px;
  max-height: 60px;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.25s ease;
  cursor: zoom-in;
}

.image-wrapper:hover .product-image {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
}

.image-skeleton {
  width: 80px;
  height: 60px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: skeleton-loading 1.5s linear infinite;
}

.empty {
  color: #aaa;
  font-size: 18px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>