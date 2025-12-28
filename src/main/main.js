"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
require("./ipc-handler");
const __dirname = path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url));
let mainWindow = null;
async function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        title: 'AI Notes',
        icon: path_1.default.join(__dirname, '../assets/icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, '../preload/preload.js'),
        },
        titleBarStyle: 'hiddenInset',
        backgroundColor: '#0f0f1a',
        show: false,
    });
    // Load the app
    const startUrl = process.env.ELECTRON_START_URL || `file://${path_1.default.join(__dirname, '../dist/index.html')}`;
    await mainWindow.loadURL(startUrl);
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });
    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
