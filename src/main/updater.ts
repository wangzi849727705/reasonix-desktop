// ============================================================
// Reasonix Desktop — Auto Updater (electron-updater)
// ============================================================

import { autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain } from "electron";

// Disable auto-download — we'll prompt first
autoUpdater.autoDownload = false;

let mainWindow: BrowserWindow | null = null;

export function initUpdater(win: BrowserWindow): void {
  mainWindow = win;

  // ── Event handlers ──────────────────────────────────────

  autoUpdater.on("checking-for-update", () => {
    sendToRenderer("update:checking");
  });

  autoUpdater.on("update-available", (info) => {
    sendToRenderer("update:available", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    sendToRenderer("update:not-available", { version: info.version });
  });

  autoUpdater.on("error", (err) => {
    sendToRenderer("update:error", { message: err.message });
  });

  autoUpdater.on("download-progress", (progress) => {
    sendToRenderer("update:download-progress", {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    sendToRenderer("update:downloaded", {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  // ── IPC handlers ────────────────────────────────────────

  ipcMain.handle("update:check", () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.handle("update:download", () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.handle("update:install", () => {
    autoUpdater.quitAndInstall(false, true);
  });
}

// ── Helpers ─────────────────────────────────────────────

/** Trigger an update check (used for auto-check on startup) */
export function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch(() => {
    // silent — network errors are expected offline
  });
}

function sendToRenderer(channel: string, data?: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}
