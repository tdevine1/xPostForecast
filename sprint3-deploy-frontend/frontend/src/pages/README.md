# Frontend Pages README (`src/pages`)

This folder contains **route-level React components**. Each page handles navigation, calls to the backend, and high-level UI composition using components from `src/components`.

> This README applies to `sprint2-login-backend/frontend/src/pages`.

---

## 🧭 Route Map (Sprint 2)

| Route | Page | Purpose |
|------|------|---------|
| `/login`   | `Login.jsx`    | Authenticate user via **cookie-based login** (`/auth/login`). |
| `/register`| `Register.jsx` | Create account with **email, username, password** (`/auth/register`). |
| `/map`     | `MapPage.jsx`  | **Protected** page; displays map UI and supports logout (`/auth/logout`). |

Page access is controlled by `App.jsx`, which verifies the session using `GET /auth/test` and sets the global `authenticated` flag.

---

## 📄 Pages

### 1) `Login.jsx`
Interactive form that sends credentials to the backend and relies on the server to set a secure **HTTP-only cookie**.

**Key Behaviors**
- POST `${VITE_API_URL}/auth/login` with `{ username, password }`.
- Use `withCredentials: true` (Axios) so the browser accepts the cookie.
- On success, updates global auth state via `setAuthenticated(true)` and navigates to `/map`.

**Common Pitfalls**
- Missing `withCredentials: true` → cookie won’t be accepted.
- Wrong route (`/login` vs `/auth/login`). Always include `/auth` prefix.

---

### 2) `Register.jsx`
Form for new users to create accounts.

**Key Behaviors**
- POST `${VITE_API_URL}/auth/register` with `{ email, username, password }`.
- On success, navigate to `/login`.

**Backend Requirements**
- `users` table has columns: `email (unique)`, `username (unique)`, `password_hash`.
- Route returns `201 Created` + `{ message: "User registered successfully" }`.

**Common Pitfalls**
- DB schema missing `email` → `ER_NO_DEFAULT_FOR_FIELD 'email'`.
- Not validating inputs before request.

---

### 3) `MapPage.jsx`
**Protected** view. Demonstrates the pattern for calling protected endpoints and logging out with the cookie approach.

**Key Behaviors**
- Calls app-provided handlers (e.g., `fetchTemperatureData`) and renders components such as `DateSelector` and `MapComponent`.
- Calls `POST ${VITE_API_URL}/auth/logout` to clear the cookie.
- If a protected request returns `401/403`, **clear auth state and redirect to `/login`**.

**Example Protected Call (pattern)**
```js
try {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/protected`, { withCredentials: true });
  // handle res.data
} catch (err) {
  if (err?.response?.status === 401 || err?.response?.status === 403) {
    setAuthenticated(false);
    navigate('/login', { replace: true });
  }
}
```
## 📚 References
- React Router: https://reactrouter.com/
- Axios: https://axios-http.com/
- MDN CORS: https://developer.mozilla.org/docs/Web/HTTP/CORS
- MDN Cookies: https://developer.mozilla.org/docs/Web/HTTP/Cookies
