<template>
  <div v-if="showUpload" class="file-upload">
    <ExcelUpload @loaded="onExcelLoaded" />
    
  </div>
  <div v-else>
    <div class="toolbar">
      <UserClassMappingModal/>
      <AddMaterialModal/>
        <Exports/>
    </div>
    <!-- Состояние загрузки -->
   <div v-if="excelStore.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Обробка файлу...</p>
    </div>
    <!-- Ошибка -->
    <div v-else-if="excelStore.error" class="error-message">
      {{ excelStore.error }}
    </div>

     <!-- Заголовок проекта -->
    <div v-if="excelStore.projectName" class="project-header">
      <h1>{{ excelStore.projectName }}</h1>
    </div>

    <!-- Таблица материалов -->
    <MaterialsGroupedTable 
      v-if="excelStore.rows.length" 
    />

  </div>
 
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useExcelStore } from '@/stores/excel'
import { useSuppliersStore } from '@/stores/suppliers'

import ExcelUpload from '../ExcelComponents/ExcelLoaded.vue'
import UserClassMappingModal from '../ExcelComponents/UserClassMappingModal.vue'
import MaterialsGroupedTable from './MaterialsGroupedTable.vue'
import Exports from './Exports.vue'
import AddMaterialModal from './AddMaterialModal.vue'

const excelStore = useExcelStore()
const suppliersStore = useSuppliersStore()
const showUpload = ref(true)

const onExcelLoaded = () => {
  showUpload.value = false
}

onMounted(async () => {
  await suppliersStore.fetchSuppliers()
})

</script>