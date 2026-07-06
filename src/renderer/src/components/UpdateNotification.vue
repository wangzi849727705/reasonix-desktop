<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

interface UpdateInfo {
  version: string
  releaseDate?: string
  releaseNotes?: string
}

interface ProgressInfo {
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
}

const status = ref<"idle" | "checking" | "available" | "downloading" | "downloaded" | "not-available" | "error">("idle")
const info = ref<UpdateInfo | null>(null)
const progress = ref<ProgressInfo | null>(null)
const errMsg = ref("")

let cleanups: (() => void)[] = []

function download(): void {
  window.api?.update.download()
}

function install(): void {
  window.api?.update.install()
}

onMounted(() => {
  if (!window.api) return

  cleanups.push(
    window.api.update.onChecking(() => {
      status.value = "checking"
    }),
    window.api.update.onAvailable((data) => {
      status.value = "available"
      info.value = data
    }),
    window.api.update.onNotAvailable(() => {
      status.value = "not-available"
      setTimeout(() => { status.value = "idle" }, 5000)
    }),
    window.api.update.onError((err) => {
      status.value = "error"
      errMsg.value = err.message
      setTimeout(() => { status.value = "idle" }, 8000)
    }),
    window.api.update.onDownloadProgress((p) => {
      status.value = "downloading"
      progress.value = p
    }),
    window.api.update.onDownloaded((data) => {
      status.value = "downloaded"
      info.value = data
    }),
  )
})

onUnmounted(() => {
  cleanups.forEach((fn) => fn())
})
</script>

<template>
  <div v-if="status !== 'idle'" class="update-notification" :class="`update-${status}`">
    <!-- checking -->
    <span v-if="status === 'checking'" class="update-text">
      <span class="update-spinner" /> 检查更新中…
    </span>

    <!-- available -->
    <span v-else-if="status === 'available'" class="update-text">
      🆕 新版本 <strong>{{ info?.version }}</strong> 可用
      <button class="update-btn" @click="download">下载更新</button>
    </span>

    <!-- downloading -->
    <span v-else-if="status === 'downloading'" class="update-text">
      ⬇️ 下载更新… {{ Math.round(progress?.percent ?? 0) }}%
    </span>

    <!-- downloaded -->
    <span v-else-if="status === 'downloaded'" class="update-text">
      ✅ 更新已下载 ({{ info?.version }})
      <button class="update-btn primary" @click="install">立即重启安装</button>
    </span>

    <!-- not-available -->
    <span v-else-if="status === 'not-available'" class="update-text">
      ✅ 已是最新版本
    </span>

    <!-- error -->
    <span v-else-if="status === 'error'" class="update-text">
      ❌ 检查更新失败: {{ errMsg }}
    </span>
  </div>
</template>

<style scoped>
.update-notification {
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  height: 100%;
  white-space: nowrap;
}

.update-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.update-spinner {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 2px solid var(--el-border-color);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.update-btn {
  background: var(--el-color-primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
}

.update-btn.primary {
  background: var(--el-color-success);
}

.update-btn:hover {
  opacity: 0.85;
}

.update-checking { color: var(--el-text-color-secondary); }
.update-available { color: var(--el-color-primary); }
.update-downloading { color: var(--el-color-primary); }
.update-downloaded { color: var(--el-color-success); }
.update-not-available { color: var(--el-text-color-secondary); }
.update-error { color: var(--el-color-danger); }
</style>
