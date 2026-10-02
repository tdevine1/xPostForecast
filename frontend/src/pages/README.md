# `src/pages/`

Route-level components: one per URL. Pages call the backend (always through the shared client in `src/api.js`), manage page state, and combine components from `src/components/`.

## Route map

| Route | Page | Access |
|------|------|--------|
| `/login` | `Login.jsx` | Logged-out users (logged-in users are redirected to `/map`) |
| `/register` | `Register.jsx` | Logged-out users |
| `/map` | `MapPage.jsx` | **Logged-in users only** (others are redirected to `/login`) |

`App.jsx` decides who counts as logged in by calling `GET /auth/test` once on startup.

## `Login.jsx`

- `api.post('/auth/login', { username, password })`. The shared client sets `withCredentials: true`, so the browser stores the HTTP-only cookie.
- Success: `setAuthenticated(true)` and navigate to `/map`.
- `401`: alert "Invalid credentials". Other failures: alert the backend's error, or a "can't reach the server" message.

## `Register.jsx`

- `api.post('/auth/register', { email, username, password })`.
- Success (`201`): alert, then navigate to `/login`.
- Failure: alert the backend's error message (`400` invalid input, `409` username or email taken).

## `MapPage.jsx`

- Renders `DateSelector`, an error message (if any), the loading spinner, and `MapComponent`.
- **Fetch Data**: `` api.get(`/temperature/${date}`) ``.
  - Success: the returned `{ lat, lon, tavg }` array goes to `MapComponent`.
  - `401`: the session expired, so `setAuthenticated(false)` and navigate to `/login`.
  - Other errors: clear the map and show the backend's `error` text (`404` no data for that month, `502` service unavailable), or "Could not reach the server".
- **Logout**: `api.post('/auth/logout')`, then `setAuthenticated(false)` and navigate to `/login`, even if the request fails, so the user is never stuck.

References: [React Router](https://reactrouter.com/) · [Axios request config](https://axios-http.com/docs/req_config)
