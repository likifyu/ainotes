"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // Theme
    getTheme: () => electron_1.ipcRenderer.invoke('get-theme'),
    onThemeUpdated: (callback) => electron_1.ipcRenderer.on('theme-updated', (_, theme) => callback(theme)),
    // Notes IPC
    noteGetAll: () => electron_1.ipcRenderer.invoke('note:getAll'),
    noteGet: (id) => electron_1.ipcRenderer.invoke('note:get', id),
    noteCreate: (note) => electron_1.ipcRenderer.invoke('note:create', note),
    noteUpdate: (id, note) => electron_1.ipcRenderer.invoke('note:update', id, note),
    noteDelete: (id) => electron_1.ipcRenderer.invoke('note:delete', id),
    // AI IPC
    aiChat: (message, context) => electron_1.ipcRenderer.invoke('ai:chat', message, context),
    aiContinue: (content) => electron_1.ipcRenderer.invoke('ai:continue', content),
    aiRewrite: (text) => electron_1.ipcRenderer.invoke('ai:rewrite', text),
});
