const request = require('supertest');
const app = require('../src/app');
const { closeDb } = require('../src/db');

afterAll(() => closeDb());

describe('Notes API', () => {
  let noteId;

  test('POST /api/notes - creates a note with categories', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Test Note', body: 'Hello world', tags: ['demo', 'test'], categories: ['work', 'urgent'] });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Note');
    expect(res.body.tags).toEqual(['demo', 'test']);
    expect(res.body.categories).toEqual(['work', 'urgent']);
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

  test('GET /api/notes?tag=demo - filters by tag', async () => {
    const res = await request(app).get('/api/notes?tag=demo');
    expect(res.status).toBe(200);
    expect(res.body.every(n => n.tags.includes('demo'))).toBe(true);
  });

  test('PUT /api/notes/:id - updates a note', async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ title: 'Updated Note', categories: ['personal'] });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Note');
    expect(res.body.categories).toEqual(['personal']);
  });

  test('DELETE /api/notes/:id - deletes a note', async () => {
    const res = await request(app).delete(`/api/notes/${noteId}`);
    expect(res.status).toBe(204);
  });

  test('GET /api/notes/:id - returns 404 for missing note', async () => {
    const res = await request(app).get('/api/notes/99999');
    expect(res.status).toBe(404);
  });

  test('POST /api/notes - defaults categories to empty array', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'No Categories Note' });
    expect(res.status).toBe(201);
    expect(res.body.categories).toEqual([]);
  });

  test('POST /api/notes - returns 400 without title', async () => {
    const res = await request(app).post('/api/notes').send({ body: 'no title' });
    expect(res.status).toBe(400);
  });
});
