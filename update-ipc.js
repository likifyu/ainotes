const fs = require('fs');
const content = `import { ipcMain, dialog } from "electron";
import { noteService } from "./database";
import { aiService } from "./ai-service";
import fsNode from "fs";
import crypto from "crypto";
import axios from "axios";
import path from "path";

// Language code mapping for Baidu API
const BAIDU_LANG_MAP: Record<string, string> = {
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'en': 'en',
  'ja': 'jp',
  'ko': 'kor',
  'fr': 'fra',
  'de': 'de',
  'es': 'spa',
  'ru': 'ru',
  'it': 'it',
  'vi': 'vie',
  'pt': 'pt',
  'nl': 'nl',
  'pl': 'pl',
  'th': 'th',
  'ar': 'ara',
  'hi': 'hi',
};

// Note IPC handlers
ipcMain.handle("note:getAll", async () => {
  return noteService.getAll();
});

ipcMain.handle("note:get", async (_, id) => {
  return noteService.get(id);
});

ipcMain.handle("note:create", async (_, note) => {
  return noteService.create(note);
});

ipcMain.handle("note:update", async (_, id, updates) => {
  return noteService.update(id, updates);
});

ipcMain.handle("note:delete", async (_, id) => {
  return noteService.delete(id);
});

// AI IPC handlers
ipcMain.handle("ai:chat", async (_, message, context) => {
  return aiService.chat(message, context);
});

ipcMain.handle("ai:continue", async (_, content) => {
  return aiService.continue(content);
});

ipcMain.handle("ai:rewrite", async (_, text) => {
  return aiService.rewrite(text);
});

// Baidu Translation IPC handler
ipcMain.handle("translate:baidu", async (_, text, from, to, appId, secretKey) => {
  try {
    const fromLang = from === 'auto' ? 'auto' : (BAIDU_LANG_MAP[from] || 'auto');
    const toLang = BAIDU_LANG_MAP[to] || 'zh';
    const salt = Date.now().toString();
    const signStr = appId + text + salt + secretKey;
    const sign = crypto.createHash('md5').update(signStr).digest('hex');
    const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate';
    const params = new URLSearchParams({
      q: text,
      from: fromLang,
      to: toLang,
      appid: appId,
      salt: salt,
      sign: sign,
    });
    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000,
    });
    if (response.data.error_code) {
      return { success: false, error: "百度翻译错误: " + response.data.error_msg };
    }
    const result = response.data.trans_result?.[0]?.dst || text;
    return { success: true, text: result, sourceLang: from, targetLang: to, engine: 'baidu' };
  } catch (error) {
    return { success: false, error: error.message || '翻译失败' };
  }
});

// File save handlers
ipcMain.handle("file:save", async (_, options) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: options.title,
    defaultPath: options.defaultPath,
    filters: options.filters,
  });
  if (canceled || !filePath) {
    return { success: false, message: "已取消" };
  }
  try {
    fsNode.writeFileSync(filePath, options.content, "utf-8");
    return { success: true, filePath };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// File export to PDF
ipcMain.handle("file:export-pdf", async (_, options) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "导出为 PDF",
    defaultPath: options.defaultPath.replace(".md", ".pdf"),
    filters: [{ name: "PDF 文档", extensions: ["pdf"] }],
  });
  if (canceled || !filePath) {
    return { success: false, message: "已取消" };
  }
  const printHtml = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>" +
    options.title + "</title><style>@page { margin: 2cm; } body { font-family: \"Microsoft YaHei\", sans-serif; font-size: 12pt; line-height: 1.6; color: #333; max-width: 21cm; margin: 0 auto; } h1 { font-size: 24pt; color: #1a1a2e; border-bottom: 2px solid #7c3aed; } h2 { font-size: 18pt; margin-top: 24px; } pre { background: #f7fafc; padding: 16px; border-radius: 8px; overflow-x: auto; } code { background: #edf2f7; } blockquote { border-left: 4px solid #7c3aed; margin: 16px 0; padding-left: 16px; color: #666; } table { width: 100%; border-collapse: collapse; margin: 16px 0; } th, td { border: 1px solid #e2e8f0; padding: 12px; } th { background: #f7fafc; } a { color: #7c3aed; }</style></head><body>" + options.html + "</body></html>";
  try {
    const htmlPath = filePath.replace(".pdf", ".html");
    fsNode.writeFileSync(htmlPath, printHtml, "utf-8");
    return { success: true, filePath: htmlPath, message: "已保存为 HTML" };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Open file dialog
ipcMain.handle("file:open", async (_, filters) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "打开文件", filters: filters, properties: ["openFile"],
  });
  if (canceled || filePaths.length === 0) {
    return { success: false, message: "已取消" };
  }
  try {
    const content = fsNode.readFileSync(filePaths[0], "utf-8");
    const ext = path.extname(filePaths[0]).toLowerCase();
    return { success: true, filePath: filePaths[0], content, extension: ext };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
`;

fs.writeFileSync('src/main/ipc-handler.ts', content);
console.log('ipc-handler.ts updated successfully');
