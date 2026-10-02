/**
 * Register.jsx
 *
 * Registration form for new users. On success, sends the user to the login page.
 *
 * NOTE: requests go through the shared `api` client (src/api.js).
 */

import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Register component allows new users to create an account.
 * @returns {JSX.Element} The registration form.
 */
const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  /**
   * Sends the registration details to the backend.
   * @param {Object} e - Form submit event.
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    // Check the obvious things before bothering the server
    if (!email || !username || !password) {
      alert('Please enter an email, username, and password.');
      return;
    }

    try {
      await api.post('/auth/register', { email, username, password });
      alert('Registration successful. Please log in.');
      navigate('/login', { replace: true });
    } catch (error) {
      // The backend explains 400 (bad input) and 409 (username/email taken) in `error`
      console.error('Registration failed:', error);
      alert(error.response?.data?.error ?? 'Unable to reach the server. Is the backend running?');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password (at least 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
        />
        <button type="submit">Register</button>
      </form>

      <p style={{ marginTop: '10px' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
