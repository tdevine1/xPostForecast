/**
 * Register.js
 * 
 * This component provides a registration form for new users. It sends 
 * the registration details to the backend, and if successful, redirects to the login page.
 *
 * NOTE:
 * - Backend routes are mounted at `/auth/*`, so use `/auth/register` here.
 * - `withCredentials: true` is fine to include (even though register may not set cookies).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/**
 * Register component allows new users to create an account.
 * @returns {JSX.Element} The registration form.
 */
const Register = () => {
  const [email, setEmail]       = useState('');   // <-- add email state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

   /**
   * Handles form submission by sending registration details to the backend.
   * @param {Object} e - Event object from the form submission.
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    // Simple input guards to reduce 400s from the backend
    if (!email || !username || !password) {
      alert('Please enter an email, username, and password.');
      return;
    }

    try {
      console.log('Attempting to post to', REGISTER_URL);
      const res = await api.post('/auth/register', { email, username, password });    
      // Backend typically responds with 201 + { message: 'User registered successfully' }
      if (response.status === 201) {
        alert('Registration successful. Please log in.');
        navigate('/login', { replace: true });
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      // Common causes:
      // - Duplicate username/email (unique constraint)
      // - Backend URL mismatch or server not running
      // - CORS misconfiguration
      console.error('Registration failed:', error);
      alert('Error registering user. Please try a different email/username or try again later.');
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px' }}>
      <h2>Register</h2>
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
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
