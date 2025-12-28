"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteService = void 0;
const sql_js_1 = __importDefault(require("sql.js"));
const path_1 = __importDefault(require("path"));
const url_1 = require("url");
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const __dirname = path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url));
const dbPath = path_1.default.join(__dirname, '../../data/notes.db');
// Ensure data directory exists
const dataDir = path_1.default.dirname(dbPath);
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
let db = null;
// Initialize database
async function initDatabase() {
    if (db)
        return db;
    const SQL = await (0, sql_js_1.default)();
    // Load existing database or create new one
    if (fs_1.default.existsSync(dbPath)) {
        const fileBuffer = fs_1.default.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    }
    else {
        db = new SQL.Database();
    }
    // Initialize database schema
    db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '新笔记',
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
    saveDatabase();
    return db;
}
// Save database to file
function saveDatabase() {
    if (!db)
        return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs_1.default.writeFileSync(dbPath, buffer);
}
// Helper to convert query result to array of objects
function queryResultToNotes(result) {
    if (!result || result.length === 0)
        return [];
    // sql.js returns results as array of arrays
    return result.map((row) => ({
        id: row[0],
        title: row[1],
        content: row[2],
        created_at: row[3],
        updated_at: row[4],
    }));
}
// Database operations
exports.noteService = {
    // Initialize (must be called first)
    init: async () => {
        await initDatabase();
    },
    getAll: async () => {
        await initDatabase();
        if (!db)
            throw new Error('Database not initialized');
        const stmt = db.prepare('SELECT * FROM notes ORDER BY updated_at DESC');
        const results = stmt.getAsObject();
        stmt.free();
        return queryResultToNotes(results?.values || []);
    },
    get: async (id) => {
        await initDatabase();
        if (!db)
            throw new Error('Database not initialized');
        const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
        stmt.bind([id]);
        if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return {
                id: row.id,
                title: row.title,
                content: row.content,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
        }
        stmt.free();
        return undefined;
    },
    create: async (note) => {
        await initDatabase();
        if (!db)
            throw new Error('Database not initialized');
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        db.run('INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [id, note.title, note.content, now, now]);
        saveDatabase();
        return { ...note, id, created_at: now, updated_at: now };
    },
    update: async (id, updates) => {
        await initDatabase();
        if (!db)
            throw new Error('Database not initialized');
        const existing = await exports.noteService.get(id);
        if (!existing)
            return undefined;
        const now = new Date().toISOString();
        const title = updates.title ?? existing.title;
        const content = updates.content ?? existing.content;
        db.run('UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?', [title, content, now, id]);
        saveDatabase();
        return { ...existing, title, content, updated_at: now };
    },
    delete: async (id) => {
        await initDatabase();
        if (!db)
            throw new Error('Database not initialized');
        db.run('DELETE FROM notes WHERE id = ?', [id]);
        saveDatabase();
        return true;
    },
};
exports.default = exports.noteService;
