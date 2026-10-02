# `routes/`

Express routers. Each file is mounted at a path in `app.js`.

## `auth.js` (mounted at `/auth`)

| Route | Method | Body | Response |
|---|---|---|---|
| `/auth/register` | POST | `{ email, username, password }` | `201 { message }`; `400` missing field or password under 8 characters; `409` username or email taken |
| `/auth/login` | POST | `{ username, password }` | `200 { message }` and sets the `token` cookie; `400` missing field; `401 { error: 'Invalid credentials' }` |
| `/auth/test` | GET | — | `200 { ok: true, user: { id, username } }`; `401` from `authMiddleware` |
| `/auth/logout` | POST | — | `200 { message: 'Logged out' }` and clears the cookie |

How the pieces fit:

- **Register** hashes the password with `bcrypt.hash(password, 10)` and inserts `username, email, password_hash`. A duplicate triggers MySQL's `ER_DUP_ENTRY`, which becomes `409`.
- **Login** looks the user up by username and checks the password with `bcrypt.compare()`. It gives the same `401` for an unknown user and a wrong password, so the endpoint can't be used to discover usernames. On success it signs a JWT (`{ id, username }`, 1-hour expiry) and sets it as a cookie:

  ```js
  res.cookie('token', token, { ...authCookieOptions(), maxAge: SESSION_MS });
  ```

  The token is never put in the response body.
- **Test** is protected by `authMiddleware`; the frontend calls it on page load.
- **Logout** calls `res.clearCookie('token', authCookieOptions())`. The options must match the ones used to set the cookie or the browser won't clear it.
- **Register** and **login** are rate-limited to 20 requests per IP per 15 minutes.

Frontend flow:

```text
Register.jsx  → POST /auth/register → row inserted
Login.jsx     → POST /auth/login    → cookie set
App.jsx       → GET  /auth/test     → session checked on every page load
MapPage.jsx   → GET  /temperature/:date → map points (Sprint 3)
MapPage.jsx   → POST /auth/logout   → cookie cleared
```

## `stac.js` (mounted at `/temperature`, behind `authMiddleware`)

| Route | Method | Response |
|---|---|---|
| `/temperature/:date` | GET | `200 [{ lat, lon, tavg }, …]` (°F); `400` bad date; `401` not logged in; `404` no data for that month; `502` Planetary Computer unavailable |

Steps: check the in-memory cache → STAC search for the `noaa-nclimgrid-monthly` item covering the month → take the item's `tavg` asset (by name) → sign its URL with `sign/sign.js` → download the GeoTIFF and read the West Virginia window with `geotiff` → convert each cell center inside the bounding box to a point in °F → cache and return. See [`../README.md`](../README.md) for the full walkthrough.

References: [Express routing](https://expressjs.com/en/guide/routing.html) · [bcryptjs](https://github.com/dcodeIO/bcrypt.js) · [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
