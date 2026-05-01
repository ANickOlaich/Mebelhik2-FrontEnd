<template>
  <div class="category-manager">

    <button class="btn-add" @click="openCreate">
      + Новая категория
    </button>

    <div v-if="store.loading">Загрузка...</div>

    <div v-else class="tree">
      <CategoryNode
        v-for="node in store.tree"
        :key="node.id"
        :node="node"
        @edit="openEdit"
        @delete="remove"
      />
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal" @click.self="close">
      <div class="modal-content">

        <h3>{{ isEdit ? 'Редактирование' : 'Новая категория' }}</h3>

        <input v-model="form.name" placeholder="Название" />
        <input v-model="form.slug" placeholder="Slug" />
        <textarea v-model="form.description" />

        <select v-model="form.parentId">
          <option :value="null">Без родителя</option>
          <option
            v-for="c in store.flat"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name }}
          </option>
        </select>

        <input v-model="form.sortOrder" type="number" />

        <input v-model="form.seoTitle" placeholder="SEO title" />
        <textarea v-model="form.seoDescription" />

        <label>
          <input type="checkbox" v-model="form.isActive" />
          Активна
        </label>

        <div class="actions">
          <button @click="save">Сохранить</button>
          <button @click="close">Отмена</button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/useCategoriesStore'
import CategoryNode from './CategoryNode.vue'

const store = useCategoriesStore()

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({
  name: '',
  slug: '',
  description: '',
  parentId: null,
  sortOrder: 0,
  seoTitle: '',
  seoDescription: '',
  isActive: true
})

// =====================
// LOAD
// =====================
onMounted(() => {
  store.fetchTree()
})

// =====================
// MODAL
// =====================
const openCreate = () => {
  isEdit.value = false
  currentId.value = null

  form.value = {
    name: '',
    slug: '',
    description: '',
    parentId: null,
    sortOrder: 0,
    seoTitle: '',
    seoDescription: '',
    isActive: true
  }

  showModal.value = true
}

const openEdit = (item) => {
  isEdit.value = true
  currentId.value = item.id

  form.value = { ...item }

  showModal.value = true
}

const close = () => {
  showModal.value = false
}

// =====================
// SAVE
// =====================
const save = async () => {
  if (!form.value.name) return alert('Название обязательно')

  if (isEdit.value) {
    await store.updateCategory(currentId.value, form.value)
  } else {
    await store.createCategory(form.value)
  }

  close()
}

// =====================
const remove = async (item) => {
  if (!confirm('Удалить категорию?')) return

  await store.deleteCategory(item.id)
}
</script>

<style scoped>
.category-manager {
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #1f2937;
}

/* ===================== */
/* КНОПКА */
/* ===================== */
.btn-add {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;
  margin-bottom: 15px;
}

.btn-add:hover {
  background: #1d4ed8;
}

/* ===================== */
/* ДЕРЕВО */
/* ===================== */
.tree {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
}

/* ===================== */
/* LOADING */
/* ===================== */
.loading {
  padding: 20px;
  color: #6b7280;
}

/* ===================== */
/* MODAL OVERLAY */
/* ===================== */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* ===================== */
/* MODAL CONTENT */
/* ===================== */
.modal-content {
  width: 500px;
  max-width: 95%;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

/* ===================== */
/* FORM ELEMENTS */
/* ===================== */
input,
textarea,
select {
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  box-sizing: border-box;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #2563eb;
}

/* textarea */
textarea {
  min-height: 80px;
  resize: vertical;
}

/* ===================== */
/* CHECKBOX */
/* ===================== */
label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  font-size: 14px;
  color: #374151;
}

/* ===================== */
/* ACTIONS */
/* ===================== */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.actions button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

/* save */
.actions button:first-child {
  background: #16a34a;
  color: white;
}

.actions button:first-child:hover {
  background: #15803d;
}

/* cancel */
.actions button:last-child {
  background: #e5e7eb;
}

.actions button:last-child:hover {
  background: #d1d5db;
}

/* ===================== */
/* RESPONSIVE */
/* ===================== */
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
  }
}
</style>