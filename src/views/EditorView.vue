<template>
  <div v-if="showUpload" class="file-upload">
  <label class="upload-label">
    <input 
      type="file" 
      accept=".xls,.xlsx" 
      @change="onFileChange" 
      hidden
    >
    <div class="upload-content">
      <span class="upload-icon">📊</span>
      <p class="upload-text">Оберіть файл Excel</p>
      <p class="upload-subtext">.xls або .xlsx</p>
    </div>
  </label>
</div>

<div v-if="materialsStore.headers.length" class="toolbar">
  <!-- Слева: добавления -->
  <div class="toolbar-left">
    <button @click="addRow">Додати строку</button>
    <Suppliers />
    <button @click="showUpload = true">Завантажити інший файл</button>
  </div>

  <!-- Справа: сохранения -->
  <div class="toolbar-right">
    <ExportPDF ref="exportPdfRef" :data="pdfData"/>
  </div>
</div>
 
  <div v-if="materialsStore.headers.length" class="table-container">
    <div style="text-align: center;">
        <b style="font-size: 18px; color: #333;">
            {{ meta }}
        </b>
    </div>
    </br>
    <!-- Шапка -->
    <div class="table-header">
      <div class="th" style="width:50px">№</div>
      <div v-for="(h, idx) in materialsStore.visibleHeaders" :key="h" class="th" :style="{ width: colWidths[idx] + 'px' }">
        {{ h }}
        <span class="resize-handle" @mousedown="startResize($event, idx)"></span>
      </div>
      <div class="th" style="width:140px">Малюнок</div>
    </div>

    <!-- Группы -->
    <GroupItem
    v-for="group in materialsStore.groupedRows"
    :key="group.class"
    :group="group"
    @toggle-printable="togglePrintable"
    />
  </div>
</template>

<script setup>
import { ref, computed,  onMounted } from 'vue'
import * as XLSX from 'xlsx-js-style'
import apiClient from '@/api/client.js'
import { useAuthStore } from '@/stores/auth'
import { defineStore } from 'pinia'
import { useSuppliersStore } from '@/stores/suppliers'
import { useMaterialsStore } from '@/stores/materials'

const suppliersStore = useSuppliersStore()
const materialsStore = useMaterialsStore()
const authStore = useAuthStore()

import GroupItem from './EditorComponents/GroupItem.vue'
import ExportPDF from './EditorComponents/ExportPDF.vue'
import Suppliers from './EditorComponents/Suppliers.vue'

const meta = ref("")
const rows = ref([])
const colWidths = ref([])
const showUpload = ref(true)

const pdfData = computed(() => ({
  meta: meta.value,
}))

let nextId = 0
let resizing = null



function onFileChange(e) {
  const file = e.target.files[0]
  materialsStore.handleFile(file, authStore.user)
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
  editRow(empty)  // открыть модалку для редактирования
}

const deleteRow = (row) => {
  const idx = rows.value.findIndex(r => r.id === row.id)
  if (idx > -1) rows.value.splice(idx, 1)
}


const updateRow = (updated) => {
  const idx = rows.value.findIndex(r => r.id === updated.id)
  if (idx !== -1) {
    rows.value.splice(idx, 1, { ...updated })
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