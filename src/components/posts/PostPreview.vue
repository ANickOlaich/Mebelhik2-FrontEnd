<!-- components/posts/PostPreview.vue -->
<template>
  <div class="preview">

    <h1>{{ post.title }}</h1>

    <img v-if="post.previewImage" :src="post.previewImage" />

    <div class="content">
      <pre>{{ post.preview }}</pre>
    </div>

  </div>
</template>

<script setup>
defineProps({
  post: Object
})
</script>