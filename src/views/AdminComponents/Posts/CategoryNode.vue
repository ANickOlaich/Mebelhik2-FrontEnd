<template>
  <div class="node">

    <div class="node-row">
      <span>{{ node.name }}</span>

      <div class="actions">
        <button @click="$emit('edit', node)">✏️</button>
        <button @click="$emit('delete', node)">🗑</button>
      </div>
    </div>

    <div v-if="node.children?.length" class="children">
      <CategoryNode
        v-for="c in node.children"
        :key="c.id"
        :node="c"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

  </div>
</template>

<script setup>
defineProps({
  node: Object
})
</script>
<style scoped>

.tree {
  margin-top: 20px;
}

.node {
  margin-left: 15px;
}

.node-row {
  display: flex;
  justify-content: space-between;
  padding: 5px;
}

.children {
  margin-left: 20px;
  border-left: 1px solid #ccc;
  padding-left: 10px;
}

</style>

