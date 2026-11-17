/**
 * Tests for the shared axios client: it must use the address from VITE_BACKEND_API_URL
 * and always send the login cookie.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('api client', () => {
  it('uses VITE_BACKEND_API_URL as its base address and sends cookies', async () => {
    vi.stubEnv('VITE_BACKEND_API_URL', 'https://backend.example');
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const { default: api } = await import('./api');

    expect(api.defaults.baseURL).toBe('https://backend.example');
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('logs the address it was built with, so a wrong build is easy to spot in the console', async () => {
    vi.stubEnv('VITE_BACKEND_API_URL', 'https://backend.example');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await import('./api');

    expect(log).toHaveBeenCalledWith('Frontend API Base URL:', 'https://backend.example');
  });
});
