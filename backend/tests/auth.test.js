/**
 * Tests for the /auth routes and app-level behavior.
 *
 * The database is replaced with a mock (vi.mock below), so these tests run
 * anywhere, including GitHub Actions, without a MySQL server.
 * Supertest sends requests straight to the Express app; no port is opened.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import app from '../app.js';

vi.mock('../config/database.js', () => ({ default: { execute: vi.fn() } }));

const SECRET = 'test-secret';

beforeEach(() => {
  vi.stubEnv('JWT_SECRET', SECRET);
  pool.execute.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

/** Fake DB row for a user whose password is "correct-horse". */
async function fakeUserRow() {
  return { id: 7, username: 'alice', password_hash: await bcrypt.hash('correct-horse', 4) };
}

describe('app', () => {
  it('GET /health reports ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"username": ');
    expect(res.status).toBe(400);
  });
});

describe('POST /auth/register', () => {
  it('requires email, username, and password', async () => {
    const res = await request(app).post('/auth/register').send({ username: 'alice' });
    expect(res.status).toBe(400);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('rejects a body that is not JSON instead of crashing', async () => {
    const res = await request(app).post('/auth/register').type('form').send('username=alice');
    expect(res.status).toBe(400);
  });

  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'a@example.com', username: 'alice', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('stores a bcrypt hash, never the plaintext password', async () => {
    pool.execute.mockResolvedValue([{}]);
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'a@example.com', username: 'alice', password: 'correct-horse' });

    expect(res.status).toBe(201);
    const [, params] = pool.execute.mock.calls[0];
    expect(params[2]).not.toBe('correct-horse');
    expect(await bcrypt.compare('correct-horse', params[2])).toBe(true);
  });

  it('returns 409 when the username or email already exists', async () => {
    pool.execute.mockRejectedValue(Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' }));
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'a@example.com', username: 'alice', password: 'correct-horse' });
    expect(res.status).toBe(409);
  });
});

describe('POST /auth/login', () => {
  it('returns 401 for an unknown user', async () => {
    pool.execute.mockResolvedValue([[]]);
    const res = await request(app).post('/auth/login').send({ username: 'nobody', password: 'whatever1' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for a wrong password', async () => {
    pool.execute.mockResolvedValue([[await fakeUserRow()]]);
    const res = await request(app).post('/auth/login').send({ username: 'alice', password: 'wrong-pass' });
    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('sets an HTTP-only token cookie and keeps the token out of the body', async () => {
    pool.execute.mockResolvedValue([[await fakeUserRow()]]);
    const res = await request(app).post('/auth/login').send({ username: 'alice', password: 'correct-horse' });

    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/^token=/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(JSON.stringify(res.body)).not.toMatch(/eyJ/); // no JWT in the response body
  });

  it('uses cross-site cookie settings in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    pool.execute.mockResolvedValue([[await fakeUserRow()]]);
    const res = await request(app).post('/auth/login').send({ username: 'alice', password: 'correct-horse' });

    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=None/);
    expect(cookie).toMatch(/Partitioned/);
  });
});

describe('GET /auth/test', () => {
  it('returns 401 without a cookie', async () => {
    const res = await request(app).get('/auth/test');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a token signed with a different secret', async () => {
    const forged = jwt.sign({ id: 1, username: 'mallory' }, 'not-the-secret');
    const res = await request(app).get('/auth/test').set('Cookie', `token=${forged}`);
    expect(res.status).toBe(401);
  });

  it('returns the user for a valid token', async () => {
    const token = jwt.sign({ id: 7, username: 'alice' }, SECRET);
    const res = await request(app).get('/auth/test').set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, user: { id: 7, username: 'alice' } });
  });
});

describe('POST /auth/logout', () => {
  it('clears the token cookie', async () => {
    const res = await request(app).post('/auth/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/^token=;.*Expires=Thu, 01 Jan 1970/);
  });
});
