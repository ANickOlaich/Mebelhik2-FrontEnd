<template>
  <div class="toolbar-right">
    <button @click="exportToPDF">Экспорт в PDF</button>
    <button @click="exportXLS">Экспорт в Excel</button>
    <button @click="exportXLS2">Экспорт в Excel2</button>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx-js-style'
// pdfMake — ставим в самый конец импортов
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import { useSuppliersStore } from '@/stores/suppliers'
import { useMaterialsStore } from '@/stores/materials'
import { useExcelStore } from '@/stores/excel'
const suppliersStore = useSuppliersStore()
const materialsStore = useMaterialsStore()
const excelStore = useExcelStore()

// Фикс vfs
pdfMake.vfs = pdfFonts.vfs


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



// Основная функция экспорта
async function exportToPDF() {

   let num=1
    const visibleGroups = excelStore.groupedView

  // ✔️ колонки
  const tableColumn = [
    '№',
    ...excelStore.visibleHeaders.map(h =>
      h === 'Количество в заказе' ? 'Кол-во' : h
    ),
    'Изобр.'
  ]

  const bodyRows = []

  for (const group of visibleGroups) {

    // ✔️ название группы
    const classNames = Array.isArray(group.classNames)
      ? group.classNames.join(', ')
      : group.className || ''

    const groupTitle = `${group.supplier?.name || ''} — ${group.type || ''} `

    bodyRows.push([
      {
        text: groupTitle,
        colSpan: tableColumn.length,
        style: 'group',
        alignment: 'center'
      },
      ...Array(tableColumn.length - 1).fill({})
    ])

    // ✔️ строки
    for (let i = 0; i < group.items.length; i++) {
      const row = group.items[i]

      const base64 = row.image
        ? await urlToBase64(row.image)
        : null

      bodyRows.push([
        (num).toString(),
        ...excelStore.visibleHeaders.map(h => row[h] || ''),
        base64
          ? { image: base64, width: 70, alignment: 'center' }
          : '—'
      ])
      num++
    }
  }

  const docDefinition = {
    pageOrientation: 'portrait',
    content: [
      { text: excelStore.projectName || 'Фурнитура', style: 'header' },
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
      header: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 5],
        alignment: 'center'
      },
      group: {
        bold: true,
        fillColor: '#e0f0ff',
        margin: [0, 1, 0, 1]
      }
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 9
    },
    pageMargins: [10, 15, 10, 30]
  }

  pdfMake
    .createPdf(docDefinition)
    .download((excelStore.projectName || 'Фурнитура') + ' - Матеріали та фурнітура.pdf')
}

async function exportXLS() {
  const data = []

  const headers = excelStore.visibleHeaders || []

  // ШАПКА
  data.push([excelStore.projectName || 'Матеріали'])
  data.push(['Зроблено за допомогою сервісу mebelshik.com.ua'])
  data.push(headers)

  const groups = excelStore.groupedView || []

  // ДАННЫЕ
  groups.forEach(group => {
    const groupTitle = [
      group.supplier?.name || 'Без поставщика',
      group.type || '',
      Array.isArray(group.classNames) ? group.classNames.join(', ') : ''
    ].filter(Boolean).join('\n')

    data.push([groupTitle])

    group.items.forEach(row => {
      const rowData = headers.map(h => {
        let val = row[h] ?? ''
        if (typeof val === 'string') {
          val = val.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        }
        return val
      })
      data.push(rowData)
    })
  })

  const ws = XLSX.utils.aoa_to_sheet(data)
  const lastCol = headers.length - 1

  const styleCell = (r, c, style) => {
    const addr = XLSX.utils.encode_cell({ r, c })
    if (!ws[addr]) ws[addr] = { v: '' }
    ws[addr].s = { ...ws[addr].s, ...style }
  }

  // Title
  styleCell(0, 0, {
    font: { bold: true, sz: 16 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  })
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } }]

  // Subtitle
  styleCell(1, 0, {
    font: { sz: 9, color: { rgb: '666666' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  })
  ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } })

  // Заголовки колонок
  for (let c = 0; c <= lastCol; c++) {
    styleCell(2, c, {
      font: { bold: true },
      fill: { fgColor: { rgb: 'D9D9D9' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'medium' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    })
  }

  // ====================== ГРУППЫ И ДАННЫЕ ======================
  let rowIndex = 3

  groups.forEach(group => {
    // Заголовок группы
    styleCell(rowIndex, 0, {
      font: { bold: true, sz: 12 },
      fill: { fgColor: { rgb: 'E6F0FF' } },
      alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'medium' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    })

    ws['!merges'].push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: lastCol } })

    rowIndex++

    // Строки материалов — текст по центру по высоте
    group.items.forEach(() => {
      for (let c = 0; c <= lastCol; c++) {
        const header = headers[c].toLowerCase()

        const style = {
          alignment: { 
            vertical: 'center',     // ← главное изменение
            wrapText: true 
          },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }

        // Центрирование по горизонтали для некоторых колонок
        if (header.includes('ед. изм') || header.includes('кол')) {
          style.alignment.horizontal = 'center'
        }

        styleCell(rowIndex, c, style)
      }
      rowIndex++
    })
  })

  // Ширина колонок
  ws['!cols'] = headers.map(h => {
    const lower = h.toLowerCase()
    if (lower.includes('наименование') || lower.includes('название')) return { wch: 70 }
    if (lower.includes('артикул')) return { wch: 18 }
    if (lower.includes('примечание')) return { wch: 30 }
    if (lower.includes('кол')) return { wch: 10 }
    return { wch: 15 }
  })

  // Экспорт
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Матеріали')

  const fileName = `${excelStore.projectName || 'Матеріали'} - експорт.xlsx`
  XLSX.writeFile(wb, fileName)
}

//---------------------------------------------------------



const urlToBuffer = async (url) => {
  if (!url) return null

  const fullUrl = url.startsWith('http')
    ? url
    : `http://localhost:3000${url}`

  try {
    const res = await fetch(fullUrl)
    if (!res.ok) return null

    const blob = await res.blob()
    const arrayBuffer = await blob.arrayBuffer()

    return {
      buffer: arrayBuffer,
      mime: blob.type
    }

  } catch {
    return null
  }
}



async function exportXLS2() {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Матеріали')

  const headers = excelStore.visibleHeaders || []
  const groups = excelStore.groupedView || []

  const extendedHeaders = [...headers, 'Фото']
  const lastCol = extendedHeaders.length

  // =========================
  // 📌 TITLE
  // =========================
  sheet.mergeCells(1, 1, 1, lastCol)

  const titleCell = sheet.getCell(1, 1)
  titleCell.value = excelStore.projectName || 'Матеріали'
  titleCell.font = { bold: true, size: 16 }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

  // =========================
  // 📌 SUBTITLE
  // =========================
  sheet.mergeCells(2, 1, 2, lastCol)

  const subCell = sheet.getCell(2, 1)
  subCell.value = 'Зроблено за допомогою сервісу mebelshik.com.ua'
  subCell.font = { size: 9, color: { argb: 'FF666666' } }
  subCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

  // =========================
  // 📌 HEADER ROW
  // =========================
  const headerRow = sheet.addRow(extendedHeaders)

  headerRow.eachCell((cell) => {
    cell.font = { bold: true }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9D9D9' }
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'medium' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }
  })

  // =========================
  // 📌 DATA START
  // =========================
  let rowIndex = 4

  for (const group of groups) {
    // -------------------------
    // GROUP TITLE
    // -------------------------
    const groupTitle = [
      group.supplier?.name || 'Без поставщика',
      group.type || '',
      Array.isArray(group.classNames) ? group.classNames.join(', ') : ''
    ].filter(Boolean).join(' | ')

    sheet.mergeCells(rowIndex, 1, rowIndex, lastCol)

    const gCell = sheet.getCell(rowIndex, 1)
    gCell.value = groupTitle
    gCell.font = { bold: true, size: 12 }
    gCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F0FF' }
    }
    gCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
    gCell.border = {
      top: { style: 'medium' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    }

    rowIndex++

    // -------------------------
    // ITEMS
    // -------------------------
    for (const row of group.items) {
      const rowValues = extendedHeaders.map(h => {
        if (h === 'Фото') {
          return row.imageUrl || row.image || ''
        }

        let val = row[h] ?? ''
        if (typeof val === 'string') {
          val = val.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        }
        return val
      })

      const excelRow = sheet.addRow(rowValues)

      excelRow.eachCell((cell, colNumber) => {
        const header = extendedHeaders[colNumber - 1]?.toLowerCase()

        cell.alignment = {
          vertical: 'middle',
          wrapText: true
        }

        if (header?.includes('ед. изм') || header?.includes('кол')) {
          cell.alignment.horizontal = 'center'
        }

        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      })

      // =========================
      // 🖼 MINI PREVIEW (если есть картинка)
      // =========================
      /*const imageUrl = row.imageUrl || row.image

      if (imageUrl) {
        try {
          const res = await fetch(imageUrl)
          const buffer = await res.arrayBuffer()

          const imageId = workbook.addImage({
            buffer: Buffer.from(buffer),
            extension: 'jpeg'
          })

          const imageCol = lastCol
          const imageRow = excelRow.number

          sheet.addImage(imageId, {
            tl: { col: imageCol - 1 + 0.15, row: imageRow - 1 + 0.1 },
            ext: { width: 60, height: 60 }
          })

          excelRow.height = 50
        } catch (e) {
          console.log('Image load error:', imageUrl)
        }
      }*/
     const img = await urlToBuffer(row.image)

      if (img) {
        const ext = img.mime.split('/')[1] || 'png'

        const imageId = workbook.addImage({
          buffer: Buffer.from(img.buffer),
          extension: ext
        })

        sheet.addImage(imageId, {
          tl: { col: 5, row: rowIndex },
          ext: { width: 60, height: 60 }
        })
      }

      rowIndex++
    }
  }

  // =========================
  // 📌 COLUMN WIDTHS
  // =========================
  sheet.columns = extendedHeaders.map(h => {
    const lower = h.toLowerCase()

    if (lower.includes('наименование') || lower.includes('название')) return { width: 70 }
    if (lower.includes('артикул')) return { width: 18 }
    if (lower.includes('примечание')) return { width: 30 }
    if (lower.includes('кол')) return { width: 10 }
    if (lower.includes('фото')) return { width: 12 }

    return { width: 15 }
  })

  // =========================
  // 📌 EXPORT
  // =========================
  const fileName = `${excelStore.projectName || 'Матеріали'} - експорт.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
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