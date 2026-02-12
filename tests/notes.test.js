const request = require('supertest');
const app = require('../src/app');
const { closeDb } = require('../src/db');

afterAll(() => closeDb());

describe('Notes API', () => {
  let noteId;

  test('POST /api/notes - creates a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Test Note', body: 'Hello world' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Note');
    noteId = res.body.id;
  });

  test('GET /api/notes - lists all notes', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/notes/:id - gets single note', async () => {
    const res = await request(app).get(`/api/notes/${noteId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Note');
  });

  test('PUT /api/notes/:id - updates a note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ title: 'Updated Note' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Note');
  });

  test('DELETE /api/notes/:id - deletes a note', async () => {
    const res = await request(app).delete(`/api/notes/${noteId}`);
    expect(res.status).toBe(204);
  });

  test('GET /api/notes/:id - returns 404 for missing note', async () => {
    const res = await request(app).get('/api/notes/99999');
    expect(res.status).toBe(404);
  });

  test('POST /api/notes - returns 400 without title', async () => {
    const res = await request(app).post('/api/notes').send({ body: 'no title' });
    expect(res.status).toBe(400);
  });
});

describe('Category feature', () => {
  let catNoteId;

  test('POST /api/notes with category - creates note with category', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Categorized Note', body: 'Has a category', category: 'Work' });
    expect(res.status).toBe(201);
    expect(res.body.category).toBe('Work');
    catNoteId = res.body.id;
  });

  test('GET /api/notes/:id - returns category', async () => {
    const res = await request(app).get(`/api/notes/${catNoteId}`);
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('Work');
  });

  test('PUT /api/notes/:id - updates category', async () => {
    const res = await request(app)
      .put(`/api/notes/${catNoteId}`)
      .send({ category: 'Personal' });
    expect(res.status).toBe(200);
    expect(res.body.category).toBe('Personal');
    expect(res.body.title).toBe('Categorized Note');
  });

  test('POST /api/notes without category - defaults to empty string', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'No Category Note' });
    expect(res.status).toBe(201);
    expect(res.body.category).toBe('');
  });

  test('GET /api/categories - returns distinct categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toContain('Personal');
  });
});
