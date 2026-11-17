/**
 * Tests for config/env.js and config/database.js.
 * The MySQL driver is replaced with a fake, so no database is needed.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.doUnmock('mysql2/promise');
  vi.unstubAllEnvs();
});

describe('config/env.js', () => {
  it('loads backend/.env when it exists', async () => {
    const load = vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {});
    await import('../config/env.js');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does nothing when there is no .env file (as on Azure)', async () => {
    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {
      throw Object.assign(new Error('missing'), { code: 'ENOENT' });
    });
    await expect(import('../config/env.js')).resolves.toBeDefined();
  });

  it('still fails loudly for any other problem with .env', async () => {
    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {
      throw Object.assign(new Error('bad'), { code: 'EACCES' });
    });
    await expect(import('../config/env.js')).rejects.toThrow('bad');
  });
});

describe('config/database.js', () => {
  /** Fake mysql2 whose pool hands out `connection` (or fails with `error`). */
  function mockMysql({ connection, error }) {
    const createPool = vi.fn(() => ({
      getConnection: error ? vi.fn().mockRejectedValue(error) : vi.fn().mockResolvedValue(connection),
    }));
    vi.doMock('mysql2/promise', () => ({ default: { createPool } }));
    return createPool;
  }

  it('builds a TLS pool from the environment and reports a good connection', async () => {
    vi.stubEnv('DB_HOST', 'db.example');
    vi.stubEnv('DB_PORT', '3307');
    const connection = { release: vi.fn() };
    const createPool = mockMysql({ connection });

    await import('../config/database.js');

    const options = createPool.mock.calls[0][0];
    expect(options.host).toBe('db.example');
    expect(options.port).toBe(3307);
    expect(options.ssl.rejectUnauthorized).toBe(true);
    await vi.waitFor(() => expect(connection.release).toHaveBeenCalled());
    expect(console.log).toHaveBeenCalledWith('Successfully connected to MySQL');
  });

  it('uses port 3306 when DB_PORT is not set', async () => {
    vi.stubEnv('DB_PORT', '');
    const createPool = mockMysql({ connection: { release: vi.fn() } });
    await import('../config/database.js');
    expect(createPool.mock.calls[0][0].port).toBe(3306);
  });

  it('logs, but does not crash, when the first connection fails', async () => {
    mockMysql({ error: new Error('connect ETIMEDOUT') });

    await import('../config/database.js');

    await vi.waitFor(() =>
      expect(console.error).toHaveBeenCalledWith('MySQL connection failed on startup:', 'connect ETIMEDOUT'),
    );
  });
});
