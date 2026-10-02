# `src/pages/`

Route-level components: one per URL. Pages call the backend, manage page state, and combine components from `src/components/`.

## Route map

| Route | Page | Access |
|------|------|--------|
| `/login` | `Login.jsx` | Logged-out users (logged-in users are redirected to `/map`) |
| `/register` | `Register.jsx` | Logged-out users |
| `/map` | `MapPage.jsx` | **Logged-in users only** (others are redirected to `/login`) |

`App.jsx` decides who counts as logged in by calling `GET /auth/test` once on startup.

## `Login.jsx`

- `POST ${VITE_BACKEND_API_URL}/auth/login` with `{ username, password }` and `withCredentials: true`, so the browser stores the HTTP-only cookie.
- Success: `setAuthenticated(true)` and navigate to `/map`.
- `401`: alert "Invalid credentials". Other failures: alert the backend's error, or a "can't reach the server" message.

## `Register.jsx`

- `POST ${VITE_BACKEND_API_URL}/auth/register` with `{ email, username, password }`.
- Success (`201`): alert, then navigate to `/login`.
- Failure: alert the backend's error message (`400` invalid input, `409` username or email taken).

## `MapPage.jsx`

- Renders `DateSelector` and `MapComponent`.
- **Logout**: `POST /auth/logout` with `withCredentials: true`, then `setAuthenticated(false)` and navigate to `/login`. It logs out on the frontend even if the request fails, so the user is never stuck.
- **Fetch Data**: still a stub in Sprint 2 (logs the chosen date to the console).

References: [React Router](https://reactrouter.com/) · [Axios request config](https://axios-http.com/docs/req_config)
