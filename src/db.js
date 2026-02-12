const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'quicknotes.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT DEFAULT '',
        created_at DATETIME DEFAULT (datetime('now'))
      )
    `);
    const columns = db.prepare("PRAGMA table_info(notes)").all();
    if (!columns.some(c => c.name === 'category')) {
      db.exec("ALTER TABLE notes ADD COLUMN category TEXT DEFAULT ''");
    }
  }
  return db;
}

function getAllNotes() {
  return getDb().prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
}

function getNoteById(id) {
  return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id) || null;
}

function createNote({ title, body = '', category = '' }) {
  const result = getDb().prepare('INSERT INTO notes (title, body, category) VALUES (?, ?, ?)')
    .run(title, body, category);
  return getNoteById(result.lastInsertRowid);
}

function updateNote(id, { title, body, category }) {
  const existing = getNoteById(id);
  if (!existing) return null;

  getDb().prepare('UPDATE notes SET title = ?, body = ?, category = ? WHERE id = ?')
    .run(
      title ?? existing.title,
      body ?? existing.body,
      category ?? existing.category,
      id
    );
  return getNoteById(id);
}

function deleteNote(id) {
  const result = getDb().prepare('DELETE FROM notes WHERE id = ?').run(id);
  return result.changes > 0;
}

function getAllCategories() {
  return getDb().prepare("SELECT DISTINCT category FROM notes WHERE category != '' ORDER BY category").pluck().all();
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote, getAllCategories, closeDb };
