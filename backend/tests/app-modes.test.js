/**
 * Tests for app.js behavior that depends on NODE_ENV, and its last-resort error handler.
 * Each test loads a fresh copy of the app with the environment it needs.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../config/database.js', () => ({ default: { execute: vi.fn() } }));

afterEach(() => {
  vi.resetModules();
  vi.doUnmock('../routes/auth.js');
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('app in production', () => {
  it('trusts the proxy in front of it and reports its environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { default: app } = await import('../app.js');

    expect(app.get('trust proxy')).toBe(1);
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ ok: true, env: 'production' });
  });
});

describe('request logging', () => {
  it('logs each request outside of tests', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { default: app } = await import('../app.js');

    await request(app).get('/health').set('Origin', 'http://localhost:5173');

    expect(log.mock.calls.some(([line]) => /GET \/health .* Origin: http:\/\/localhost:5173/.test(line))).toBe(true);
  });
});

describe('unexpected errors', () => {
  it('answers 500 with a generic message instead of leaking details', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.doMock('../routes/auth.js', () => {
      const router = express.Router();
      router.get('/boom', () => {
        throw new Error('secret internal detail');
      });
      return { default: router };
    });
    const { default: app } = await import('../app.js');

    const res = await request(app).get('/auth/boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });
});
