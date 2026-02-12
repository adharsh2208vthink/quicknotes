const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));



// List notes API
app.get('/api/notes', (req, res) => {
  const notes = db.getAllNotes();
  res.json(notes);
});

// Get single note
app.get('/api/notes/:id', (req, res) => {
  const note = db.getNoteById(Number(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// Create note
app.post('/api/notes', (req, res) => {
  const { title, body } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const note = db.createNote({ title, body });
  res.status(201).json(note);
});

// Update note
app.put('/api/notes/:id', (req, res) => {
  const note = db.updateNote(Number(req.params.id), req.body);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
  const deleted = db.deleteNote(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'Note not found' });
  res.status(204).end();
});

module.exports = app;
