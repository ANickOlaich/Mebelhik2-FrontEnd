<template>
  <div class="users-management">
    <h1>Статистика</h1>

    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

</script>

<style scoped>
/* Таблица (оставь свои стили) */
.users-table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.users-table th, .users-table td { padding: 14px; text-align: left; border-bottom: 1px solid #eee; }
.users-table th { background: #34495e; color: white; }
.role-admin { color: #e74c3c; font-weight: bold; }
.role-user { color: #27ae60; }
.btn-edit, .btn-delete { padding: 6px 12px; margin-right: 8px; border: none; border-radius: 4px; cursor: pointer; }
.btn-edit { background: #3498db; color: white; }
.btn-delete { background: #e74c3c; color: white; }

/* Модальное окно */
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
}
.form-group { margin-bottom: 16px; }
.form-group label { display: block; margin-bottom: 6px; }
.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.modal-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
.btn-save { background: #27ae60; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
.btn-cancel { background: #95a5a6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
</style>