"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const database_1 = require("./database");
const ai_service_1 = require("./ai-service");
// Note IPC handlers
electron_1.ipcMain.handle('note:getAll', async () => {
    return database_1.noteService.getAll();
});
electron_1.ipcMain.handle('note:get', async (_, id) => {
    return database_1.noteService.get(id);
});
electron_1.ipcMain.handle('note:create', async (_, note) => {
    return database_1.noteService.create(note);
});
electron_1.ipcMain.handle('note:update', async (_, id, updates) => {
    return database_1.noteService.update(id, updates);
});
electron_1.ipcMain.handle('note:delete', async (_, id) => {
    return database_1.noteService.delete(id);
});
// AI IPC handlers
electron_1.ipcMain.handle('ai:chat', async (_, message, context) => {
    return ai_service_1.aiService.chat(message, context);
});
electron_1.ipcMain.handle('ai:continue', async (_, content) => {
    return ai_service_1.aiService.continue(content);
});
electron_1.ipcMain.handle('ai:rewrite', async (_, text) => {
    return ai_service_1.aiService.rewrite(text);
});
