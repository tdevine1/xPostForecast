/**
 * Tests for the registration form. The backend is replaced with a mock of the shared `api` client.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../api';
import Register from './Register';

vi.mock('../api', () => ({ default: { post: vi.fn() } }));

/** Builds the error axios throws for an HTTP error response. */
const httpError = (status, error) => Object.assign(new Error(`HTTP ${status}`), { response: { status, data: { error } } });

function renderRegister() {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<p>the login page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fill({ email = 'alice@example.com', username = 'alice', password = 'correct-horse' } = {}) {
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: username } });
  fireEvent.change(screen.getByPlaceholderText(/^Password/), { target: { value: password } });
}

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Register' }));

beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  api.post.mockReset();
});

describe('Register', () => {
  it('sends the details and goes to the login page', async () => {
    api.post.mockResolvedValueOnce({ data: { ok: true } });
    renderRegister();

    fill();
    submit();

    expect(await screen.findByText('the login page')).toBeTruthy();
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'alice@example.com',
      username: 'alice',
      password: 'correct-horse',
    });
    expect(window.alert).toHaveBeenCalledWith('Registration successful. Please log in.');
  });

  it('does not bother the server when a field is empty', () => {
    renderRegister();

    fill({ username: '' });
    fireEvent.submit(screen.getByRole('button', { name: 'Register' }).closest('form'));

    expect(window.alert).toHaveBeenCalledWith('Please enter an email, username, and password.');
    expect(api.post).not.toHaveBeenCalled();
  });

  it("shows the backend's explanation when the username or email is taken", async () => {
    api.post.mockRejectedValueOnce(httpError(409, 'That username or email is already registered'));
    renderRegister();

    fill();
    submit();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('That username or email is already registered'));
    expect(screen.getByRole('heading', { name: /register/i })).toBeTruthy();
  });

  it('explains when the backend cannot be reached at all', async () => {
    api.post.mockRejectedValueOnce(new Error('Network Error'));
    renderRegister();

    fill();
    submit();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/unable to reach the server/i)));
  });

  it('links back to the login page', () => {
    renderRegister();
    fireEvent.click(screen.getByRole('link', { name: /log in/i }));
    expect(screen.getByText('the login page')).toBeTruthy();
  });
});
