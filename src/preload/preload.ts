import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Theme
  getTheme: () => ipcRenderer.invoke("get-theme"),
  onThemeUpdated: (callback) =>
    ipcRenderer.on("theme-updated", (_, theme) => callback(theme)),

  // Notes IPC
  noteGetAll: () => ipcRenderer.invoke("note:getAll"),
  noteGet: (id) => ipcRenderer.invoke("note:get", id),
  noteCreate: (note) => ipcRenderer.invoke("note:create", note),
  noteUpdate: (id, note) => ipcRenderer.invoke("note:update", id, note),
  noteDelete: (id) => ipcRenderer.invoke("note:delete", id),

  // AI IPC
  aiChat: (message, context) =>
    ipcRenderer.invoke("ai:chat", message, context),
  aiContinue: (content) => ipcRenderer.invoke("ai:continue", content),
  aiRewrite: (text) => ipcRenderer.invoke("ai:rewrite", text),

  // File operations
  fileSave: (options) => ipcRenderer.invoke("file:save", options),
  fileExportPDF: (options) => ipcRenderer.invoke("file:export-pdf", options),
  fileOpen: (filters) => ipcRenderer.invoke("file:open", filters),

  // Translation IPC (Node.js API - no CORS issue)
  translateBaidu: (text, from, to, appId, secretKey) =>
    ipcRenderer.invoke("translate:baidu", text, from, to, appId, secretKey),
});
