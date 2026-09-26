const request = require('supertest');
const app = require('../index');

describe('GET /users', () => {
  it('returns 200 with an array of users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('each user has id, name, and email fields', async () => {
    const res = await request(app).get('/users');
    res.body.forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
    });
  });
});

describe('GET /users/:id', () => {
  it('returns 200 and the correct user for a valid id', async () => {
    const res = await request(app).get('/users/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, name: 'Alice', email: 'alice@example.com' });
  });

  it('returns 404 for an id that does not exist', async () => {
    const res = await request(app).get('/users/9999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /users/:id/deactivate', () => {
  it('returns 200 and sets active to false for a valid user', async () => {
    const res = await request(app).post('/users/2/deactivate');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 2, active: false });
  });

  it('returns 404 for a user id that does not exist', async () => {
    const res = await request(app).post('/users/9999/deactivate');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
