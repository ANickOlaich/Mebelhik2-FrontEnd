<template>
  <div class="toolbar-right">
    <button @click="exportToPDF">Экспорт в PDF</button>
    <button @click="exportXLS">Экспорт в Excel</button>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import * as XLSX from 'xlsx-js-style'
// pdfMake — ставим в самый конец импортов
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import { useSuppliersStore } from '@/stores/suppliers'
import { useMaterialsStore } from '@/stores/materials'
const suppliersStore = useSuppliersStore()
const materialsStore = useMaterialsStore()

// Фикс vfs
pdfMake.vfs = pdfFonts.vfs

// Получаем данные от родителя
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const urlToBase64 = async (url) => {
  if (!url) return null
  const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`
  try {
    const res = await fetch(fullUrl)
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

const getAlias = (className) => {
  const supplier = suppliersStore.suppliers.find(s => s.key === className)
  return supplier ? supplier.name : className
}
// Основная функция экспорта
async function exportToPDF() {
    const data = props.data
  console.log('Экспортируем данные:', data)

  const visibleGroups = materialsStore.groupedRows.filter(group => {
    const supplier = suppliersStore.suppliers.find(s => s.key === group.class)
    return supplier ? supplier.isPrintable : true
  })

  const tableColumn = [
    '№',
    ...materialsStore.visibleHeaders.map(h => h === 'Количество в заказе' ? 'Кол-во' : h),
    'Изобр.'
  ]

  // Конвертируем все изображения в base64
  const bodyRows = await Promise.all(
    visibleGroups.flatMap(group => [
      [{ 
        text: getAlias(group.class), 
        colSpan: tableColumn.length, 
        style: 'group', 
        alignment: 'center' 
      }, {}, {}, {}, {}, {}, {}],
      ...group.rows.map(async (row, i) => {
        const base64 = row.image ? await urlToBase64(row.image) : null
        return [
          (i + 1).toString(),
          ...materialsStore.visibleHeaders.map(h => row[h] || ''),
          base64 ? { image: base64, width: 70, alignment: 'center' } : '—'
        ]
      })
    ])
  )

  const docDefinition = {
    pageOrientation: 'portrait',
    content: [
      { text: data.meta || 'Фурнитура', style: 'header' },
      {
        table: {
          headerRows: 1,
          widths: [15, 60, '*', 30, 30, 50, 70],
          body: [tableColumn, ...bodyRows]
        }
      }
    ],
    footer: function(currentPage, pageCount) {
      return { 
        text: `Сторінка ${currentPage} з ${pageCount}. Зроблено за допомогою сервісу mebelshik.com.ua`, 
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
    defaultStyle: { font: 'Roboto', fontSize: 9 },
    pageMargins: [10, 15, 10, 30]
  }

  pdfMake.createPdf(docDefinition).download((data.meta || 'Фурнитура') + ' - Матеріали та фурнітура.pdf')
}

async function exportXLS() {
    const dd=props.data
  let data = []

  data.push([dd.meta || 'Фурнитура'])
  data.push(['Зроблено за допомогою сервісу mebelshik.com.ua'])

  const tableHeaders = materialsStore.headers.filter(h => h !== 'Класс')
  data.push(tableHeaders)

  materialsStore.groupedRows.forEach(group => {
    const groupName = getAlias(group.class) || group.class
    data.push([groupName])
    group.rows.forEach(row => {
      data.push(tableHeaders.map(h => row[h] ?? ''))
    })
  })

  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!merges'] = []

  const lastCol = tableHeaders.length - 1

  let addr

  // Название
  addr = XLSX.utils.encode_cell({r: 0, c: 0})
  ws[addr] = ws[addr] || { v: data[0][0] }
  ws[addr].s = { 
    font: { bold: true, sz: 16 }, 
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} }
  }
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } })

  // Нижняя строка
  addr = XLSX.utils.encode_cell({r: 1, c: 0})
  ws[addr] = ws[addr] || { v: data[1][0] }
  ws[addr].s = { 
    font: { sz: 9, color: { rgb: "666666" } }, 
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} }
  }
  ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } })

  // Шапка
  for (let c = 0; c <= lastCol; c++) {
    addr = XLSX.utils.encode_cell({r: 2, c})
    ws[addr] = ws[addr] || { v: data[2][c] }
    ws[addr].s = { 
      font: { bold: true }, 
      fill: { fgColor: { rgb: "CCCCCC" } }, 
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} }
    }
  }

  // Группы + данные
  let r = 3
  materialsStore.groupedRows.forEach(group => {
    // шапка группы
    addr = XLSX.utils.encode_cell({r, c: 0})
    ws[addr] = ws[addr] || { v: getAlias(group.class) || group.class }
    ws[addr].s = { 
      font: { bold: true, sz: 12 }, 
      fill: { fgColor: { rgb: "E0F0FF" } }, 
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} }
    }
    ws['!merges'].push({ s: { r, c: 0 }, e: { r, c: lastCol } })
    r++

    // строки группы
    group.rows.forEach(rowData => {
      for (let c = 0; c <= lastCol; c++) {
        addr = XLSX.utils.encode_cell({r, c})
        ws[addr] = ws[addr] || { v: rowData[c] || '' }
        ws[addr].s = { 
          alignment: { vertical: "center", wrapText: true },
          border: { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} }
        }
      }
      r++
    })
  })

  ws['!margins'] = { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5 }

  ws['!cols'] = [
    { wch: 9 }, { wch: 58 }, { wch: 15 }, { wch: 6 }, 
    { wch: 6 }, { wch: 15 }, { wch: 15 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Фурнітура та матеріали")

  // Нормальное название файла
  const fileName = `${(materialsStore.meta.value || '')} - Фурнітура та матеріали.xlsx`
  XLSX.writeFile(wb, fileName)
}


// Даем родителю доступ к функции
defineExpose({
  exportToPDF
})
</script>
<style scoped>
.toolbar-right {
  display: flex;
  gap: 8px;
}
.toolbar-right button {
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}
</style>