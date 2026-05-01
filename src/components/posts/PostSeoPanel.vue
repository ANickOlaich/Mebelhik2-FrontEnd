<!-- components/posts/PostSeoPanel.vue -->
<template>
  <div class="seo-panel">

    <input v-model="model.seoTitle" placeholder="SEO Title" />

    <textarea v-model="model.seoDescription" placeholder="SEO Description" />

    <input v-model="model.seoKeywords" placeholder="Keywords" />

    <input v-model="model.slug" placeholder="Slug" />

  </div>
</template>

<script setup>
const model = defineModel()
</script>