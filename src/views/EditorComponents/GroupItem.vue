<template>
  <div>
    <div 
      class="group-header" 
      :class="{ 'not-printable': !isPrintable }"
    >
      <span>{{ getAlias(group.class) }}</span>
      
      <button 
        class="pdf-toggle-btn"
        @click.stop="togglePrintable"
        :title="isPrintable ? 'Исключить из PDF' : 'Включить в PDF'"
      >
        📄
      </button>
    </div>
    <RowItem
      v-for="(row, index) in group.rows"
      :key="row.id"
      :row="row"
      :index="index"
    />

  </div>

  
</template>

<script setup>
import { computed } from 'vue'
import RowItem from './RowItem.vue'
import { useSuppliersStore } from '@/stores/suppliers'
import { useMaterialsStore } from '@/stores/materials'

const suppliersStore = useSuppliersStore()
const materialsStore = useMaterialsStore()

const props = defineProps({
  group: Object,
  colWidths: Array,
})

const emit = defineEmits([
  'update-row', 
  'delete', 
  'update-image', 
  'toggle-printable'
])

// Вычисляем isPrintable
const isPrintable = computed(() => {
  const supplier = suppliersStore.suppliers.find(s => s.key === props.group.class)
  return supplier ? supplier.isPrintable !== false : true
})

// Функция getAlias
const getAlias = (className) => {
  const supplier = suppliersStore.suppliers.find(s => s.key === className)
  return supplier ? supplier.name : className
}

// Прокидываем события
const updateRow = (row) => emit('update-row', row)
const deleteRow = (row) => emit('delete', row)
const updateImage = (row, image) => emit('update-image', row, image)
const togglePrintable = () => emit('toggle-printable', props.group.class)
</script>

<style scoped>
.group-header {
  background: #e0f0ff;
  font-weight: bold;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
}

.group-header.not-printable {
  background: #f8d7da;
  color: #721c24;
}

.pdf-toggle-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.pdf-toggle-btn:hover {
  background: rgba(0,0,0,0.1);
}
</style>