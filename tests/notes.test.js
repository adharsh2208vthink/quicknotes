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
