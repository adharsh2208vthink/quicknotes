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
        tags TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT (datetime('now'))
      )
    `);
    try {
      db.exec(`ALTER TABLE notes ADD COLUMN categories TEXT DEFAULT '[]'`);
    } catch {
      // Column already exists
    }
  }
  return db;
}

function getAllNotes() {
  return getDb().prepare('SELECT * FROM notes ORDER BY created_at DESC').all()
    .map(parseNoteTags);
}

function getNoteById(id) {
  const note = getDb().prepare('SELECT * FROM notes WHERE id = ?').get(id);
  return note ? parseNoteTags(note) : null;
}

function getNotesByTag(tag) {
  return getDb().prepare("SELECT * FROM notes WHERE tags LIKE ? ORDER BY created_at DESC")
    .all(`%"${tag}"%`)
    .map(parseNoteTags);
}

function createNote({ title, body = '', tags = [], categories = [] }) {
  const result = getDb().prepare('INSERT INTO notes (title, body, tags, categories) VALUES (?, ?, ?, ?)')
    .run(title, body, JSON.stringify(tags), JSON.stringify(categories));
  return getNoteById(result.lastInsertRowid);
}

function updateNote(id, { title, body, tags, categories }) {
  const existing = getNoteById(id);
  if (!existing) return null;

  getDb().prepare('UPDATE notes SET title = ?, body = ?, tags = ?, categories = ? WHERE id = ?')
    .run(
      title ?? existing.title,
      body ?? existing.body,
      JSON.stringify(tags ?? existing.tags),
      JSON.stringify(categories ?? existing.categories),
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

function parseNoteTags(note) {
  let tags, categories;
  try { tags = JSON.parse(note.tags); } catch { tags = []; }
  try { categories = JSON.parse(note.categories); } catch { categories = []; }
  return { ...note, tags, categories };
}

module.exports = { getAllNotes, getNoteById, getNotesByTag, createNote, updateNote, deleteNote, closeDb };
