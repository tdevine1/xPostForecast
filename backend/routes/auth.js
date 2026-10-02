/**
 * routes/auth.js
 *
 * Authentication routes, mounted at /auth in app.js:
 *   POST /auth/register  create an account (password is hashed before storage)
 *   POST /auth/login     check credentials, set the JWT in an HTTP-only cookie
 *   GET  /auth/test      report whether the cookie holds a valid session
 *   POST /auth/logout    clear the cookie
 *
 * Requires JWT_SECRET (see .env.example) and cookie-parser + CORS with
 * credentials enabled in app.js.
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import pool from '../config/database.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authCookieOptions } from '../config/cookies.js';

const router = express.Router();

const MIN_PASSWORD_LENGTH = 8;
const SESSION_MS = 60 * 60 * 1000; // 1 hour, used for both the JWT and the cookie

// Slow down password guessing: at most 20 login/register attempts per IP per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait 15 minutes and try again.' },
});

/**
 * Registers a new user.
 * @route POST /auth/register
 * @body {string} email
 * @body {string} username
 * @body {string} password - at least 8 characters; stored only as a bcrypt hash
 * @returns 201 on success, 400 on bad input, 409 if the username or email is taken
 */
router.post('/register', authLimiter, async (req, res) => {
  // req.body is undefined unless the request was sent as JSON
  const { email, username, password } = req.body ?? {};
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'email, username, and password are required' });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  try {
    // Hash with a work factor of 10 (each +1 doubles the time to compute)
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // The UNIQUE constraints on username and email reject duplicates
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That username or email is already registered' });
    }
    console.error('Error during user registration:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * Logs a user in and sets the JWT as an HTTP-only cookie named `token`.
 * @route POST /auth/login
 * @body {string} username
 * @body {string} password
 * @returns 200 on success, 400 on missing input, 401 on wrong credentials
 */
router.post('/login', authLimiter, async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );
    const user = rows[0];

    // Same response whether the username or the password is wrong,
    // so attackers can't use this endpoint to discover usernames
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Keep the JWT payload minimal: it is signed, not encrypted
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: SESSION_MS / 1000 }
    );

    // httpOnly: page JavaScript can't read the cookie (limits damage from XSS).
    // See config/cookies.js for SameSite/Secure in development vs production.
    res.cookie('token', token, { ...authCookieOptions(), maxAge: SESSION_MS });

    // The token travels only in the cookie, never in the response body
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * Reports whether the request carries a valid session cookie.
 * The frontend calls this on page load to decide what to show.
 * @route GET /auth/test
 * @returns 200 { ok: true, user: { id, username } }, or 401 from authMiddleware
 */
router.get('/test', authMiddleware, (req, res) => {
  res.json({ ok: true, user: { id: req.user.id, username: req.user.username } });
});

/**
 * Logs out by clearing the cookie (options must match the ones used to set it).
 * @route POST /auth/logout
 */
router.post('/logout', (_req, res) => {
  res.clearCookie('token', authCookieOptions());
  res.json({ message: 'Logged out' });
});

export default router;
