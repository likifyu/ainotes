import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Use process.cwd() for the database path
const dbPath = path.join(process.cwd(), 'data', 'notes.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database | null = null;

// Note interface
export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Initialize database
async function initDatabase() {
  if (db) return db;

  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
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
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Helper to convert query result to array of objects
function queryResultToNotes(result: any[]): Note[] {
  if (!result || result.length === 0) return [];
  // sql.js returns results as array of arrays
  return result.map((row: any[]) => ({
    id: row[0],
    title: row[1],
    content: row[2],
    created_at: row[3],
    updated_at: row[4],
  }));
}

// Database operations
export const noteService = {
  // Initialize (must be called first)
  init: async () => {
    await initDatabase();
  },

  getAll: async (): Promise<Note[]> => {
    await initDatabase();
    if (!db) throw new Error('Database not initialized');
    const stmt = db.prepare('SELECT * FROM notes ORDER BY updated_at DESC');
    const results = stmt.getAsObject();
    stmt.free();
    return queryResultToNotes((results as any)?.values || []);
  },

  get: async (id: string): Promise<Note | undefined> => {
    await initDatabase();
    if (!db) throw new Error('Database not initialized');
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return {
        id: (row as any).id,
        title: (row as any).title,
        content: (row as any).content,
        created_at: (row as any).created_at,
        updated_at: (row as any).updated_at,
      };
    }
    stmt.free();
    return undefined;
  },

  create: async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    await initDatabase();
    if (!db) throw new Error('Database not initialized');
    const id = uuidv4();
    const now = new Date().toISOString();
    db.run(
      'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, note.title, note.content, now, now]
    );
    saveDatabase();
    return { ...note, id, created_at: now, updated_at: now };
  },

  update: async (id: string, updates: Partial<Note>): Promise<Note | undefined> => {
    await initDatabase();
    if (!db) throw new Error('Database not initialized');
    const existing = await noteService.get(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const title = updates.title ?? existing.title;
    const content = updates.content ?? existing.content;

    db.run(
      'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?',
      [title, content, now, id]
    );
    saveDatabase();
    return { ...existing, title, content, updated_at: now };
  },

  delete: async (id: string): Promise<boolean> => {
    await initDatabase();
    if (!db) throw new Error('Database not initialized');
    db.run('DELETE FROM notes WHERE id = ?', [id]);
    saveDatabase();
    return true;
  },
};

export default noteService;
