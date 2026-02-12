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
  }
  return db;
}

function getAllNotes() {
  return getDb().prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
}

function getNoteById(id) {
  return getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id) || null;
}

function createNote({ title, body = '' }) {
  const result = getDb().prepare('INSERT INTO notes (title, body) VALUES (?, ?)')
    .run(title, body);
  return getNoteById(result.lastInsertRowid);
}

function updateNote(id, { title, body }) {
  const existing = getNoteById(id);
  if (!existing) return null;

  getDb().prepare('UPDATE notes SET title = ?, body = ? WHERE id = ?')
    .run(
      title ?? existing.title,
      body ?? existing.body,
      id
    );
  return getNoteById(id);
}

function deleteNote(id) {
  const result = getDb().prepare('DELETE FROM notes WHERE id = ?').run(id);
  return result.changes > 0;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote, closeDb };
