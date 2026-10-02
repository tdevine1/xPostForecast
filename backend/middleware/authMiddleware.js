/**
 * middleware/authMiddleware.js
 *
 * Protects routes: only requests carrying a valid JWT in the `token` cookie
 * get through. Requires cookie-parser to run first (see app.js).
 */
import jwt from 'jsonwebtoken';

/**
 * Express middleware that verifies the JWT cookie.
 * On success, attaches the decoded payload ({ id, username }) as req.user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};

export default authMiddleware;
