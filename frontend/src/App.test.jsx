/**
 * Tests for the session check (App) and the data fetch (MapPage).
 * The backend is replaced with a mock of the shared `api` client.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import api from './api';
import App from './App';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

// The real map needs a browser; this placeholder just reports how many points it got
vi.mock('./components/MapComponent', () => ({
  default: ({ temperatures }) => <div>map with {temperatures.length} points</div>,
}));

/** Builds the error axios throws for an HTTP error response. */
const httpError = (status, error) => Object.assign(new Error(`HTTP ${status}`), { response: { status, data: { error } } });

/** Starts the app logged in, on /map. */
async function renderLoggedInMap() {
  api.get.mockResolvedValueOnce({ data: { ok: true } }); // GET /auth/test
  window.history.replaceState(null, '', '/map');
  render(<App />);
  await screen.findByRole('heading', { name: /historical monthly average/i });
}

/** Chooses July 2020 and clicks Fetch Data. */
function fetchJuly2020() {
  fireEvent.change(screen.getByLabelText(/month/i), { target: { value: '07' } });
  fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2020' } });
  fireEvent.click(screen.getByRole('button', { name: /fetch data/i }));
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  window.history.replaceState(null, '', '/');
});

describe('App session check', () => {
  it('stays on /map after a refresh when the session cookie is valid', async () => {
    await renderLoggedInMap();
    expect(window.location.pathname).toBe('/map');
    expect(api.get).toHaveBeenCalledWith('/auth/test');
  });

  it('sends a logged-out user from /map to /login', async () => {
    api.get.mockRejectedValueOnce(httpError(401, 'Not logged in'));
    window.history.replaceState(null, '', '/map');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /login/i })).toBeTruthy();
    expect(window.location.pathname).toBe('/login');
  });
});

describe('MapPage data fetch', () => {
  it('requests the chosen month and passes the points to the map', async () => {
    await renderLoggedInMap();
    api.get.mockResolvedValueOnce({ data: [{ lat: 38, lon: -80, tavg: 70 }, { lat: 39, lon: -80, tavg: 71 }] });

    fetchJuly2020();

    expect(await screen.findByText('map with 2 points')).toBeTruthy();
    expect(api.get).toHaveBeenLastCalledWith('/temperature/2020-07-01');
  });

  it("shows the backend's message when a month has no data", async () => {
    await renderLoggedInMap();
    api.get.mockRejectedValueOnce(httpError(404, 'No temperature data is available for 2020-07'));

    fetchJuly2020();

    expect((await screen.findByRole('alert')).textContent).toMatch(/no temperature data/i);
  });

  it('returns to /login when the session has expired', async () => {
    await renderLoggedInMap();
    api.get.mockRejectedValueOnce(httpError(401, 'Invalid or expired session'));

    fetchJuly2020();

    expect(await screen.findByRole('heading', { name: /login/i })).toBeTruthy();
    expect(window.location.pathname).toBe('/login');
  });
});
