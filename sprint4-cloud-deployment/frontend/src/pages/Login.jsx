/**
 * Login.js
 * 
 * This component provides a login form that authenticates the user.
 * Upon successful login, it updates the authentication state and navigates to the map page.
 *
 * NOTE:
 * - Backend issues an HTTP-only cookie on successful login.
 * - We must send requests with `withCredentials: true` so the browser accepts the cookie.
 * - The backend routes are mounted at `/auth/*`, so use `/auth/login` here.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

/**
 * Login component allows users to enter credentials to access the app.
 * @param {Function} setAuthenticated - Function to update the app's authentication state.
 * @returns {JSX.Element} The login form.
 */
const Login = ({ setAuthenticated }) => {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const navigate                  = useNavigate();

  /**
   * handleSubmit
   * 
   * Handles form submission by sending credentials to the backend for verification.
   * Updates authentication state and navigates to the map page upon success.
   * 
   * @param {Object} e - Event object from the form submission.
   * @async
   * @function
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

  console.log('Sending Login Request to:', `${api.defaults.baseURL}/auth/login`);
    try {
      const res = await api.post(`${api.defaults.baseURL}/auth/login`, { username, password });
      // Backend returns 200 + { message: 'Login successful' } on success
      if (res.status === 200) {
        setAuthenticated(true);
        // Redirect to the app’s main page (Map). Use `/map` to skip extra redirect hops.
        navigate('/map', { replace: true });
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      // Common causes:
      // - 401 Invalid credentials
      // - CORS / cookie not accepted (check FRONTEND_URL, credentials:true on server, withCredentials here)
      // - Backend not running or wrong URL
      console.error('Login failed:', error);
      alert('Invalid credentials or unable to reach the server.');
      setAuthenticated(false);
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

      {/* Link to the Register page */}
      <p style={{ marginTop: '10px' }}>
        Don’t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
