import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'
import apiClient from '@/api/client.js'
import { useUserClassStore } from '@/stores/userClass'

export const useExcelStore = defineStore('excel', {
  state: () => ({
    projectName: '',
    headers: [],
    rows: [],
    syncRows: [], // для хранения данных после синхронизации с бэком
    loading: false,
    error: null,
    groupBySupplier: false,
    
  }),

  actions: {
   async addMaterial(material) {
      const normalize = (v) => (v || '').trim().toUpperCase()

      const article = normalize(material.article)
      const materialClass = normalize(material.class)

      const existingRow = this.rows.find(row => {
        return (
          normalize(row['Артикул']) === article &&
          normalize(row['Класс']) === materialClass
        )
      })

      // ❗ уже существует
      if (existingRow) {
        //existingRow['Количество в заказе'] += material.quantity || 1

        return {
          success: false,
          message: 'Матеріал вже існує',
          row: existingRow
        }
      }

      // ➕ новый материал
      const newRow = {
        id: Date.now(),

        'Артикул': material.article || '',
        'Наименование материала': material.name || '',
        'Ед. изм.': material.unit || 'компл',
        'Количество в заказе': material.quantity || 1,
        'Примечание': material.note || '',
        'Класс': material.class || ''
      }

      this.rows.push(newRow)

      await this.syncMaterials()
      this.syncImages()

      return {
        success: true,
        message: 'Матеріал додано',
        row: newRow
      }
    },
    async loadFile(file) {
      this.loading = true
      this.error = null

      try {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)

        const sheet = workbook.Sheets[workbook.SheetNames[0]]

        const json = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: ''
        })
        console.log('parseSheet')
        this.parseSheet(json)
        console.log('После JSON', this.rows)
        await this.syncClasses() // Синхронизация классов после загрузки файла
        console.log('После синхронизации классов', this.rows)
        this.addedUid()
        console.log('Добавил uid', this.rows)
        //await this.syncMaterials() // Синхронизация материалов после загрузки файл

        await this.syncMaterials() // Синхронизация материалов после загрузки файл
        console.log('После синхронизации c базой', this.rows)
        console.log('syncImages')
        this.syncImages() // Фоновая загрузка картинок (не блокирует интерфейс)
        

      } catch (err) {
        console.error(err)
        this.error = err.message || 'Ошибка чтения файла'
      } finally {
        this.loading = false
      }
    },

    parseSheet(data) {
      let projectRowIndex = -1
      let headerRowIndex = -1


      // 🔍 поиск ключевых строк (устойчивый)
      data.forEach((row, i) => {
        const firstCell = String(row[0] || '')
          .trim()
          .toLowerCase()

        if (firstCell.includes('изделие')) {
          projectRowIndex = i
        }

        if (firstCell.includes('артикул')) {
          headerRowIndex = i
        }
      })

      if (projectRowIndex === -1) {
        //throw new Error('Не найдена строка "Изделие"')
        projectRowIndex = 0
      }

      if (headerRowIndex === -1) {
        throw new Error('Не найдена строка "Артикул"')
      }

      // ✔ название проекта
      this.projectName = String(data[projectRowIndex][1] || '').trim()

      // ✔ заголовки (очистка)
      this.headers = data[headerRowIndex].map(h =>
        String(h || '').trim()
      )

      // ✔ строки
      const rowsRaw = data.slice(headerRowIndex + 1)

      this.rows = rowsRaw
        .filter(row => row.some(cell => String(cell).trim() !== ''))
        .map(row => {
          const obj = {}

          this.headers.forEach((h, i) => {
            obj[h] = row[i] ?? ''
          })
          return obj
        })
    },
async syncImages() {
  console.log('rows',this.rows)
  console.log('syncRows',this.syncRows)
  const itemsToCheck = this.rows.filter(row => {
    const article = row['Артикул'] || row.article
    return !row.image && article && row.supplierId1
  })
  console.log('itemsToCheck', itemsToCheck)

  if (itemsToCheck.length === 0) return

  this.imageLoading = true

  // ставим флаги загрузки
  this.rows = this.rows.map(row => {
    const article = row['Артикул'] || row.article
    if (!row.image && article && row.supplierId1) {
      return { ...row, _imageLoading: true }
    }
    return row
  })

  try {
    for (const row of itemsToCheck) {
      try {
        const response = await apiClient.post('/materials/fetch-image', {
          article: row['Артикул'] || row.article,
          supplierId: row.supplierId1,
          name: row['Наименование материала'] || row.name || ''
        })

        const image = response.data?.image
        const article = row['Артикул'] || row.article

        if (image) {
          this.rows = this.rows.map(r => {
            const rArticle = r['Артикул'] || r.article
            if (rArticle === article) {
              return {
                ...r,
                image,
                _imageLoading: false
              }
            }
            return r
          })
        }

      } catch (e) {
        console.warn('Image failed for:', row)
      }
    }

  } catch (err) {
    console.error('Image fetch error:', err)
  } finally {
    this.rows = this.rows.map(r => ({
      ...r,
      _imageLoading: false
    }))

    this.imageLoading = false
  }
},


    reset() {
      this.projectName = ''
      this.headers = []
      this.rows = []
      this.syncRows = []
      this.error = null
    },
    toggleGroupBySupplier() {
        this.groupBySupplier = !this.groupBySupplier
    },

    removeRow(id) {
      this.rows = this.rows.filter(r => r.uid !== id)
    },

    async syncClasses() { //Загрузка новых классов на сервер
        try {
            await apiClient.post('/user-classes/bulk', this.uniqueClasses)
        } catch (err) {
            console.error('syncClasses error:', err)
            this.error = 'Ошибка сохранения классов'
        }
    },
    async syncMaterials() {
      const userClassStore = useUserClassStore()

      await userClassStore.fetchClasses()
      console.log('====================================================================')
      console.log('userClasses',userClassStore.classes)
      const normalize = v => String(v || '').trim().toLowerCase()

      const classKey = Object.keys(this.rows[0] || {})
        .find(k => k.toLowerCase().includes('класс'))
      console.log('classKey',classKey)
      const rowsWithSupplier = this.rows.map(row => {
        const className = classKey ? row[classKey] : ''
        console.log('className',className)
        const userClass = userClassStore.classes.find(
          c => normalize(c.className) === normalize(className)
        )
        console.log('userClass',userClass)

        const elem =
        {
          ...row,
          supplierId: userClass?.supplierId ?? row.supplierId ?? null,
          supplierId1: userClass?.supplierId ?? row.supplierId ?? null,
          name: row['Наименование материала'] || '',
          article: row['Артикул'] || null
        }
        console.log('elem',elem)
        return elem
      })

      try {
        const response = await apiClient.post('/materials/sync', rowsWithSupplier)

        const backendMap = new Map(
          response.data
            .filter(i => i.article)
            .map(item => [item.article, item])
        )

        this.rows = rowsWithSupplier.map(row => {
          const article = row['Артикул'] || null
          const backendItem = backendMap.get(article)

          return backendItem
            ? { ...row, ...backendItem }
            : row
        })

      } catch (err) {
        console.error(err)
        this.error = 'Ошибка синхронизации материалов'
      }
    },
    addedUid() {
      this.rows.forEach((el, i) => {
        el.uid = i
      })
    },

groupedByClass() {
      const userClassStore = useUserClassStore()

      const groups = {}

      this.rows.forEach(row => {
        const classKey = Object.keys(row).find(k =>
          k.toLowerCase().includes('класс')
        )

        const cls = classKey
          ? String(row[classKey] || '').trim()
          : 'Без класса'

        if (!groups[cls]) {
          groups[cls] = {
            className: cls,
            supplier: null,
            type: null,       // 👈 добавили
            items: []
          }
        }

        groups[cls].items.push(row)
      })

      return Object.values(groups).map(group => {

        const uc = userClassStore.classes.find(
          x => x.className === group.className
        )

        const type = uc?.type || null

        return {
          ...group,
          supplier: uc?.supplier || null,
          type, // 👈 тип в группе

          // 👇 если нужно прокинуть в строки
          items: group.items.map(row => ({
            ...row,
            type
          }))
        }
      })
    },

   grouped() {
      const groupsByClass = this.groupedByClass()

      const merged = {}

      groupsByClass.forEach(group => {

        const supplierId = group.supplier?.id ?? 'no-supplier'

        const type = String(group.type ?? 'no-type').trim()

        const key = `${supplierId}__${type}`

        if (!merged[key]) {
          merged[key] = {
            supplier: group.supplier,
            type,
            classNames: new Set(),
            items: []
          }
        }

        merged[key].classNames.add(group.className)
        merged[key].items.push(...group.items)
      })

      return Object.values(merged).map(g => ({
        ...g,
        classNames: [...g.classNames]
      }))
    },
    updateRow(updatedData) {
      const index = this.rows.findIndex(row => 
        row.uid === updatedData.uid || 
        (row['Артикул'] && row['Артикул'] === updatedData['Артикул'])
      )

      if (index !== -1) {
        this.rows[index] = { ...this.rows[index], ...updatedData }
        // Опционально: можно сохранить в localStorage или отправить на бэкенд
      }
    },
  },

  getters: {
    uniqueClasses(state) {
      const set = new Set()

      state.rows.forEach(row => {
        // ищем ключ независимо от регистра
        const key = Object.keys(row).find(k =>
          k.toLowerCase().includes('класс')
        )

        if (!key) return

        const value = String(row[key] || '').trim()

        if (value) set.add(value)
      })

      return Array.from(set)
    },
    groupedView(state) {
    const data = this.groupedByClass()

    const order = {
      'Фурнітура': 0,
      'Плитні матеріали': 1,
      'Погонні матеріали': 2
    }

    const getOrder = (type) => {
      return order[type] ?? 99
    }

    // =========================
    // БЕЗ ГРУППИРОВКИ
    // =========================
    if (!state.groupBySupplier) {
      return [...data].sort((a, b) => {
        return getOrder(a.type) - getOrder(b.type)
      })
    }

    // =========================
    // С ГРУППИРОВКОЙ
    // =========================
    const merged = {}

    data.forEach(group => {
      const supplierId = group.supplier?.id ?? 'no-supplier'
      const type = group.type ?? 'no-type'

      const key = `${supplierId}__${type}`

      if (!merged[key]) {
        merged[key] = {
          supplier: group.supplier,
          type,
          classNames: new Set(),
          items: []
        }
      }

      // 🔥 НОРМАЛИЗАЦИЯ КЛАССОВ
      if (Array.isArray(group.classNames)) {
        group.classNames.forEach(c => merged[key].classNames.add(c))
      } else if (group.className) {
        merged[key].classNames.add(group.className)
      }

      // 🔥 ОБЪЕДИНЕНИЕ СТРОК
      if (Array.isArray(group.items)) {
        merged[key].items.push(...group.items)
      }
    })

    return Object.values(merged)
      .map(g => ({
        ...g,
        classNames: Array.from(g.classNames)
      }))
      .sort((a, b) => {
        return getOrder(a.type) - getOrder(b.type)
      })
  },
    visibleHeaders(state) {
      const headers = state.headers || []

      return headers.filter(h =>
        !String(h).toLowerCase().includes('класс')
      )
    }

  },
  
})