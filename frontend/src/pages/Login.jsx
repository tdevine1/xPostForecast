/**
 * Login.jsx
 *
 * Login form. On success the backend sets an HTTP-only cookie; we then mark
 * the app as authenticated and go to the map page.
 *
 * NOTE:
 * - Requests must use `withCredentials: true` so the browser stores the cookie.
 * - Backend auth routes are mounted at `/auth/*`, so the URL is `/auth/login`.
 */

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// Base URL of the backend (e.g., http://localhost:5175), from frontend/.env
const API_URL = import.meta.env.VITE_BACKEND_API_URL;

/**
 * Login component allows users to enter credentials to access the app.
 * @param {Function} setAuthenticated - Updates the app's authentication state.
 * @returns {JSX.Element} The login form.
 */
const Login = ({ setAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  /**
   * Sends the credentials to the backend; on success, goes to the map page.
   * @param {Object} e - Form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/auth/login`,
        { username, password },
        { withCredentials: true } // lets the browser store the HTTP-only cookie
      );

      // axios only gets here for 2xx responses; errors jump to catch
      setAuthenticated(true);
      navigate('/map', { replace: true });
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Invalid credentials');
      } else {
        // No response at all usually means the backend isn't running, the URL
        // is wrong, or CORS blocked the request (check the browser console)
        console.error('Login failed:', error);
        alert(error.response?.data?.error ?? 'Unable to reach the server. Is the backend running?');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: '10px' }}>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
