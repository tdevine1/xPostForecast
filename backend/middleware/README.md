# `middleware/`

## `authMiddleware.js`

Protects routes so only logged-in users can reach them. It:

1. Reads the JWT from the `token` cookie (`cookie-parser` must run first; see `app.js`)
2. Verifies it with `JWT_SECRET` (HS256 only)
3. On success, puts the decoded payload `{ id, username }` on `req.user` and calls `next()`
4. Otherwise responds `401` (`Not logged in` if there's no cookie, `Invalid or expired session` if verification fails)

Use it on any route that requires login:

```js
import authMiddleware from '../middleware/authMiddleware.js';

router.get('/test', authMiddleware, (req, res) => {
  res.json({ ok: true, user: { id: req.user.id, username: req.user.username } });
});
```

In Sprint 2 it protects `GET /auth/test`.

References: [Express: using middleware](https://expressjs.com/en/guide/using-middleware.html) · [Introduction to JWTs](https://jwt.io/introduction)
