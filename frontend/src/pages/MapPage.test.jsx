/**
 * Tests for the map page's other paths: no month chosen, a failed request, and logging out.
 * (The happy path and the expired session are covered in App.test.jsx.)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../api';
import MapPage from './MapPage';

vi.mock('../api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

// The real map needs a browser; this placeholder just reports how many points it got
vi.mock('../components/MapComponent', () => ({
  default: ({ temperatures }) => <div>map with {temperatures.length} points</div>,
}));

function renderMapPage(setAuthenticated = vi.fn()) {
  render(
    <MemoryRouter initialEntries={['/map']}>
      <Routes>
        <Route path="/map" element={<MapPage setAuthenticated={setAuthenticated} />} />
        <Route path="/login" element={<p>the login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return setAuthenticated;
}

function chooseJuly2020() {
  fireEvent.change(screen.getByLabelText(/month/i), { target: { value: '07' } });
  fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2020' } });
}

const clickFetch = () => fireEvent.click(screen.getByRole('button', { name: /fetch data/i }));

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  api.get.mockReset();
  api.post.mockReset();
});

describe('MapPage', () => {
  it('asks for a month and year before calling the backend', () => {
    renderMapPage();

    clickFetch();

    expect(screen.getByRole('alert').textContent).toMatch(/select a month and year/i);
    expect(api.get).not.toHaveBeenCalled();
  });

  it('clears the map and explains when the backend cannot be reached', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error')); // no `response`
    renderMapPage();

    chooseJuly2020();
    clickFetch();

    expect((await screen.findByRole('alert')).textContent).toMatch(/could not reach the server/i);
    expect(screen.getByText('map with 0 points')).toBeTruthy();
  });

  it('clears an earlier error when the next fetch works', async () => {
    api.get.mockRejectedValueOnce(Object.assign(new Error('HTTP 502'), { response: { status: 502, data: { error: 'The temperature data service is unavailable.' } } }));
    renderMapPage();
    chooseJuly2020();
    clickFetch();
    await screen.findByRole('alert');

    api.get.mockResolvedValueOnce({ data: [{ lat: 38, lon: -80, tavg: 70 }] });
    clickFetch();

    expect(await screen.findByText('map with 1 points')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('logs out through the backend and returns to the login page', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    const setAuthenticated = renderMapPage();

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(await screen.findByText('the login page')).toBeTruthy();
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(setAuthenticated).toHaveBeenCalledWith(false);
  });

  it('still logs out on this side when the logout request fails', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error'));
    const setAuthenticated = renderMapPage();

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(await screen.findByText('the login page')).toBeTruthy();
    await waitFor(() => expect(setAuthenticated).toHaveBeenCalledWith(false));
  });
});
