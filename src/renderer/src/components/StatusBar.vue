<script setup lang="ts">
import UpdateNotification from "./UpdateNotification.vue"
</script>

<template>
  <div class="statusbar">
    <UpdateNotification />
  </div>
</template>

<style scoped>
.statusbar {
  height: 24px;
  min-height: 24px;
  background: var(--el-bg-color-page);
  border-top: 1px solid var(--el-border-color-light);
}
</style>
