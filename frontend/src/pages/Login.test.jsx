/**
 * Tests for the login form. The backend is replaced with a mock of the shared `api` client.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../api';
import Login from './Login';

vi.mock('../api', () => ({ default: { post: vi.fn() } }));

/** Builds the error axios throws for an HTTP error response. */
const httpError = (status, error) => Object.assign(new Error(`HTTP ${status}`), { response: { status, data: { error } } });

function renderLogin(setAuthenticated = vi.fn()) {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login setAuthenticated={setAuthenticated} />} />
        <Route path="/map" element={<p>the map page</p>} />
        <Route path="/register" element={<p>the register page</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return setAuthenticated;
}

function submitCredentials() {
  fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'alice' } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'correct-horse' } });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
}

beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  api.post.mockReset();
});

describe('Login', () => {
  it('sends the credentials, marks the user logged in, and goes to the map', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    const setAuthenticated = renderLogin();

    submitCredentials();

    expect(await screen.findByText('the map page')).toBeTruthy();
    expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'alice', password: 'correct-horse' });
    expect(setAuthenticated).toHaveBeenCalledWith(true);
  });

  it('says "Invalid credentials" for a 401 and stays on the form', async () => {
    api.post.mockRejectedValueOnce(httpError(401, 'Invalid credentials'));
    const setAuthenticated = renderLogin();

    submitCredentials();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Invalid credentials'));
    expect(setAuthenticated).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: /login/i })).toBeTruthy();
  });

  it("shows the backend's message for other errors", async () => {
    api.post.mockRejectedValueOnce(httpError(429, 'Too many attempts. Please wait 15 minutes and try again.'));
    renderLogin();

    submitCredentials();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Too many attempts. Please wait 15 minutes and try again.'));
  });

  it('explains when the backend cannot be reached at all', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error')); // no `response`
    renderLogin();

    submitCredentials();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/unable to reach the server/i)));
  });

  it('links to the registration page', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('link', { name: /register here/i }));
    expect(screen.getByText('the register page')).toBeTruthy();
  });
});
