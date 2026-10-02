/**
 * Tests that App waits for the session check and routes accordingly.
 * The backend is replaced with a stubbed global fetch.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';

// The real map needs a browser; a placeholder keeps these tests about routing
vi.mock('./components/MapComponent', () => ({ default: () => <div>map</div> }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

describe('App session check', () => {
  it('stays on /map after a refresh when the session cookie is valid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    window.history.replaceState(null, '', '/map');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /historical monthly average/i })).toBeTruthy();
    expect(window.location.pathname).toBe('/map');
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/test$/), { credentials: 'include' });
  });

  it('sends a logged-out user from /map to /login', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }));
    window.history.replaceState(null, '', '/map');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /login/i })).toBeTruthy();
    expect(window.location.pathname).toBe('/login');
  });
});
