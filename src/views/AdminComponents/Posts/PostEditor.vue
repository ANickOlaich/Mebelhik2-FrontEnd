<!-- views/admin/posts/PostEditorPage.vue -->
<template>
  <div class="post-editor">

    <div class="left">
      <input v-model="form.title" placeholder="Title" />

      <PostEditor v-model="form.content" />

      <PostSeoPanel v-model="form" />
      
    </div>

    <div class="right">

      <PostPreview :post="form" />
      <PreviewImageUploader v-model="form.previewImage" />

      <div class="controls">
        <textarea v-model="form.preview" placeholder="Анонс поста" />
        <select v-model="form.categoryId">
        <option :value="null">Без категории</option>

        <option
          v-for="cat in categories"
          :key="cat.id"
          :value="cat.id"
        >
          {{ cat.name }}
        </option>
      </select>

        <label>
          <input type="checkbox" v-model="form.isPublished" />
          Опубликованно
        </label>

        <label>
          <input type="checkbox" v-model="form.isFeatured" />
          На главной
        </label>

        <button @click="save">
          Сохранить
        </button>

      </div>

    </div>

  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { usePostsStore } from '@/stores/posts'
import { useCategoriesStore } from '@/stores/useCategoriesStore'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()

import PostEditor from '@/components/posts/PostEditor.vue'
import PostSeoPanel from '@/components/posts/PostSeoPanel.vue'
import PostPreview from '@/components/posts/PostPreview.vue'
import PreviewImageUploader from '@/components/posts/PreviewImageUploader.vue'


const store = usePostsStore()
const categoriesStore = useCategoriesStore()

const form = ref({
  title: '',
  slug: '',
  content: '',
  preview: '',
  previewImage: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  isPublished: false,
  isFeatured: false,
  categoryId: null
})

const categories = ref([])

const save = async () => {
  if (form.value.id) {
    await store.update(form.value.id, form.value)
  } else {
    const created = await store.create(form.value)
    form.value.id = created.id
  }

   await router.push('/admin/posts')
}

onMounted(async () => {
  categories.value = await categoriesStore.fetch()
  const id = route.params.id
  if (id && id !== 'new') {
    const post = await store.getById(id)
    form.value = { ...post }
  }
})
</script>

<style scoped>
.post-editor {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f6f7fb;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

/* ===================== */
/* LEFT COLUMN (editor) */
/* ===================== */
.post-editor .left {
  flex: 2;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Title input */
.post-editor .left input[type="text"],
.post-editor .left input {
  width: 100%;
  padding: 12px;
  font-size: 18px;
  border: 1px solid #e1e4ea;
  border-radius: 10px;
  outline: none;
  transition: 0.2s;
}

.post-editor .left input:focus {
  border-color: #2d6cdf;
  box-shadow: 0 0 0 3px rgba(45,108,223,0.15);
}

/* ===================== */
/* Editor.js block wrapper */
/* ===================== */
.editor-wrapper {
  border: 1px solid #e1e4ea;
  border-radius: 10px;
  padding: 10px;
  min-height: 300px;
  background: #fafbff;
}

/* ===================== */
/* SEO PANEL */
/* ===================== */
.seo-panel {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.seo-panel input,
.seo-panel textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e1e4ea;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.seo-panel textarea {
  min-height: 80px;
  resize: vertical;
}

.seo-panel input:focus,
.seo-panel textarea:focus {
  border-color: #2d6cdf;
  box-shadow: 0 0 0 3px rgba(45,108,223,0.12);
}

/* ===================== */
/* RIGHT COLUMN (preview + controls) */
/* ===================== */
.post-editor .right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===================== */
/* PREVIEW CARD */
/* ===================== */
.preview {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.preview h1 {
  font-size: 20px;
  margin-bottom: 10px;
}

.preview img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 10px;
}

.preview .content {
  font-size: 14px;
  color: #444;
  white-space: pre-wrap;
}

/* ===================== */
/* CONTROLS PANEL */
/* ===================== */
.controls {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* checkboxes */
.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.controls input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* save button */
.controls button {
  margin-top: 10px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: #2d6cdf;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.controls button:hover {
  background: #1f57b8;
}

/* ===================== */
/* RESPONSIVE */
/* ===================== */
@media (max-width: 1024px) {
  .post-editor {
    flex-direction: column;
  }

  .post-editor .right {
    flex-direction: row;
  }
}
</style>