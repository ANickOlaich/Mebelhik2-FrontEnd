<template>
  <div v-if="showUpload" class="file-upload">
  <label class="upload-label">
    <input 
      type="file" 
      accept=".xls,.xlsx" 
      @change="handleFile" 
      hidden
    >
    <div class="upload-content">
      <span class="upload-icon">📊</span>
      <p class="upload-text">Оберіть файл Excel</p>
      <p class="upload-subtext">.xls або .xlsx</p>
    </div>
  </label>
</div>

<div v-if="headers.length" class="toolbar">
  <!-- Слева: добавления -->
  <div class="toolbar-left">
    <button @click="addRow">Додати строку</button>
    <button @click="showAddSupplierModal = true">Додати постачальника</button>
    <button @click="showUpload = true">Завантажити інший файл</button>
  </div>

  <!-- Справа: сохранения -->
  <div class="toolbar-right">
    <button @click="saveXLS">Зберегти XLS</button>
    <button @click="savePDF">Зберегти PDF</button>
    <button @click="savePDF2">Зберегти PDF (jsPDF)</button>
  </div>
</div>
 
  <div v-if="headers.length" class="table-container">
    <div style="text-align: center;">
        <b style="font-size: 18px; color: #333;">
            {{ meta }}
        </b>
    </div>
    </br>
    <!-- Шапка -->
    <div class="table-header">
      <div class="th" style="width:50px">№</div>
      <div v-for="(h, idx) in visibleHeaders" :key="h" class="th" :style="{ width: colWidths[idx] + 'px' }">
        {{ h }}
        <span class="resize-handle" @mousedown="startResize($event, idx)"></span>
      </div>
      <div class="th" style="width:140px">Малюнок</div>
    </div>

    <!-- Группы -->
    <GroupItem
    v-for="group in groupedRows"
    :key="group.class"
    :group="group"
    :headers="visibleHeaders"
    :col-widths="colWidths"
    :suppliers="suppliers"
    @update-row="updateRow"
    @delete="deleteRow"
    @update-image="updateImage"
    @toggle-printable="togglePrintable"
    />
  </div>
  <AddSupplierModal
  :is-open="showAddSupplierModal"
  @close="showAddSupplierModal = false"
  @add="addSupplier"
/>
</template>

<script setup>
import { ref, computed,  onMounted } from 'vue'
import * as XLSX from 'xlsx'
import html2pdf from "html2pdf.js"
import apiClient from '@/api/client.js'
import { useAuthStore } from '@/stores/auth'

// pdfMake — ставим в самый конец импортов
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'

// Фикс vfs
pdfMake.vfs = pdfFonts.vfs


//import RowItem from './EditorComponents/RowItem.vue'
import GroupItem from './EditorComponents/GroupItem.vue'
import AddSupplierModal from './EditorComponents/AddSupplierModal.vue'

const meta = ref("")
const headers = ref([])           // все заголовки из файла
const visibleHeaders = ref([])    // без "Класс"
const rows = ref([])
const colWidths = ref([])
const showAddSupplierModal = ref(false)
const showUpload = ref(true)
const authStore = useAuthStore()

let nextId = 0
let resizing = null

const suppliers = ref([])
const loading = ref(true)
const error = ref(null)

const fetchSuppliers = async () => {
  try {
    const res = await apiClient.get('/suppliers')
    suppliers.value = res.data
  } catch (err) {
    error.value = 'Ошибка загрузки поставщиков'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Добавление нового поставщика
const addSupplier = async (newSupplier) => {
  if (authStore.user) {
    try {
      await apiClient.post('/suppliers', newSupplier)
      await fetchSuppliers()        // обновляем список
    } catch (err) {
      alert('Ошибка при добавлении поставщика')
    }
  }else{
      suppliers.value.push(newSupplier)
      suppliers.value.sort((a, b) => a.sortOrder - b.sortOrder)
  }
}



/*
const suppliers = ref([
  { key: 'NONE', name: 'Невідомий постачальник', site: '', note: '', isPrintable: false, sortOrder: 0 },
  //Фурнитура
  { key: 'VIYAR1', name: 'Вияр Фурнитура', site: 'viyar.ua', note: '', isPrintable: true, sortOrder: 10 },
  { key: 'KRONA1', name: 'Kronas Фурнитура', site: 'kronas.com.ua', note: '', isPrintable: true, sortOrder: 11 }, 
  { key: 'VIDAL1', name: 'VidaLux Фурнитура', site: 'vidalux.ua', note: '', isPrintable: true, sortOrder: 12 },
  { key: 'OWWA1', name: 'OWWA Фурнитура', site: '', note: '', isPrintable: true, sortOrder: 13 },
  { key: 'GTV1', name: 'GTV Фурнитура', site: '', note: '', isPrintable: true, sortOrder: 14 },
  { key: 'MEBTE1', name: 'Меблеві Технології Фурнитура', site: '', note: '', isPrintable: true, sortOrder: 15 },
  //Крепеж
   { key: 'VIYAR3', name: 'Вияр Крепеж', site: 'viyar.ua', note: '', isPrintable: true, sortOrder: 101 },
  { key: 'KRONA3', name: 'Kronas Крепеж', site: 'kronas.com.ua', note: '', isPrintable: true, sortOrder: 102 },
  //Плитные Материалы
  { key: 'VIYAR4', name: 'Вияр Плитные материалы', site: 'viyar.ua', note: '', isPrintable: true, sortOrder: 201 },
  { key: 'VIYAR5', name: 'Вияр Столешницы', site: 'viyar.ua', note: '', isPrintable: true, sortOrder: 202 },
  { key: 'KRONA4', name: 'Kronas Плитные материалы', site: 'kronas.com.ua', note: '', isPrintable: true, sortOrder: 203 },
   { key: 'KRONA5', name: 'Kronas Плитные Столешницы', site: 'kronas.com.ua', note: '', isPrintable: true, sortOrder: 204 },
  //Кромки
  { key: 'VIYAR2', name: 'Вияр Кромки', site: 'viyar.ua', note: '', isPrintable: true, sortOrder: 301 },
   { key: 'KRONA2', name: 'Kronas Кромки', site: 'kronas.com.ua', note: '', isPrintable: true, sortOrder: 302 },
  { key: 'SKLAD', name: 'Склад Фурнитура', site: '', note: '', isPrintable: false, sortOrder: 400 },

])
*/
const getAlias = (className) => {
  const supplier = suppliers.value.find(s => s.key === className)
  return supplier ? supplier.name : className
}



const getSortOrder = (classKey) => {
  const supplier = suppliers.value.find(s => s.key === classKey)
  return supplier ? supplier.sortOrder : 9999
}

const groupedRows = computed(() => {
  const map = new Map()

  rows.value.forEach(row => {
    const cls = row['Класс']?.trim() || 'Без класса'

    if (!map.has(cls)) {
      map.set(cls, { class: cls, rows: [] })
    }

    map.get(cls).rows.push(row)
  })

  return Array.from(map.values())
    .sort((a, b) => getSortOrder(a.class) - getSortOrder(b.class))
})

const handleFile = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    const wb = XLSX.read(ev.target.result, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 })

    const headerIndex = json.findIndex(row => row && row[0] === 'Артикул')
    if (headerIndex === -1) return alert('Строка "Артикул" не найдена')

    meta.value = json[4][1] ?? ""
    headers.value = json[headerIndex] || []

    visibleHeaders.value = headers.value.filter(h => h !== 'Класс')
    colWidths.value = visibleHeaders.value.map(h => {
      if (h === 'Артикул') return 200
      if (h === 'Примечание') return 200
      if (h === 'Ед. изм.') return 100
      if (h.includes('Количеств') || h.includes('в заказе')) return 100
      if (h === 'Наименование материала') return 400
      return 300
    })

    rows.value = json.slice(headerIndex + 1).map(r => {
      const obj = { id: nextId++, image: '' }
      headers.value.forEach((h, i) => obj[h] = r[i] ?? '')
/*
      // Присваиваем NONE если класс не найден в suppliers
      const cls = obj['Класс']?.trim()
      if (!cls || !suppliers.value.some(s => s.key === cls)) {
        obj['Класс'] = 'NONE'
      }
*/
      return obj
    }).filter(row => Object.values(row).some(v => v !== ''))
  }
  reader.readAsArrayBuffer(file)
  showUpload.value = false
}

const togglePrintable = (classKey) => {
  const supplier = suppliers.value.find(s => s.key === classKey)
  if (supplier) {
    supplier.isPrintable = !supplier.isPrintable
  }
}

const addRow = () => {
  const empty = { id: nextId++, image: '', 'Класс': 'NONE'  }
  headers.value.forEach(h => empty[h] = '')
  rows.value.push(empty)
}

const deleteRow = (row) => {
  const idx = rows.value.findIndex(r => r.id === row.id)
  if (idx > -1) rows.value.splice(idx, 1)
}

const updateRow = (updated) => {
  const idx = rows.value.findIndex(r => r.id === updated.id)
  if (idx > -1) {
    rows.value[idx] = { ...updated }
  }
}

const updateImage = (row, dataUrl) => {
  row.image = dataUrl
}

const startResize = (e, idx) => {
  resizing = { idx, startX: e.pageX, startWidth: colWidths.value[idx] }
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
}

const doResize = (e) => {
  if (!resizing) return
  const diff = e.pageX - resizing.startX
  colWidths.value[resizing.idx] = Math.max(60, resizing.startWidth + diff)
}

const stopResize = () => {
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
  resizing = null
}

/*

*/
const saveXLS = () => {
  const data = [headers.value, ...rows.value.map(r => headers.value.map(h => r[h] ?? ''))]
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Фурнитура")
  XLSX.writeFile(wb, "фурнитура.xlsx")
}

const savePDF = () => {
  const element = document.getElementsByClassName("table-container")[0]

  html2pdf()
    .from(element)
    .set({
      margin: 5,
      filename: meta.value+".pdf",
      html2canvas: { 
        scale: 2,
        //width: element.scrollWidth   // важно для корректного масштаба
      },
      jsPDF: { 
        format: "a4", 
        orientation: "landscape",
        unit: "mm"
      }
    })
    .save()
}



const savePDF2 = () => {
  // Фильтруем только тех поставщиков, у кого isPrintable: true
  const visibleGroups = groupedRows.value.filter(group => {
    const supplier = suppliers.value.find(s => s.key === group.class)
    return supplier ? supplier.isPrintable : true
  })

  const tableColumn = [
    '№',
    ...visibleHeaders.value.map(h => h === 'Количество в заказе' ? 'Кол-во' : h),
    'Изобр.'
  ]

  const docDefinition = {
    pageOrientation: 'portrait',
    
    content: [
      { text: meta.value || 'Фурнитура', style: 'header' },
      {
        table: {
          headerRows: 1,
          widths: [15, 60, '*', 30, 30, 50, 50],
          body: [
            tableColumn,
            ...visibleGroups.flatMap(group => [
              [{ 
                text: getAlias(group.class), 
                colSpan: tableColumn.length, 
                style: 'group', 
                alignment: 'center' 
              }, {}, {}, {}, {}, {}, {}],
              ...group.rows.map((row, i) => [
                (i + 1).toString(),
                ...visibleHeaders.value.map(h => row[h] || ''),
                row.image 
                  ? { image: row.image, width: 40, alignment: 'center' } 
                  : '—'
              ])
            ])
          ]
        }
      }
    ],
    footer: function(currentPage, pageCount) {
      return {
        text: 'Зроблено за допомогою сервісу mebelshik.com.ua',
        alignment: 'center',
        fontSize: 7,
        color: '#666666',
        margin: [0, 10, 0, 0]
      }
    },
    styles: {
      header: { fontSize: 14, bold: true, margin: [0, 0, 0, 5], alignment: 'center' },
      group: { bold: true, fillColor: '#e0f0ff', margin: [0, 1, 0, 1] }
    },
    defaultStyle: { 
      font: 'Roboto',
      fontSize: 9 
    },
    pageMargins: [10, 15, 10, 30]
  }

  pdfMake.createPdf(docDefinition).download((meta.value || 'Фурнитура') + ' - Матеріали та фурнітура.pdf')
}
// Запускаем загрузку ТОЛЬКО если пользователь авторизован
onMounted(() => {
  if (authStore.user) {
    fetchSuppliers()
  } else {
    loading.value = false
  }
})
</script>

<style>
.table-container { width: 100%; overflow-x: auto; }
.table-header, .table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
}
.th, .td {
  padding: 8px 6px;
  border-right: 1px solid #ccc;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.th { 
  background: #f5f5f5; 
  font-weight: bold; 
  position: relative; 
  user-select: none;
}
.group-header {
  background: #e0f0ff;
  font-weight: bold;
  padding: 8px 6px;
  border-bottom: 1px solid #ccc;
}
.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  background: #ddd;
}
.resize-handle:hover { background: #999; }

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
}

.toolbar button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: #4a90e2;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.toolbar button:hover {
  background: #357abd;
}

.toolbar-left button {
  background: #27ae60;
}

.toolbar-left button:hover {
  background: #219653;
}

.file-upload {
  margin-bottom: 20px;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-content {
  border: 2px dashed #3498db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s;
  background: #f8fbff;
}

.upload-content:hover {
  border-color: #2980b9;
  background: #f0f7ff;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px 0;
}

.upload-subtext {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}
</style>