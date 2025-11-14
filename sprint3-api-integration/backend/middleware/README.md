# Middleware README

## Purpose
Middleware provides **JWT verification** for protected routes using cookies. 
It ensures that only authenticated users can access specific endpoints.

## File: `authMiddleware.js`
### Responsibilities
- Extract JWT token from cookies
- Verify it using `process.env.JWT_SECRET`
- Attach decoded user info to `req.user`
- Return `401` or `403` for unauthorized access

Example:
```js
const token = req.cookies.token;
if (!token) return res.status(403).json({ error: 'Access denied' });

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
} catch {
  res.status(401).json({ error: 'Invalid token' });
}
```

## Requirements
- `cookie-parser` middleware must be applied before this in `server.js`
```js
import cookieParser from 'cookie-parser';
app.use(cookieParser());
```
